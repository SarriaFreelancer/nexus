"use server";

import { prisma } from "@/lib/prisma";
import { 
  mockProjects, 
  mockNextTasks, 
  mockClients, 
  mockServers 
} from "@/core/infrastructure/mockData";
import crypto from "crypto";

export async function seedTestData() {
  try {
    // 1. Limpiar datos existentes (manteniendo Super Admin)
    await prisma.timeEntry.deleteMany();
    await prisma.subtask.deleteMany();
    await prisma.task.deleteMany();
    await prisma.projectVersion.deleteMany();
    await prisma.document.deleteMany();
    await prisma.serverInstance.deleteMany();
    await prisma.financialRecord.deleteMany();
    await prisma.project.deleteMany();
    await prisma.client.deleteMany();
    await prisma.workspaceMember.deleteMany();
    await prisma.workspace.deleteMany();

    // No borramos a los usuarios SUPER_ADMIN
    await prisma.user.deleteMany({
      where: {
        globalRole: {
          not: "SUPER_ADMIN",
        },
      },
    });

    // 2. Crear Workspace por defecto
    const workspace = await prisma.workspace.create({
      data: {
        id: crypto.randomUUID(),
        name: "SarriaTech Workspace",
        slug: "sarriatech-workspace",
      },
    });

    // Asignar el Super Admin a este Workspace
    const superAdmin = await prisma.user.findFirst({
      where: { email: "superadmin@nexus.com" }
    });

    if (superAdmin) {
      await prisma.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: superAdmin.id,
          role: "ADMIN"
        }
      });
    }

    // 3. Crear Clientes
    const clientsData = mockClients.map(c => ({
      workspaceId: workspace.id,
      company: c.company,
      contactName: c.contactName,
      email: c.email,
      phone: c.phone,
      stage: c.stage || "LEAD"
    }));
    await prisma.client.createMany({ data: clientsData });
    const insertedClients = await prisma.client.findMany({ where: { workspaceId: workspace.id }});

    // 4. Crear Proyectos
    const projectStatuses = ["DISCOVERY", "DESIGN", "DEVELOPMENT", "TESTING", "DEPLOYED", "MAINTENANCE", "PAUSED", "COMPLETED", "ARCHIVED"];
    const projectsData = mockProjects.map((p, i) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i + 1) * 14);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 35 + (i * 12));

      return {
        workspaceId: workspace.id,
        clientId: insertedClients[i % insertedClients.length]?.id,
        name: p.name,
        code: p.code,
        description: "Proyecto generado automáticamente con datos reales",
        status: (projectStatuses[i % projectStatuses.length]) as any,
        priority: (i % 2 === 0 ? "HIGH" : "MEDIUM") as any,
        category: p.category,
        technologies: JSON.stringify(p.technologies),
        estimatedHours: p.hoursEstimated || 80,
        actualHours: p.hoursReal || 45,
        startDate: startDate,
        endDate: endDate,
      };
    });
    await prisma.project.createMany({ data: projectsData });
    const insertedProjects = await prisma.project.findMany({ where: { workspaceId: workspace.id }});

    // 5. Crear Tareas
    const taskStatuses = ["DISCOVERY", "DESIGN", "DEVELOPMENT", "TESTING", "DEPLOYED", "MAINTENANCE", "PAUSED", "COMPLETED", "ARCHIVED"];
    const tasksData = mockNextTasks.map((t, i) => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + (i + 1) * 3);
      
      const status = taskStatuses[i % taskStatuses.length];
      const isFinished = ["COMPLETED", "DEPLOYED", "ARCHIVED"].includes(status);
      const endDate = isFinished ? new Date() : null;

      return {
        projectId: insertedProjects[i % insertedProjects.length]?.id,
        title: t.title,
        description: "Descripción detallada de la tarea",
        status: status as any,
        priority: (i % 3 === 0 ? "URGENT" : i % 2 === 0 ? "HIGH" : "MEDIUM") as any,
        estimatedHs: 10 + i * 2,
        loggedHs: isFinished ? 10 + i * 2 : 4,
        dueDate: futureDate,
        endDate: endDate,
      };
    });
    await prisma.task.createMany({ data: tasksData });

    // 6. Crear Servidores
    const serversData = mockServers.map(s => ({
      workspaceId: workspace.id,
      name: s.name,
      ipAddress: s.ip,
      provider: "AWS",
      cpuUsage: s.cpu,
      ramUsage: s.ram,
      diskUsage: s.disk,
      status: s.status,
    }));
    await prisma.serverInstance.createMany({ data: serversData });

    // 7. Simular Historial de Productividad (Últimos 7 días)
    if (superAdmin) {
      const insertedTasks = await prisma.task.findMany({ where: { projectId: { in: insertedProjects.map(p => p.id) } } });
      const today = new Date();
      
      const timeEntriesData = [];
      
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        d.setHours(12, 0, 0, 0);

        // Randomly complete 1-3 tasks per day (set status to PRODUCTION and updatedAt to this day)
        const tasksToComplete = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < tasksToComplete; j++) {
          const taskToUpdate = insertedTasks[Math.floor(Math.random() * insertedTasks.length)];
          if (taskToUpdate) {
            await prisma.task.update({
              where: { id: taskToUpdate.id },
              data: {
                status: "COMPLETED",
                updatedAt: d
              }
            });
          }
        }

        // Add 4-8 hours of TimeEntry per day
        const dailyHours = Math.floor(Math.random() * 5) + 4;
        const taskForTime = insertedTasks[Math.floor(Math.random() * insertedTasks.length)];
        
        if (taskForTime) {
          timeEntriesData.push({
            taskId: taskForTime.id,
            userId: superAdmin.id,
            hours: dailyHours,
            note: `Trabajo de desarrollo del día ${d.toLocaleDateString()}`,
            date: d
          });
        }
      }
      
      await prisma.timeEntry.createMany({ data: timeEntriesData });

      // 8. Crear registros de Actividad Reciente (AuditLog)
      const auditLogData = [
        {
          userId: superAdmin.id,
          action: "creó un nuevo proyecto",
          entity: "Project",
          details: { target: insertedProjects[0]?.name || "Proyecto Alpha" },
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // Hace 30 min
        },
        {
          userId: superAdmin.id,
          action: "actualizó el estado de la tarea",
          entity: "Task",
          details: { target: tasksData[0]?.title || "Diseño UI" },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // Hace 2 horas
        },
        {
          userId: superAdmin.id,
          action: "registró un nuevo cliente",
          entity: "Client",
          details: { target: insertedClients[0]?.company || "Cliente Demo" },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // Hace 5 horas
        },
        {
          userId: superAdmin.id,
          action: "reinició el servidor",
          entity: "Server",
          details: { target: serversData[0]?.name || "Servidor Principal" },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // Hace 1 día
        }
      ];
      await prisma.auditLog.createMany({ data: auditLogData });
    }

    return { success: true, message: "Datos de prueba inyectados correctamente." };
  } catch (error: any) {
    console.error("Error seeding data:", error);
    return { success: false, message: error.message };
  }
}

export async function clearTestData() {
  try {
    await prisma.timeEntry.deleteMany();
    await prisma.subtask.deleteMany();
    await prisma.task.deleteMany();
    await prisma.projectVersion.deleteMany();
    await prisma.document.deleteMany();
    await prisma.serverInstance.deleteMany();
    await prisma.financialRecord.deleteMany();
    await prisma.project.deleteMany();
    await prisma.client.deleteMany();
    await prisma.workspaceMember.deleteMany();
    await prisma.workspace.deleteMany();

    await prisma.user.deleteMany({
      where: {
        globalRole: {
          not: "SUPER_ADMIN",
        },
      },
    });

    return { success: true, message: "Sistema limpiado correctamente. Solo se mantuvo al Super Admin." };
  } catch (error: any) {
    console.error("Error clearing data:", error);
    return { success: false, message: error.message };
  }
}
