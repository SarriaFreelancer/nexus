"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { recordAuditLog } from "./auditActions";

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
    const { workspace, user } = await getCurrentWorkspace();
    const userId = (user as any).id;
    // Determine type by amount if not passed
    const type = data.amount > 0 ? "INCOME" : "EXPENSE";

    const record = await prisma.financialRecord.create({
      data: {
        workspaceId: workspace.id,
        type: data.type || type,
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
      }
    });

    await recordAuditLog(userId, "CREATE_FINANCIAL", "Registró un movimiento financiero", `Módulo Finanzas (${record.category})`, { amount: record.amount, type: record.type });

    revalidatePath("/finanzas");
    return { success: true, data: record };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
