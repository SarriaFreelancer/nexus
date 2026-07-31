"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getCurrentWorkspace, getCurrentUser, hasPermission } from "@/lib/serverAuth";

export async function getUserWorkspaces() {
  try {
    const user = await getCurrentUser();
    if (!user || !(user as any).id) {
      return { success: false, error: "UNAUTHORIZED" };
    }

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

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: effectiveUserId },
      include: { workspace: true },
      orderBy: { workspace: { createdAt: "desc" } },
    });

    const cookieStore = await cookies();
    const activeCookie = cookieStore.get("active_workspace_id")?.value;

    const data = memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      role: m.role,
      isActive: activeCookie ? m.workspace.id === activeCookie : m.workspace.id === memberships[0]?.workspace.id,
    }));

    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching user workspaces:", error);
    return { success: false, error: error.message };
  }
}

export async function getWorkspaceMembers() {
  try {
    const { workspace } = await getCurrentWorkspace();

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatarUrl: true,
            globalRole: true,
            createdAt: true,
          },
        },
      },
      orderBy: { role: "asc" },
    });

    return { success: true, data: members, workspace };
  } catch (error: any) {
    console.error("Error fetching workspace members:", error);
    return { success: false, error: error.message };
  }
}

export async function inviteWorkspaceMember(emailOrUsername: string, role: string) {
  try {
    const { workspace, role: userRole } = await getCurrentWorkspace();

    if (!hasPermission(userRole, "ADMIN")) {
      return { success: false, error: "Solo los Administradores pueden invitar nuevos miembros" };
    }

    const cleanInput = emailOrUsername.trim().toLowerCase();

    // Buscar si el usuario existe
    let targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanInput },
          { username: cleanInput },
        ],
      },
    });

    // Si no existe, lo creamos preliminarmente para que pueda acceder al registrarse
    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: {
          email: cleanInput.includes("@") ? cleanInput : `${cleanInput}@invitado.nexus`,
          username: cleanInput.includes("@") ? cleanInput.split("@")[0] : cleanInput,
          name: cleanInput.split("@")[0],
          globalRole: "USER",
        },
      });
    }

    // Verificar si ya es miembro de este workspace
    const existingMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: targetUser.id,
        },
      },
    });

    if (existingMembership) {
      return { success: false, error: "El usuario ya es miembro de este espacio de trabajo" };
    }

    const newMembership = await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: targetUser.id,
        role: (role as any) || "DEVELOPER",
      },
      include: { user: true },
    });

    revalidatePath("/usuarios");
    revalidatePath("/proyectos");
    return { success: true, data: newMembership };
  } catch (error: any) {
    console.error("Error inviting workspace member:", error);
    return { success: false, error: error.message };
  }
}

export async function updateMemberRole(memberId: string, newRole: string) {
  try {
    const { workspace, role: userRole } = await getCurrentWorkspace();

    if (!hasPermission(userRole, "ADMIN")) {
      return { success: false, error: "Solo los Administradores pueden modificar roles" };
    }

    const member = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.workspaceId !== workspace.id) {
      return { success: false, error: "Miembro no encontrado" };
    }

    const updated = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: newRole as any },
      include: { user: true },
    });

    revalidatePath("/usuarios");
    revalidatePath("/proyectos");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeWorkspaceMember(memberId: string) {
  try {
    const { workspace, role: userRole } = await getCurrentWorkspace();

    if (!hasPermission(userRole, "ADMIN")) {
      return { success: false, error: "Solo los Administradores pueden revocar accesos" };
    }

    const member = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.workspaceId !== workspace.id) {
      return { success: false, error: "Miembro no encontrado" };
    }

    await prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    revalidatePath("/usuarios");
    revalidatePath("/proyectos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function switchActiveWorkspace(workspaceId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || !(user as any).id) {
      return { success: false, error: "UNAUTHORIZED" };
    }

    // Confirmar que el usuario es miembro de ese workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: (user as any).id, workspaceId },
      include: { workspace: true },
    });

    if (!membership) {
      return { success: false, error: "No tienes acceso a este espacio de trabajo" };
    }

    const cookieStore = await cookies();
    cookieStore.set("active_workspace_id", workspaceId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    revalidatePath("/");
    revalidatePath("/proyectos");
    revalidatePath("/tareas");
    revalidatePath("/usuarios");

    return { success: true, data: membership.workspace };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createWorkspace(name: string) {
  try {
    const user = await getCurrentUser();
    if (!user || !(user as any).id) {
      return { success: false, error: "UNAUTHORIZED" };
    }

    if (!name || !name.trim()) {
      return { success: false, error: "El nombre del espacio es obligatorio" };
    }

    const slug = `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const newWorkspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        slug: slug,
      },
    });

    await prisma.workspaceMember.create({
      data: {
        workspaceId: newWorkspace.id,
        userId: (user as any).id,
        role: "ADMIN",
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("active_workspace_id", newWorkspace.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    revalidatePath("/");
    revalidatePath("/proyectos");
    revalidatePath("/tareas");
    revalidatePath("/usuarios");

    return { success: true, data: newWorkspace };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
