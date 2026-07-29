"use server";

import { prisma } from "@/lib/prisma";

import { getCurrentWorkspace } from "@/lib/serverAuth";

export async function getVersions() {
  try {
    const { workspace } = await getCurrentWorkspace();
    const data = await prisma.projectVersion.findMany({
      where: { project: { workspaceId: workspace.id } },
      include: { project: true, tasks: true },
      orderBy: { releaseDate: "desc" },
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
