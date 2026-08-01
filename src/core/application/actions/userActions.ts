"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace, hasPermission } from "@/lib/serverAuth";

export async function getWorkspaceUsers() {
  try {
    const { workspace, member } = await getCurrentWorkspace();
    
    // Only Admin can view all users in the new Usuarios module
    if (member.role !== "ADMIN" && (member.role as any) !== "SUPER_ADMIN") {
      throw new Error("UNAUTHORIZED");
    }

    // Since we are mocking the db connection mostly, 
    // let's return some mock users if the DB is empty
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: {
        user: true
      }
    });

    if (members.length === 0) {
      return {
        success: true,
        data: [
          {
            id: "u-1",
            name: "David Sarria",
            email: "david@sarriatech.com",
            role: "ADMIN",
            avatarUrl: "https://i.pravatar.cc/150?u=david",
            createdAt: new Date().toISOString(),
            status: "ACTIVE"
          },
          {
            id: "u-2",
            name: "Ana GarcÃ­a",
            email: "ana@sarriatech.com",
            role: "DEVELOPER",
            avatarUrl: "https://i.pravatar.cc/150?u=ana",
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            status: "ACTIVE"
          },
          {
            id: "u-3",
            name: "Carlos Ruiz",
            email: "carlos@sarriatech.com",
            role: "MANAGER",
            avatarUrl: "https://i.pravatar.cc/150?u=carlos",
            createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
            status: "ACTIVE"
          }
        ]
      };
    }

    return { 
      success: true, 
      data: members.map(m => ({
        id: m.userId,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        avatarUrl: m.user.avatarUrl,
        createdAt: m.user.createdAt,
        status: "ACTIVE"
      }))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createUser(data: { name: string; email: string; role: string }) {
  try {
    const { workspace, user, member } = await getCurrentWorkspace();
    if (member.role !== "ADMIN") {
      throw new Error("No tienes permisos para crear usuarios.");
    }
    const adminUserId = (user as any).id;

    // Check if user already exists
    let dbUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
        },
      });
    }

    // Add to workspace
    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: dbUser.id,
        role: data.role as any,
      },
    });

    const { recordAuditLog } = await import("./auditActions");
    await recordAuditLog(adminUserId, "CREATE_USER", "RegistrÃ³ un nuevo colaborador / usuario", `Usuario: ${data.name}`, { email: data.email, role: data.role });

    return { success: true, data: dbUser };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserPreferences() {
  try {
    const { user } = await getCurrentWorkspace();
    const dbUser = await prisma.user.findUnique({
      where: { id: (user as any).id }
    });
    
    if (!dbUser) throw new Error("USER_NOT_FOUND");
    
    let prefs = {};
    if (dbUser.preferences) {
      prefs = typeof dbUser.preferences === "string" ? JSON.parse(dbUser.preferences) : dbUser.preferences;
    }
    
    return { success: true, data: prefs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserPreference(key: string, value: any) {
  try {
    const { user } = await getCurrentWorkspace();
    const userId = (user as any).id;
    
    const dbUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!dbUser) throw new Error("USER_NOT_FOUND");
    
    let prefs: any = {};
    if (dbUser.preferences) {
      prefs = typeof dbUser.preferences === "string" ? JSON.parse(dbUser.preferences) : dbUser.preferences;
    }
    
    prefs[key] = value;
    
    await prisma.user.update({
      where: { id: userId },
      data: { preferences: prefs }
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserProfile(data: { name?: string; avatarUrl?: string }) {
  try {
    const { user } = await getCurrentWorkspace();
    const userId = (user as any).id;
    const dbUser = await prisma.user.update({
      where: { id: userId },
      data
    });
    return { success: true, data: dbUser };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
