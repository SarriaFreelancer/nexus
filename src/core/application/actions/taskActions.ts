"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getCurrentWorkspace, hasPermission } from "@/lib/serverAuth";
import { recordAuditLog } from "./auditActions";
import { recordProjectEvent } from "./projectEventActions";

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
    const { workspace, role, user } = await getCurrentWorkspace();
    const userId = (user as any).id;
    if (!hasPermission(role, "DEVELOPER")) throw new Error("UNAUTHORIZED_ROLE");
    
    // Verify project belongs to workspace
    const proj = await prisma.project.findUnique({ where: { id: data.projectId, workspaceId: workspace.id } });
    if (!proj) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const newTask = await prisma.task.create({
      data,
    });

    await recordAuditLog(userId, "CREATE_TASK", "Creó una nueva tarea", `Tarea: ${newTask.title}`, { project: proj.name, after: { title: newTask.title, status: newTask.status } });
    await recordProjectEvent(data.projectId, userId, "TASK_ADDED", `Se creó la tarea "${newTask.title}"`, { taskId: newTask.id, status: newTask.status, title: newTask.title });

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
    const { workspace, role, user } = await getCurrentWorkspace();
    const userId = (user as any).id;
    if (!hasPermission(role, "DEVELOPER")) throw new Error("UNAUTHORIZED_ROLE");

    const existing = await prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (!existing || existing.project.workspaceId !== workspace.id) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const updatedTask = await prisma.task.update({
      where: { id },
      data,
    });

    await recordAuditLog(userId, "UPDATE_TASK", "Editó la tarea", `Tarea: ${updatedTask.title}`, { project: existing.project.name, updatedFields: Object.keys(data) });
    await recordProjectEvent(updatedTask.projectId, userId, "TASK_UPDATED", `Se actualizó la tarea "${updatedTask.title}"`, { taskId: updatedTask.id, title: updatedTask.title });

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
    const { workspace, role, user } = await getCurrentWorkspace();
    const userId = (user as any).id;
    if (!hasPermission(role, "DEVELOPER")) throw new Error("UNAUTHORIZED_ROLE");

    const existing = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
    if (!existing || existing.project.workspaceId !== workspace.id) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });

    await recordAuditLog(userId, "MOVE_TASK", "Movió la tarea en Kanban", `Tarea: ${updatedTask.title}`, { project: existing.project.name, before: { status: existing.status }, after: { status: newStatus } });
    await recordProjectEvent(updatedTask.projectId, userId, "TASK_STATUS", `La tarea "${updatedTask.title}" se movió a ${newStatus}`, { taskId: updatedTask.id, before: existing.status, after: newStatus });

    const { processTaskStatusAutomations } = await import("../services/automationService");
    await processTaskStatusAutomations(updatedTask.projectId, updatedTask.id, existing.status, newStatus, userId);

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
    const { workspace, role, user } = await getCurrentWorkspace();
    const userId = (user as any).id;
    if (!hasPermission(role, "MANAGER")) throw new Error("UNAUTHORIZED_ROLE");

    const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (task && task.project.workspaceId === workspace.id) {
      await prisma.task.delete({ where: { id } });

      await recordAuditLog(userId, "DELETE_TASK", "Eliminó la tarea", `Tarea: ${task.title}`, { project: task.project.name });

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

// ==========================================
// SUBTASKS (Subtareas)
// ==========================================
export async function addSubtask(taskId: string, title: string) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "DEVELOPER")) throw new Error("UNAUTHORIZED_ROLE");

    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
    if (!task || task.project.workspaceId !== workspace.id) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const subtask = await prisma.subtask.create({
      data: {
        taskId,
        title,
        completed: false,
      },
    });
    revalidatePath("/tareas");
    return { success: true, data: subtask };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleSubtask(subtaskId: string, completed: boolean) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "DEVELOPER")) throw new Error("UNAUTHORIZED_ROLE");

    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: { task: { include: { project: true } } },
    });
    if (!subtask || subtask.task.project.workspaceId !== workspace.id) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    const updated = await prisma.subtask.update({
      where: { id: subtaskId },
      data: { completed },
    });
    revalidatePath("/tareas");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSubtask(subtaskId: string) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    if (!hasPermission(role, "DEVELOPER")) throw new Error("UNAUTHORIZED_ROLE");

    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: { task: { include: { project: true } } },
    });
    if (!subtask || subtask.task.project.workspaceId !== workspace.id) throw new Error("NOT_FOUND_OR_UNAUTHORIZED");

    await prisma.subtask.delete({
      where: { id: subtaskId },
    });
    revalidatePath("/tareas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// QUICK CHECKLIST ACTIONS
// ==========================================
export async function quickCreateTask(projectId: string, title: string, status?: string) {
  try {
    const { workspace, user } = await getCurrentWorkspace();
    const userId = (user as any).id;
    
    // Verify project belongs to workspace
    const project = await prisma.project.findUnique({
      where: { id: projectId, workspaceId: workspace.id }
    });
    if (!project) throw new Error("Project not found");

    const newTask = await prisma.task.create({
      data: {
        projectId,
        title,
        status: status || "BACKLOG",
        priority: "MEDIUM",
      }
    });

    await recordProjectEvent(projectId, userId, "TASK_ADDED", `Tarea creada: ${title}`, { taskId: newTask.id });
    revalidatePath("/proyectos");
    revalidatePath("/tareas");
    
    return { success: true, data: newTask };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
  try {
    const { workspace, user } = await getCurrentWorkspace();
    const userId = (user as any).id;
    
    // Verify task belongs to a project in the workspace
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });
    
    if (!task || task.project.workspaceId !== workspace.id) {
      throw new Error("Task not found");
    }

    const newStatus = isCompleted ? "PRODUCTION" : "BACKLOG";
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus
      }
    });

    await recordProjectEvent(
      task.projectId, 
      userId, 
      "TASK_STATUS", 
      `Estado de tarea cambiado a ${isCompleted ? 'Completado' : 'Backlog'}`, 
      { taskId, newStatus }
    );
    
    revalidatePath("/proyectos");
    revalidatePath("/tareas");
    
    return { success: true, data: updatedTask };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
