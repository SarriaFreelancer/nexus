import { prisma } from "@/lib/prisma";
import { createNotification } from "@/core/application/actions/notificationActions";
import { recordAuditLog } from "@/core/application/actions/auditActions";

export async function processTaskStatusAutomations(projectId: string, taskId: string, oldStatus: string, newStatus: string, userId: string) {
  try {
    const automations = await prisma.projectAutomation.findMany({
      where: { projectId, isActive: true, trigger: "TASK_STATUS_CHANGED" },
    });

    for (const auto of automations) {
      const condition = auto.condition as any;
      if (!condition) continue;

      // Check condition
      if (condition.to && condition.to !== newStatus) continue;
      if (condition.from && condition.from !== oldStatus) continue;

      // Execute action
      const actionData = auto.actionData as any;
      
      if (auto.action === "SEND_NOTIFICATION") {
        const message = actionData?.message || `Una tarea cambió de ${oldStatus} a ${newStatus}`;
        
        // Find all project members to notify
        const members = await prisma.workspaceMember.findMany({
          where: { workspace: { projects: { some: { id: projectId } } } }
        });
        
        for (const member of members) {
          await createNotification(member.userId, `Automatización: ${auto.name}`, message, "INFO", `/proyectos/${projectId}`);
        }
      } 
      else if (auto.action === "CHANGE_PROJECT_STATUS") {
        const newProjStatus = actionData?.status;
        if (newProjStatus) {
          await prisma.project.update({
            where: { id: projectId },
            data: { status: newProjStatus }
          });
          await recordAuditLog(userId, "AUTOMATION_TRIGGER", `Automatización cambió el estado del proyecto a ${newProjStatus}`, `Proyecto ID: ${projectId}`, { automationId: auto.id });
        }
      } else if (auto.action === "CHANGE_PROJECT_STATUS_TESTING") {
        await prisma.project.update({
          where: { id: projectId },
          data: { status: "TESTING" }
        });
        await recordAuditLog(userId, "AUTOMATION_TRIGGER", `Automatización cambió el estado del proyecto a TESTING`, `Proyecto ID: ${projectId}`, { automationId: auto.id });
      } else if (auto.action === "CHANGE_PROJECT_STATUS_DEPLOYED") {
        await prisma.project.update({
          where: { id: projectId },
          data: { status: "DEPLOYED" }
        });
        await recordAuditLog(userId, "AUTOMATION_TRIGGER", `Automatización cambió el estado del proyecto a DEPLOYED`, `Proyecto ID: ${projectId}`, { automationId: auto.id });
      }
    }
  } catch (error) {
    console.error("Error processing automations:", error);
  }
}
