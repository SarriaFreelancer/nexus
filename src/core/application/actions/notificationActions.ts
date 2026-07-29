"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  try {
    const { user } = await getCurrentWorkspace();
    const userId = (user as any).id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20
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
