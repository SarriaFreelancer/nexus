"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentWorkspace, getProjectAccessFilter } from "@/lib/serverAuth";

export async function getDocuments() {
  try {
    const { workspace, user, member, role } = await getCurrentWorkspace();
    const projectFilter = getProjectAccessFilter(user, member, role);
    
    const data = await prisma.document.findMany({
      where: { 
        project: { workspaceId: workspace.id },
        ...(projectFilter ? { AND: [{ project: projectFilter }] } : {})
      },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
