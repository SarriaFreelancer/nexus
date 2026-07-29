"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getCurrentWorkspace, hasPermission } from "@/lib/serverAuth";

// ==========================================
// GET (Consultas)
// ==========================================
export async function getServers() {
  try {
    const { workspace } = await getCurrentWorkspace();
    const servers = await prisma.serverInstance.findMany({
      where: { workspaceId: workspace.id },
      include: {
        project: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    return { success: true, data: servers };
  } catch (error: any) {
    console.error("Error fetching servers:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// POST (Creación)
// ==========================================
export async function createServer(data: {
  projectId?: string;
  name: string;
  ipAddress: string;
  provider: string;
  status?: string;
}) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "ADMIN")) throw new Error("UNAUTHORIZED_ROLE");

    const newServer = await prisma.serverInstance.create({
      data: {
        ...data,
        workspaceId: workspace.id,
        status: data.status || "ONLINE",
        cpuUsage: 0,
        ramUsage: 0,
        diskUsage: 0
      },
    });
    revalidatePath("/infraestructura");
    return { success: true, data: newServer };
  } catch (error: any) {
    console.error("Error creating server:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// PUT/PATCH (Edición/Telemetría)
// ==========================================
export async function updateServerMetrics(id: string, data: { cpuUsage?: number; ramUsage?: number; diskUsage?: number; status?: string }) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "DEVELOPER")) throw new Error("UNAUTHORIZED_ROLE");

    const existing = await prisma.serverInstance.findUnique({ where: { id, workspaceId: workspace.id } });
    if (!existing) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const updatedServer = await prisma.serverInstance.update({
      where: { id },
      data,
    });
    revalidatePath("/infraestructura");
    return { success: true, data: updatedServer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// DELETE (Eliminación)
// ==========================================
export async function deleteServer(id: string) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "ADMIN")) throw new Error("UNAUTHORIZED_ROLE");

    const existing = await prisma.serverInstance.findUnique({ where: { id, workspaceId: workspace.id } });
    if (!existing) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    await prisma.serverInstance.delete({
      where: { id },
    });
    revalidatePath("/infraestructura");
    return { success: true, message: "Server deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
