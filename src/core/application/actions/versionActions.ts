"use server";

import { prisma } from "@/lib/prisma";

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
