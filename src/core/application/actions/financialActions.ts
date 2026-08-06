"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { recordAuditLog } from "./auditActions";

export async function getFinancials() {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (role !== "ADMIN" && role !== "COMMERCIAL") {
      return { success: true, data: [] }; // Hide financials for other roles
    }
    const data = await prisma.financialRecord.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { date: "desc" },
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createFinancialRecord(data: any) {
  try {
    const { workspace, user, member } = await getCurrentWorkspace();
    if (member.role !== "ADMIN" && member.role !== "COMMERCIAL") {
      throw new Error("No tienes permisos para registrar finanzas.");
    }
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
        date: data.date ? new Date(data.date) : new Date(),
      }
    });

    await recordAuditLog(userId, "CREATE_FINANCIAL", "Registró un movimiento financiero", `Módulo Finanzas (${record.category})`, { 
      amount: record.amount, 
      type: record.type,
      before: null,
      after: { amount: record.amount, type: record.type, category: record.category, description: record.description }
    });

    revalidatePath("/finanzas");
    return { success: true, data: record };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateFinancialRecord(id: string, data: any) {
  try {
    const { workspace, user, member } = await getCurrentWorkspace();
    if (member.role !== "ADMIN" && member.role !== "COMMERCIAL") {
      throw new Error("No tienes permisos para editar finanzas.");
    }
    const userId = (user as any).id;
    const existing = await prisma.financialRecord.findUnique({ where: { id, workspaceId: workspace.id } });
    if (!existing) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const record = await prisma.financialRecord.update({
      where: { id },
      data: {
        type: data.type || existing.type,
        amount: data.amount ? Number(data.amount) : existing.amount,
        category: data.category || existing.category,
        description: data.description !== undefined ? data.description : existing.description,
        date: data.date ? new Date(data.date) : existing.date
      }
    });

    await recordAuditLog(userId, "UPDATE_FINANCIAL", "Actualizó un movimiento financiero", `Módulo Finanzas (${record.category})`, { 
      amount: record.amount, 
      type: record.type,
      before: { amount: existing.amount, type: existing.type, category: existing.category, description: existing.description },
      after: { amount: record.amount, type: record.type, category: record.category, description: record.description }
    });

    revalidatePath("/finanzas");
    return { success: true, data: record };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteFinancialRecord(id: string) {
  try {
    const { workspace, user, member } = await getCurrentWorkspace();
    if (member.role !== "ADMIN" && member.role !== "COMMERCIAL") {
      throw new Error("No tienes permisos para eliminar finanzas.");
    }
    const userId = (user as any).id;
    const existing = await prisma.financialRecord.findUnique({ where: { id, workspaceId: workspace.id } });
    if (!existing) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    await prisma.financialRecord.delete({ where: { id } });

    await recordAuditLog(userId, "DELETE_FINANCIAL", "Eliminó un movimiento financiero", `Módulo Finanzas (${existing.category})`, { 
      amount: existing.amount, 
      type: existing.type,
      before: { amount: existing.amount, type: existing.type, category: existing.category, description: existing.description },
      after: null
    });

    revalidatePath("/finanzas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
