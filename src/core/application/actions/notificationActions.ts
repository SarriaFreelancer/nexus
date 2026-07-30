"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  try {
    const { workspace, user } = await getCurrentWorkspace();
    const userId = (user as any).id;

    // 1. Get all members of the current workspace so collaborators receive notifications
    const workspaceMembers = await prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      select: { userId: true }
    });

    const memberUserIds = Array.from(new Set([userId, ...workspaceMembers.map(m => m.userId)]));

    // 2. Auto-clean / remove notifications for completed or deployed tasks
    const completedTasks = await prisma.task.findMany({
      where: {
        project: { workspaceId: workspace.id },
        status: { in: ["COMPLETED", "DEPLOYED", "ARCHIVED"] }
      },
      select: { title: true }
    });

    if (completedTasks.length > 0) {
      const titlesToRemove = completedTasks.flatMap(t => [
        `🚨 Tarea Vencida: ${t.title}`,
        `⏳ Próxima a Vencer: ${t.title}`
      ]);
      await prisma.notification.deleteMany({
        where: {
          title: { in: titlesToRemove }
        }
      });
    }

    // 3. Synchronize task notifications for overdue and due-soon tasks across all workspace members
    const now = new Date();
    const next48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const pendingTasks = await prisma.task.findMany({
      where: {
        project: { workspaceId: workspace.id },
        status: { notIn: ["COMPLETED", "DEPLOYED", "ARCHIVED"] },
        dueDate: { not: null }
      },
      include: { project: true }
    });

    for (const task of pendingTasks) {
      if (!task.dueDate) continue;

      const dueDateObj = new Date(task.dueDate);
      const formattedDate = dueDateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

      // If task is OVERDUE
      if (dueDateObj < now) {
        const title = `🚨 Tarea Vencida: ${task.title}`;
        
        for (const targetUserId of memberUserIds) {
          const existing = await prisma.notification.findFirst({
            where: { userId: targetUserId, title }
          });
          if (!existing) {
            await prisma.notification.create({
              data: {
                userId: targetUserId,
                title,
                message: `La tarea "${task.title}" en el proyecto "${task.project.name}" venció el ${formattedDate}. ¡Requiere atención urgente!`,
                type: "ERROR",
                link: "/tareas"
              }
            });
          }
        }
      } 
      // If task is DUE SOON (next 48h)
      else if (dueDateObj <= next48h) {
        const title = `⏳ Próxima a Vencer: ${task.title}`;
        
        for (const targetUserId of memberUserIds) {
          const existing = await prisma.notification.findFirst({
            where: { userId: targetUserId, title }
          });
          if (!existing) {
            await prisma.notification.create({
              data: {
                userId: targetUserId,
                title,
                message: `La tarea "${task.title}" en el proyecto "${task.project.name}" vence el ${formattedDate} (en las próximas 48h).`,
                type: "WARNING",
                link: "/tareas"
              }
            });
          }
        }
      }
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30
    });

    return { success: true, data: notifications };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const { user } = await getCurrentWorkspace();
    const userId = (user as any).id;

    const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notif || notif.userId !== userId) throw new Error("UNAUTHORIZED");

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markAllAsRead() {
  try {
    const { user } = await getCurrentWorkspace();
    const userId = (user as any).id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createNotification(userId: string, title: string, message: string, type = "INFO", link?: string) {
  try {
    const notif = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link
      }
    });
    return { success: true, data: notif };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
