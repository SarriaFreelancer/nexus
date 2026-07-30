"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { revalidatePath } from "next/cache";
import { recordAuditLog } from "./auditActions";

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

    await recordAuditLog(member.userId, "CREATE_AUTOMATION", "Creó una regla de automatización", `Regla: ${data.name}`, { project: data.projectId, after: { name: data.name, action: data.action } });

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

    await recordAuditLog(member.userId, "TOGGLE_AUTOMATION", `${isActive ? "Activó" : "Desactivó"} una regla de automatización`, `Regla: ${automation.name}`, { project: automation.projectId });

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

    await recordAuditLog(member.userId, "DELETE_AUTOMATION", "Eliminó una regla de automatización", `Regla: ${automation.name}`, { project: automation.projectId });

    revalidatePath(`/proyectos/${automation.projectId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function executeAutomations(projectId: string, triggerEvent: string, eventData: any = {}) {
  try {
    const automations = await prisma.projectAutomation.findMany({
      where: { projectId, isActive: true, trigger: triggerEvent },
    });

    for (const rule of automations) {
      let conditionsMet = true;
      if (rule.condition && typeof rule.condition === 'object') {
        const cond = rule.condition as any;
        if (cond.to && eventData.to !== cond.to) conditionsMet = false;
      }

      if (conditionsMet) {
        if (rule.action === "CHANGE_PROJECT_STATUS_TESTING") {
          await prisma.project.update({
            where: { id: projectId },
            data: { status: "TESTING" }
          });
          await prisma.projectEvent.create({
            data: {
              projectId,
              userId: (rule as any).userId || "system",
              type: "SYSTEM",
              content: `Automatización ejecutada: Estado cambiado a En Pruebas por la regla "${rule.name}"`,
            }
          });
        } else if (rule.action === "CHANGE_PROJECT_STATUS_DEPLOYED") {
          await prisma.project.update({
            where: { id: projectId },
            data: { status: "DEPLOYED" }
          });
          await prisma.projectEvent.create({
            data: {
              projectId,
              userId: (rule as any).userId || "system",
              type: "SYSTEM",
              content: `Automatización ejecutada: Estado cambiado a En Producción por la regla "${rule.name}"`,
            }
          });
        } else if (rule.action === "SEND_NOTIFICATION") {
          await prisma.projectEvent.create({
            data: {
              projectId,
              userId: (rule as any).userId || "system",
              type: "SYSTEM",
              content: `[Notificación] Automatización "${rule.name}": El evento ${triggerEvent} ha ocurrido.`,
            }
          });
        }
      }
    }
    revalidatePath(`/proyectos/${projectId}`);
  } catch (error) {
    console.error("Error executing automations:", error);
  }
}
