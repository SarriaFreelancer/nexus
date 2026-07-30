"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentWorkspace, hasPermission } from "@/lib/serverAuth";

const DEFAULT_STATUSES = [
  { key: "PENDING", name: "Programada", color: "border-slate-500", position: 0, isSystem: true },
  { key: "IN_PROGRESS", name: "En Ejecución", color: "border-indigo-500", position: 1, isSystem: true },
  { key: "TESTING", name: "En Pruebas", color: "border-cyan-500", position: 2, isSystem: true },
  { key: "PAUSED", name: "En Pausa", color: "border-orange-500", position: 3, isSystem: true },
  { key: "COMPLETED", name: "Completado", color: "border-emerald-500", position: 4, isSystem: true },
];

export async function getWorkspaceTaskStatuses() {
  try {
    const { workspace } = await getCurrentWorkspace();

    let statuses = await prisma.taskStatusConfig.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { position: "asc" },
    });

    // Ensure all 5 system base statuses exist for the workspace
    const existingKeys = new Set(statuses.map((s) => s.key));
    const missingDefaults = DEFAULT_STATUSES.filter((d) => !existingKeys.has(d.key));

    if (missingDefaults.length > 0) {
      await prisma.taskStatusConfig.createMany({
        data: missingDefaults.map((s) => ({
          workspaceId: workspace.id,
          key: s.key,
          name: s.name,
          color: s.color,
          position: s.position,
          isSystem: true,
        })),
      });

      statuses = await prisma.taskStatusConfig.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { position: "asc" },
      });
    }

    return { success: true, data: statuses };
  } catch (error: any) {
    console.error("Error fetching workspace task statuses:", error);
    return { success: false, error: error.message };
  }
}

export async function createCustomTaskStatus(name: string, color?: string) {
  try {
    const { workspace } = await getCurrentWorkspace();

    if (!name || !name.trim()) throw new Error("El nombre del estado es requerido");

    const existing = await prisma.taskStatusConfig.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { position: "desc" },
      take: 1,
    });

    const nextPosition = existing.length > 0 ? existing[0].position + 1 : 0;
    const key = `CUSTOM_${Date.now()}`;

    const newStatus = await prisma.taskStatusConfig.create({
      data: {
        workspaceId: workspace.id,
        key: key,
        name: name.trim(),
        color: color || "border-purple-500",
        position: nextPosition,
        isSystem: false,
      },
    });

    revalidatePath("/tareas");
    revalidatePath("/proyectos");
    return { success: true, data: newStatus };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomTaskStatus(statusId: string) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "DEVELOPER")) throw new Error("UNAUTHORIZED_ROLE");

    const statusConfig = await prisma.taskStatusConfig.findUnique({
      where: { id: statusId },
    });

    if (!statusConfig || statusConfig.workspaceId !== workspace.id) {
      throw new Error("Estado no encontrado");
    }

    if (statusConfig.isSystem) {
      throw new Error("No se pueden eliminar los estados base del sistema");
    }

    await prisma.taskStatusConfig.delete({
      where: { id: statusId },
    });

    revalidatePath("/tareas");
    revalidatePath("/proyectos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
