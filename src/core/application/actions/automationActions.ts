"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { revalidatePath } from "next/cache";

export async function getProjectAutomations(projectId: string) {
  try {
    const automations = await prisma.projectAutomation.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: automations };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createProjectAutomation(data: any) {
  try {
    const { member } = await getCurrentWorkspace();
    if (member.role !== "ADMIN" && member.role !== "MANAGER") {
      throw new Error("UNAUTHORIZED");
    }

    const automation = await prisma.projectAutomation.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        trigger: data.trigger,
        condition: data.condition,
        action: data.action,
        actionData: data.actionData,
      },
    });

    revalidatePath(`/proyectos/${data.projectId}`);
    return { success: true, data: automation };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleAutomation(id: string, isActive: boolean) {
  try {
    const { member } = await getCurrentWorkspace();
    if (member.role !== "ADMIN" && member.role !== "MANAGER") {
      throw new Error("UNAUTHORIZED");
    }

    const automation = await prisma.projectAutomation.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath(`/proyectos/${automation.projectId}`);
    return { success: true, data: automation };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAutomation(id: string) {
  try {
    const { member } = await getCurrentWorkspace();
    if (member.role !== "ADMIN" && member.role !== "MANAGER") {
      throw new Error("UNAUTHORIZED");
    }

    const automation = await prisma.projectAutomation.delete({
      where: { id },
    });

    revalidatePath(`/proyectos/${automation.projectId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
