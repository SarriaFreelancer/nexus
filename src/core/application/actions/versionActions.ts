"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getCurrentWorkspace, getProjectAccessFilter } from "@/lib/serverAuth";

export async function getVersions() {
  try {
    const { workspace, user, member, role } = await getCurrentWorkspace();
    const projectFilter = getProjectAccessFilter(user, member, role);
    
    const data = await prisma.projectVersion.findMany({
      where: { 
        project: { workspaceId: workspace.id },
        ...(projectFilter ? { AND: [{ project: projectFilter }] } : {})
      },
      include: { project: true, tasks: true },
      orderBy: { releaseDate: "desc" },
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createVersion(data: {
  projectId: string;
  version: string;
  title: string;
  changelog: string;
  isCurrent: boolean;
  branch?: string;
  commitHash?: string;
}) {
  try {
    const { workspace, user, member, role } = await getCurrentWorkspace();
    const projectFilter = getProjectAccessFilter(user, member, role);

    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        workspaceId: workspace.id,
        ...(projectFilter ? { AND: [projectFilter] } : {})
      }
    });

    if (!project) throw new Error("Project not found or unauthorized");

    if (data.isCurrent) {
      await prisma.projectVersion.updateMany({
        where: { projectId: project.id },
        data: { isCurrent: false }
      });
    }

    const newVersion = await prisma.projectVersion.create({
      data: {
        projectId: project.id,
        version: data.version,
        title: data.title,
        changelog: data.changelog,
        releaseDate: new Date(),
        isCurrent: data.isCurrent,
        ...(data.branch && { branch: data.branch }),
        ...(data.commitHash && { commitHash: data.commitHash }),
      }
    });

    revalidatePath("/versiones");
    revalidatePath("/proyectos");
    revalidatePath(`/proyectos/${project.id}`);

    return { success: true, data: newVersion };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateVersion(id: string, data: {
  version?: string;
  title?: string;
  changelog?: string;
  isCurrent?: boolean;
}) {
  try {
    const { workspace, user, member, role } = await getCurrentWorkspace();
    const projectFilter = getProjectAccessFilter(user, member, role);

    const existing = await prisma.projectVersion.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!existing) throw new Error("Version not found");

    if (existing.project.workspaceId !== workspace.id) throw new Error("Unauthorized");

    // If marked as current, unset others
    if (data.isCurrent) {
      await prisma.projectVersion.updateMany({
        where: { projectId: existing.projectId },
        data: { isCurrent: false }
      });
    }

    const updated = await prisma.projectVersion.update({
      where: { id },
      data: {
        ...(data.version !== undefined && { version: data.version }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.changelog !== undefined && { changelog: data.changelog }),
        ...(data.isCurrent !== undefined && { isCurrent: data.isCurrent }),
      }
    });

    revalidatePath("/versiones");
    revalidatePath("/proyectos");
    revalidatePath(`/proyectos/${existing.projectId}`);

    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteVersion(id: string) {
  try {
    const { workspace } = await getCurrentWorkspace();

    const existing = await prisma.projectVersion.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!existing) throw new Error("Versión no encontrada");
    if (existing.project.workspaceId !== workspace.id) throw new Error("No autorizado");

    await prisma.projectVersion.delete({
      where: { id }
    });

    revalidatePath("/versiones");
    revalidatePath("/proyectos");
    revalidatePath(`/proyectos/${existing.projectId}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

