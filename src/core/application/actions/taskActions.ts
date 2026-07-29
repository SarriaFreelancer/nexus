"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getCurrentWorkspace, hasPermission } from "@/lib/serverAuth";

// ==========================================
// GET (Consultas)
// ==========================================
export async function getTasksByProjectId(projectId: string) {
  try {
    const { workspace } = await getCurrentWorkspace();
    const tasks = await prisma.task.findMany({
      where: { 
        projectId,
        project: { workspaceId: workspace.id }
      },
      include: {
        assignee: true,
        subtasks: true,
        project: true
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: tasks };
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllTasks() {
  try {
    const { workspace } = await getCurrentWorkspace();
    const tasks = await prisma.task.findMany({
      where: { project: { workspaceId: workspace.id } },
      include: {
        assignee: true,
        subtasks: true,
        project: true
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: tasks };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// POST (Creación)
// ==========================================
export async function createTask(data: {
  projectId: string;
  title: string;
  description?: string;
  status: any;
  priority: any;
  estimatedHs?: number;
  dueDate?: Date;
  assigneeId?: string;
}) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "DEVELOPER")) throw new Error("UNAUTHORIZED_ROLE");
    
    // Verify project belongs to workspace
    const proj = await prisma.project.findUnique({ where: { id: data.projectId, workspaceId: workspace.id } });
    if (!proj) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const newTask = await prisma.task.create({
      data,
    });
    revalidatePath("/tareas");
    revalidatePath(`/proyectos/${data.projectId}`);
    return { success: true, data: newTask };
  } catch (error: any) {
    console.error("Error creating task:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// PUT/PATCH (Edición)
// ==========================================
export async function updateTask(id: string, data: Partial<any>) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "DEVELOPER")) throw new Error("UNAUTHORIZED_ROLE");

    const existing = await prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (!existing || existing.project.workspaceId !== workspace.id) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const updatedTask = await prisma.task.update({
      where: { id },
      data,
    });
    revalidatePath("/tareas");
    revalidatePath(`/proyectos/${updatedTask.projectId}`);
    return { success: true, data: updatedTask };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// Mover Tarea (Kanban Drag & Drop)
// ==========================================
export async function moveTaskStatus(taskId: string, newStatus: any) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "DEVELOPER")) throw new Error("UNAUTHORIZED_ROLE");

    const existing = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
    if (!existing || existing.project.workspaceId !== workspace.id) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });
    revalidatePath("/tareas");
    return { success: true, data: updatedTask };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// DELETE (Eliminación)
// ==========================================
export async function deleteTask(id: string) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "MANAGER")) throw new Error("UNAUTHORIZED_ROLE");

    const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (task && task.project.workspaceId === workspace.id) {
      await prisma.task.delete({ where: { id } });
      revalidatePath("/tareas");
      revalidatePath(`/proyectos/${task.projectId}`);
    } else if (task) {
      throw new Error("NOT_FOUND_OR_UNAUTHORIZED");
    }
    return { success: true, message: "Task deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
