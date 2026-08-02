"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function completeGuidedTour() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    if (!user) return { success: false, error: "User not found" };

    const prefs = (user.preferences as any) || {};
    prefs.hasCompletedTour = true;

    await prisma.user.update({
      where: { id: userId },
      data: { preferences: prefs }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating tour preferences:", error);
    return { success: false, error: error.message };
  }
}

export async function resetGuidedTour(targetUserId?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Only SUPER_ADMIN can reset for others, otherwise they can reset their own
    const role = (session.user as any).role;
    const isSuperAdmin = role === "SUPER_ADMIN";
    const currentUserId = (session.user as any).id;
    
    const userIdToReset = (targetUserId && isSuperAdmin) ? targetUserId : currentUserId;

    if (targetUserId && !isSuperAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userIdToReset },
      select: { preferences: true }
    });

    if (!user) return { success: false, error: "User not found" };

    const prefs = (user.preferences as any) || {};
    prefs.hasCompletedTour = false;

    await prisma.user.update({
      where: { id: userIdToReset },
      data: { preferences: prefs }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error resetting tour preferences:", error);
    return { success: false, error: error.message };
  }
}
