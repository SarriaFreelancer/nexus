"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getCurrentUser, getCurrentWorkspace, hasPermission, getProjectAccessFilter } from "@/lib/serverAuth";
import { recordProjectEvent } from "./projectEventActions";
import { recordAuditLog } from "./auditActions";

// ==========================================
// GET (Consultas)
// ==========================================
export async function getProjects() {
  try {
    const { workspace, role, user, member } = await getCurrentWorkspace();
    const projectFilter = getProjectAccessFilter(user, member, role);

    const projects = await prisma.project.findMany({
      where: { 
        workspaceId: workspace.id,
        ...(projectFilter ? { AND: [projectFilter] } : {})
      },
      include: {
        client: true,
        workspace: {
          include: {
            members: {
              include: { user: true }
            }
          }
        },
        tasks: {
          include: { assignee: true }
        },
        versions: { where: { isCurrent: true } }
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: projects };
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return { success: false, error: error.message };
  }
}

export async function getProjectById(id: string) {
  try {
    const { user, workspace, member, role } = await getCurrentWorkspace();
    const userId = (user as any)?.id;
    const userEmail = (user as any)?.email;
    const isFullAdmin = role === "ADMIN" || (user as any)?.role === "SUPER_ADMIN";

    // 1. Intentar buscar el proyecto en el espacio activo actual
    let project = await prisma.project.findUnique({
      where: { id, workspaceId: workspace.id },
      include: { client: true, tasks: { include: { assignee: true } } },
    });

    if (project && !isFullAdmin) {
      let allowedIds: string[] = [];
      try {
        const raw = member.allowedProjectIds;
        allowedIds = Array.isArray(raw) ? (raw as string[]) : typeof raw === "string" ? JSON.parse(raw) : [];
      } catch (e) {
        allowedIds = [];
      }
      const isAllowed = allowedIds.includes(project.id) || project.tasks.some((t: any) => t.assigneeId === userId);
      if (!isAllowed) {
        project = null;
      }
    }

    // 2. Si no se puede acceder en el espacio activo, buscarlo en otros espacios donde el usuario tenga acceso permitido
    if (!project && userId) {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: userId },
            ...(userEmail ? [{ email: userEmail }] : [])
          ]
        }
      });
      const effectiveUserId = dbUser ? dbUser.id : userId;

      const userMemberships = await prisma.workspaceMember.findMany({
        where: { userId: effectiveUserId },
      });

      for (const m of userMemberships) {
        const p = await prisma.project.findUnique({
          where: { id, workspaceId: m.workspaceId },
          include: { client: true, tasks: { include: { assignee: true } } },
        });

        if (p) {
          let allowedIds: string[] = [];
          try {
            const raw = m.allowedProjectIds;
            allowedIds = Array.isArray(raw) ? (raw as string[]) : typeof raw === "string" ? JSON.parse(raw) : [];
          } catch (e) {
            allowedIds = [];
          }

          if (m.role === "ADMIN" || allowedIds.includes(p.id) || p.tasks.some((t: any) => t.assigneeId === effectiveUserId)) {
            project = p;
            const cookieStore = await cookies();
            cookieStore.set("active_workspace_id", m.workspaceId, { path: "/" });
            break;
          }
        }
      }
    }

    // 3. Si el usuario aún no tiene permiso registrado para este proyecto, invitar a unirse
    if (!project) {
      const publicProject = await prisma.project.findUnique({ where: { id } });
      if (publicProject) {
        return { success: false, requiresJoin: true, projectId: id, error: "REQUIRES_JOIN" };
      }
      throw new Error("Project not found or unauthorized");
    }

    return { success: true, data: project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getProjectPublicInfo(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: true }
    });
    if (!project) throw new Error("Proyecto no encontrado");

    return {
      success: true,
      data: {
        id: project.id,
        name: project.name,
        code: project.code,
        category: project.category,
        description: project.description,
        bannerUrl: project.bannerUrl,
        workspaceName: project.workspace.name,
        workspaceId: project.workspaceId
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function acceptProjectInvitation(projectId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || !(user as any).id) throw new Error("Debes iniciar sesión para unirte al proyecto");

    const userId = (user as any).id;
    const userEmail = (user as any).email;

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      }
    });

    const effectiveUserId = dbUser ? dbUser.id : userId;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: true }
    });

    if (!project) throw new Error("El proyecto no existe o el enlace es inválido");

    // Verificar o crear la membresía de espacio restringida a este proyecto
    let existingMember = await prisma.workspaceMember.findFirst({
      where: { userId: effectiveUserId, workspaceId: project.workspaceId }
    });

    if (!existingMember) {
      existingMember = await prisma.workspaceMember.create({
        data: {
          userId: effectiveUserId,
          workspaceId: project.workspaceId,
          role: "DEVELOPER",
          allowedProjectIds: [projectId]
        }
      });
    } else {
      let allowedIds: string[] = [];
      try {
        const raw = existingMember.allowedProjectIds;
        allowedIds = Array.isArray(raw) ? (raw as string[]) : typeof raw === "string" ? JSON.parse(raw) : [];
      } catch (e) {
        allowedIds = [];
      }

      if (!allowedIds.includes(projectId)) {
        allowedIds.push(projectId);
        await prisma.workspaceMember.update({
          where: { id: existingMember.id },
          data: {
            allowedProjectIds: allowedIds
          }
        });
      }
    }

    // Establecer la cookie del espacio del proyecto compartido
    const cookieStore = await cookies();
    cookieStore.set("active_workspace_id", project.workspaceId, { path: "/" });

    revalidatePath("/proyectos");
    revalidatePath(`/proyectos/${projectId}`);

    return { success: true, projectId: project.id, workspaceName: project.workspace.name };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// POST (Creación)
