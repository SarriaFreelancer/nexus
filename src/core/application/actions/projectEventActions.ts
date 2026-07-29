"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { revalidatePath } from "next/cache";

export async function getProjectEvents(projectId: string) {
  try {
    const { workspace } = await getCurrentWorkspace();
    
    // Verify project belongs to workspace
    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: workspace.id }
    });
    if (!project) throw new Error("Project not found");

    const events = await prisma.projectEvent.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true, avatarUrl: true }
        }
      }
    });

    return { success: true, data: events };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addProjectComment(projectId: string, content: string) {
  try {
    const { workspace, user } = await getCurrentWorkspace();
    const userId = (user as any).id;
    
    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: workspace.id }
    });
    if (!project) throw new Error("Project not found");

    const event = await prisma.projectEvent.create({
      data: {
        projectId,
        userId,
        type: "COMMENT",
        content,
      },
      include: {
        user: {
          select: { name: true, email: true, avatarUrl: true }
        }
      }
    });

    revalidatePath(`/proyectos`);
    return { success: true, data: event };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Internal server-only helper function to record other events
export async function recordProjectEvent(projectId: string, userId: string, type: string, content?: string, details?: any) {
  return prisma.projectEvent.create({
    data: {
      projectId,
      userId,
      type,
      content,
      details: details ? JSON.parse(JSON.stringify(details)) : null
    }
  });
}
