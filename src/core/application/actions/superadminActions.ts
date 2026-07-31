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