// ==========================================
export async function createProject(data: {
  name: string;
  code: string;
  description?: string;
  category: string;
  clientId?: string;
  technologies: any; // JSON
  estimatedHours?: number;
  bannerUrl?: string;
  status?: any;
  initialTasks?: string[]; // Titles of initial tasks
}) {
  try {
    const { workspace, role, user } = await getCurrentWorkspace();
    const userId = (user as any).id;
    if (!hasPermission(role, "MANAGER")) throw new Error("UNAUTHORIZED_ROLE");

    const newProject = await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description,
        category: data.category,
        technologies: typeof data.technologies === "string" ? data.technologies : JSON.stringify(data.technologies),
        estimatedHours: data.estimatedHours || 0,
        bannerUrl: data.bannerUrl,
        status: data.status || "DISCOVERY",
        clientId: data.clientId || null,
      },
    });

    if (data.initialTasks && data.initialTasks.length > 0) {
      for (const t of data.initialTasks) {
        let title = t;
        let status = "PENDING";
        try {
          const parsed = JSON.parse(t);
          title = parsed.title;
          status = parsed.status || "PENDING";
        } catch (e) {}

        await prisma.task.create({
          data: {
            projectId: newProject.id,
            title: title,
            status: status as any,
            priority: "MEDIUM",
            assigneeId: userId,
          },
        });
      }
    }

    await recordProjectEvent(newProject.id, userId, "PROJECT_CREATED", `Se creó el proyecto ${newProject.name} (${newProject.code})`);
    await recordAuditLog(userId, "CREATE_PROJECT", `Creó el proyecto ${newProject.name}`, `Categoría: ${newProject.category}`);

    revalidatePath("/proyectos");
    return { success: true, data: newProject };
  } catch (error: any) {
    console.error("Error creating project:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// PUT (Actualización)
// ==========================================
export async function updateProject(id: string, data: Partial<{
  name: string;
  code: string;
  description: string;
  category: string;
  status: any;
  bannerUrl: string;
  estimatedHours: number;
  clientId: string;
  technologies: any;
}>) {
  try {
    const { workspace, role, user } = await getCurrentWorkspace();
    const userId = (user as any).id;
    if (!hasPermission(role, "DEVELOPER")) throw new Error("UNAUTHORIZED_ROLE");

    const existing = await prisma.project.findUnique({ where: { id, workspaceId: workspace.id } });
    if (!existing) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code.toUpperCase() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.status && { status: data.status }),
        ...(data.bannerUrl !== undefined && { bannerUrl: data.bannerUrl }),
        ...(data.estimatedHours !== undefined && { estimatedHours: Number(data.estimatedHours) }),
        ...(data.clientId !== undefined && { clientId: data.clientId || null }),
        ...(data.technologies !== undefined && { 
          technologies: typeof data.technologies === "string" ? data.technologies : JSON.stringify(data.technologies) 
        }),
      },
    });

    if (data.status && data.status !== existing.status) {
      await recordProjectEvent(id, userId, "STATUS_CHANGE", `Cambió el estado del proyecto de ${existing.status} a ${data.status}`);
    }

    await recordAuditLog(userId, "UPDATE_PROJECT", `Actualizó el proyecto ${updatedProject.name}`, `Campos actualizados: ${Object.keys(data).join(", ")}`);

    revalidatePath("/proyectos");
    revalidatePath(`/proyectos/${id}`);
    return { success: true, data: updatedProject };
  } catch (error: any) {
    console.error("Error updating project:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// DELETE (Eliminación)
// ==========================================
export async function deleteProject(id: string) {
  try {
    const { workspace, role, user } = await getCurrentWorkspace();
    const userId = (user as any).id;
    if (!hasPermission(role, "ADMIN")) throw new Error("UNAUTHORIZED_ROLE");

    const existing = await prisma.project.findUnique({ where: { id, workspaceId: workspace.id } });
    if (!existing) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    await prisma.project.delete({
      where: { id },
    });

    await recordAuditLog(userId, "DELETE_PROJECT", "Eliminó un proyecto", `Proyecto: ${existing.name}`, { before: { name: existing.name, code: existing.code } });

    revalidatePath("/proyectos");
    return { success: true, message: "Project deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleStarProject(id: string) {
  try {
    const { workspace } = await getCurrentWorkspace();
    const existing = await prisma.project.findUnique({ where: { id, workspaceId: workspace.id } });
    if (!existing) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const updated = await prisma.project.update({
      where: { id },
      data: { isStarred: !existing.isStarred },
    });

    revalidatePath("/proyectos");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
