"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  try {
    const { workspace, user } = await getCurrentWorkspace();
    const userId = (user as any).id;

    // 1. Get all unique members of the current workspace
    const workspaceMembers = await prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      select: { userId: true }
    });

    const memberUserIds = Array.from(
      new Set([userId, ...workspaceMembers.map(m => m.userId).filter(Boolean)])
    );

    // 2. Remove duplicate notifications from the database
    const allNotifs = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" }
    });

    const seenKeys = new Set<string>();
    const duplicateIdsToDelete: string[] = [];

    for (const notif of allNotifs) {
      const key = `${notif.userId}_${notif.title}`;
      if (seenKeys.has(key)) {
        duplicateIdsToDelete.push(notif.id);
      } else {
        seenKeys.add(key);
      }
    }

    if (duplicateIdsToDelete.length > 0) {
      await prisma.notification.deleteMany({
        where: { id: { in: duplicateIdsToDelete } }
      });
    }

    // 3. Auto-clean notifications for completed, deployed, or deleted tasks
    const allWorkspaceTasks = await prisma.task.findMany({
      where: { project: { workspaceId: workspace.id } },
      include: { project: true }
    });

    const completedTaskTitles = new Set(
      allWorkspaceTasks
        .filter(t => ["COMPLETED", "DEPLOYED", "ARCHIVED"].includes(t.status))
        .map(t => t.title)
    );

    if (completedTaskTitles.size > 0) {
      const titlesArray = Array.from(completedTaskTitles);
      for (const tTitle of titlesArray) {
        await prisma.notification.deleteMany({
          where: {
            title: {
              in: [
                `🚨 Tarea Vencida: ${tTitle}`,
                `⏳ Próxima a Vencer: ${tTitle}`
              ]
            }
          }
        });
      }
    }

    // 4. Synchronize task notifications for overdue and due-soon tasks
    const now = new Date();
    const next48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const pendingTasks = allWorkspaceTasks.filter(
      t => !["COMPLETED", "DEPLOYED", "ARCHIVED"].includes(t.status) && t.dueDate
    );

    for (const task of pendingTasks) {
      if (!task.dueDate) continue;

      const dueDateObj = new Date(task.dueDate);
      const formattedDate = dueDateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

      // If task is OVERDUE
      if (dueDateObj < now) {
        const title = `🚨 Tarea Vencida: ${task.title}`;
        const message = `La tarea "${task.title}" del proyecto "${task.project.name}" venció el ${formattedDate}. ¡Requiere atención urgente!`;
        
        for (const targetUserId of memberUserIds) {
          const existing = await prisma.notification.findFirst({
            where: { userId: targetUserId, title }
          });
          if (!existing) {
            await prisma.notification.create({
              data: {
                userId: targetUserId,
                title,
                message,
                type: "ERROR",
                link: `/tareas?task=${task.id}`
              }
            });
          }
        }
      } 
      // If task is DUE SOON (next 48h)
      else if (dueDateObj <= next48h) {
        const title = `⏳ Próxima a Vencer: ${task.title}`;
        const message = `La tarea "${task.title}" del proyecto "${task.project.name}" vence el ${formattedDate} (en las próximas 48h).`;
        
        for (const targetUserId of memberUserIds) {
          const existing = await prisma.notification.findFirst({
            where: { userId: targetUserId, title }
          });
          if (!existing) {
            await prisma.notification.create({
              data: {
                userId: targetUserId,
                title,
                message,
                type: "WARNING",
                link: `/tareas?task=${task.id}`
              }
            });
          }
        }
      }
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 40
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
