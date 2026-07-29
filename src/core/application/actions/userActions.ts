"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace, hasPermission } from "@/lib/serverAuth";

export async function getWorkspaceUsers() {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    
    // Only Admin can view all users in the new Usuarios module
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
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
            name: "Ana García",
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
