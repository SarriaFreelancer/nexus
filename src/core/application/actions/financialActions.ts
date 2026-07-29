"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFinancials() {
  try {
    const data = await prisma.financialRecord.findMany({
      orderBy: { date: "desc" },
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createFinancialRecord(data: any) {
  try {
    // Determine type by amount if not passed
    const type = data.amount > 0 ? "INCOME" : "EXPENSE";

    const record = await prisma.financialRecord.create({
      data: {
        workspaceId: data.workspaceId || "default",
        type: data.type || type,
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
      }
    });

    revalidatePath("/finanzas");
    return { success: true, data: record };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
