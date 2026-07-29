"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getCurrentWorkspace, hasPermission } from "@/lib/serverAuth";
import { recordProjectEvent } from "./projectEventActions";
import { recordAuditLog } from "./auditActions";

// ==========================================
// GET (Consultas)
// ==========================================
export async function getProjects() {
  try {
    const { workspace } = await getCurrentWorkspace();
    const projects = await prisma.project.findMany({
      where: { workspaceId: workspace.id },
      include: {
        client: true,
        tasks: true,
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
    const { workspace } = await getCurrentWorkspace();
    const project = await prisma.project.findUnique({
      where: { id, workspaceId: workspace.id },
      include: { client: true, tasks: true },
    });
    if (!project) throw new Error("Project not found or unauthorized");
    return { success: true, data: project };
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
        name: data.name,
        code: data.code,
        description: data.description,
        category: data.category,
        clientId: data.clientId,
        technologies: data.technologies,
        estimatedHours: data.estimatedHours,
        bannerUrl: data.bannerUrl,
        status: data.status,
        workspaceId: workspace.id,
      },
    });

    if (data.initialTasks && data.initialTasks.length > 0) {
      await prisma.task.createMany({
        data: data.initialTasks.map((title) => ({
          projectId: newProject.id,
          title,
          status: "BACKLOG",
          priority: "MEDIUM",
        })),
      });
    }

    await recordProjectEvent(newProject.id, userId, "CREATED", "Proyecto creado", { status: newProject.status });
    await recordAuditLog(userId, "CREATE_PROJECT", "Creó un proyecto", `Proyecto: ${newProject.name}`, { after: { name: newProject.name, status: newProject.status } });

    revalidatePath("/proyectos");
    return { success: true, data: newProject };
  } catch (error: any) {
    console.error("Error creating project:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// PUT/PATCH (Edición)
// ==========================================
export async function updateProject(id: string, data: Partial<any>) {
  try {
    const { workspace, role, user } = await getCurrentWorkspace();
    const userId = (user as any).id;
    if (!hasPermission(role, "MANAGER")) throw new Error("UNAUTHORIZED_ROLE");

    // First ensure the project belongs to the workspace
    const existing = await prisma.project.findUnique({ where: { id, workspaceId: workspace.id } });
    if (!existing) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const updatedProject = await prisma.project.update({
      where: { id },
      data,
    });

    if (existing.status !== updatedProject.status) {
      await recordProjectEvent(updatedProject.id, userId, "STATUS_CHANGE", `Estado actualizado a ${updatedProject.status}`, { before: existing.status, after: updatedProject.status });
      await recordAuditLog(userId, "CHANGE_STATUS", "Cambió el estado del proyecto", `Proyecto: ${updatedProject.name}`, { before: { status: existing.status }, after: { status: updatedProject.status } });
    } else {
      await recordProjectEvent(updatedProject.id, userId, "UPDATED", "Proyecto actualizado", { updatedFields: Object.keys(data) });
      await recordAuditLog(userId, "UPDATE_PROJECT", "Editó la información del proyecto", `Proyecto: ${updatedProject.name}`, { updatedFields: Object.keys(data) });
    }

    revalidatePath("/proyectos");
    return { success: true, data: updatedProject };
  } catch (error: any) {
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
