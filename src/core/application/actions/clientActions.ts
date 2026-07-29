"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getCurrentWorkspace, hasPermission } from "@/lib/serverAuth";

// ==========================================
// GET (Consultas)
// ==========================================
export async function getClients() {
  try {
    const { workspace } = await getCurrentWorkspace();
    const clients = await prisma.client.findMany({
      where: { workspaceId: workspace.id },
      include: {
        projects: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: clients };
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    return { success: false, error: error.message };
  }
}

export async function getClientById(id: string) {
  try {
    const { workspace } = await getCurrentWorkspace();
    const client = await prisma.client.findUnique({
      where: { id, workspaceId: workspace.id },
      include: { projects: true },
    });
    if (!client) throw new Error("Client not found or unauthorized");
    return { success: true, data: client };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// POST (Creación)
// ==========================================
export async function createClient(data: {
  company: string;
  contactName: string;
  email: string;
  phone?: string;
  stage?: string;
}) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "COMMERCIAL")) throw new Error("UNAUTHORIZED_ROLE");

    console.log("CREATING CLIENT WITH WORKSPACE:", workspace.id, "DATA:", data);

    const newClient = await prisma.client.create({
      data: {
        ...data,
        workspaceId: workspace.id,
        stage: data.stage || "LEAD"
      },
    });
    revalidatePath("/clientes");
    return { success: true, data: newClient };
  } catch (error: any) {
    console.error("Error creating client:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// PUT/PATCH (Edición)
// ==========================================
export async function updateClient(id: string, data: Partial<any>) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "COMMERCIAL")) throw new Error("UNAUTHORIZED_ROLE");

    const existing = await prisma.client.findUnique({ where: { id, workspaceId: workspace.id } });
    if (!existing) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const updatedClient = await prisma.client.update({
      where: { id },
      data,
    });
    revalidatePath("/clientes");
    return { success: true, data: updatedClient };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// DELETE (Eliminación)
// ==========================================
export async function deleteClient(id: string) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "ADMIN")) throw new Error("UNAUTHORIZED_ROLE");

    const existing = await prisma.client.findUnique({ where: { id, workspaceId: workspace.id } });
    if (!existing) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    await prisma.client.delete({
      where: { id },
    });
    revalidatePath("/clientes");
    return { success: true, message: "Client deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// DND (Mover Stage)
// ==========================================
export async function moveClientStage(clientId: string, newStage: string) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "COMMERCIAL")) throw new Error("UNAUTHORIZED_ROLE");

    const existing = await prisma.client.findUnique({ where: { id: clientId, workspaceId: workspace.id } });
    if (!existing) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: { stage: newStage },
    });
    revalidatePath("/clientes");
    return { success: true, data: updatedClient };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
