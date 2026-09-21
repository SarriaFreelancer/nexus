"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";
import { revalidatePath } from "next/cache";

export async function getAllGlobalUsersAndWorkspaces() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser as any).role !== "SUPER_ADMIN") {
      throw new Error("UNAUTHORIZED_SUPER_ADMIN_ONLY");
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        memberships: {
          include: {
            workspace: {
              include: {
                _count: {
                  select: {
                    projects: true,
                    members: true,
                    clients: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const workspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            projects: true,
            clients: true,
            servers: true
          }
        }
      }
    });

    return {
      success: true,
      data: {
        users,
        workspaces
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateWorkspaceSubscription(
  workspaceId: string,
  data: {
    subscriptionPlan: "FREE" | "BASIC" | "INTERMEDIATE" | "PREMIUM";
    maxWorkspaces?: number;
    maxProjects?: number;
    maxCollaborators?: number;
  }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser as any).role !== "SUPER_ADMIN") {
      throw new Error("UNAUTHORIZED_SUPER_ADMIN_ONLY");
    }

    // Default plan limits mapping if not specified
    let maxWorkspaces = data.maxWorkspaces;
    let maxProjects = data.maxProjects;
    let maxCollaborators = data.maxCollaborators;

    if (maxWorkspaces === undefined || maxProjects === undefined || maxCollaborators === undefined) {
      switch (data.subscriptionPlan) {
        case "FREE":
          maxWorkspaces = maxWorkspaces ?? 2;
          maxProjects = maxProjects ?? 3;
          maxCollaborators = maxCollaborators ?? 5;
          break;
        case "BASIC":
          maxWorkspaces = maxWorkspaces ?? 5;
          maxProjects = maxProjects ?? 10;
          maxCollaborators = maxCollaborators ?? 15;
          break;
        case "INTERMEDIATE":
          maxWorkspaces = maxWorkspaces ?? 15;
          maxProjects = maxProjects ?? 30;
          maxCollaborators = maxCollaborators ?? 50;
          break;
        case "PREMIUM":
          maxWorkspaces = maxWorkspaces ?? 999;
          maxProjects = maxProjects ?? 999;
          maxCollaborators = maxCollaborators ?? 999;
          break;
      }
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        subscriptionPlan: data.subscriptionPlan,
        maxWorkspaces,
        maxProjects,
        maxCollaborators
      }
    });

    revalidatePath("/superadmin");
    revalidatePath("/configuracion");

    return { success: true, data: updatedWorkspace };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteGlobalUser(targetUserId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser as any).role !== "SUPER_ADMIN") {
      throw new Error("Solo el Super Administrador puede eliminar usuarios globales.");
    }

    const currentUserId = (currentUser as any).id;
    if (currentUserId === targetUserId) {
      throw new Error("No puedes eliminar tu propia cuenta de Super Administrador.");
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        memberships: {
          include: {
            workspace: {
              include: {
                members: true
              }
            }
          }
        }
      }
    });

    if (!targetUser) {
      throw new Error("El usuario a eliminar no existe.");
    }

    if (targetUser.email === "superadmin@nexus.com") {
      throw new Error("No se puede eliminar la cuenta principal de Super Admin.");
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete solitary workspaces where this user is the only member
      for (const m of targetUser.memberships) {
        const wsMembers = m.workspace.members;
        if (wsMembers.length <= 1) {
          await tx.workspace.delete({
            where: { id: m.workspaceId }
          });
        }
      }

      // 2. Unassign tasks assigned to this user across all remaining projects/boards
      await tx.task.updateMany({
        where: { assigneeId: targetUserId },
        data: { assigneeId: null }
      });

      // 3. Delete time entries created by this user
      await tx.timeEntry.deleteMany({
        where: { userId: targetUserId }
      });

      // 4. Delete project events created by this user
      await tx.projectEvent.deleteMany({
        where: { userId: targetUserId }
      });

      // 5. Delete AI audits created by this user
      await tx.aiAudit.deleteMany({
        where: { userId: targetUserId }
      });

      // 6. Delete audit logs for this user
      await tx.auditLog.deleteMany({
        where: { userId: targetUserId }
      });

      // 7. Delete notifications for this user
      await tx.notification.deleteMany({
        where: { userId: targetUserId }
      });

      // 8. Delete workspace memberships for this user
      await tx.workspaceMember.deleteMany({
        where: { userId: targetUserId }
      });

      // 9. Delete conversation participants and chat messages
      await tx.conversationParticipant.deleteMany({
        where: { userId: targetUserId }
      });
      await tx.chatMessage.deleteMany({
        where: { senderId: targetUserId }
      });

      // 10. Delete the user
      await tx.user.delete({
        where: { id: targetUserId }
      });
    });

    revalidatePath("/superadmin");
    revalidatePath("/usuarios");
    revalidatePath("/colaboradores");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

