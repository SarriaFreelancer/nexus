"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDocuments() {
  try {
    const data = await prisma.document.findMany({
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
