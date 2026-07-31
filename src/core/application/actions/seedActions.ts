"use server";

import { prisma } from "@/lib/prisma";
import { 
  mockProjects, 
  mockNextTasks, 
  mockClients, 
  mockServers 
} from "@/core/infrastructure/mockData";
import crypto from "crypto";
import bcrypt from "bcryptjs";

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
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function seedTestData() {
  try {
    // 1. Limpiar datos existentes
    await clearTestData();
    await prisma.workspaceMember.deleteMany();
    await prisma.workspace.deleteMany();

    // Preserve SUPER_ADMIN users
    await prisma.user.deleteMany({
      where: {
        globalRole: {
          not: "SUPER_ADMIN",
        },
      },
    });

    // 2. Crear Workspace principal
    const workspace = await prisma.workspace.create({
      data: {
        id: crypto.randomUUID(),
        name: "SarriaTech Workspace",
        slug: "sarriatech-workspace",
        subscriptionPlan: "FREE",
        maxWorkspaces: 2,
        maxProjects: 3,
        maxCollaborators: 5
      },
    });

    // Asignar el Super Admin a este Workspace
    let superAdmin = await prisma.user.findFirst({
      where: { email: "superadmin@nexus.com" }
    });

    if (!superAdmin) {
      const superHash = await bcrypt.hash("Superadmin123", 10);
      superAdmin = await prisma.user.create({
        data: {
          email: "superadmin@nexus.com",
          name: "Super Admin",
          password: superHash,
          globalRole: "SUPER_ADMIN"
        }
      });
    }

    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: superAdmin.id,
        role: "ADMIN"
      }
    });

    // 3. Crear usuario de prueba Admin
    const adminHash = await bcrypt.hash("Admin123", 10);
    const testAdminUser = await prisma.user.upsert({
      where: { email: "admin@nexus.com" },
      update: { password: adminHash, globalRole: "USER" },
      create: {
        email: "admin@nexus.com",
        name: "Admin Tester",
        password: adminHash,
        globalRole: "USER"
      }
    });

    // Espacio de Trabajo propio de Admin Tester
    const adminWorkspace = await prisma.workspace.create({
      data: {
        name: "Espacio Admin Test",
        slug: "espacio-admin-test-" + Date.now(),
        subscriptionPlan: "FREE",
        maxWorkspaces: 2,
        maxProjects: 3,
        maxCollaborators: 5
      }
    });

    await prisma.workspaceMember.create({
      data: {
        workspaceId: adminWorkspace.id,
        userId: testAdminUser.id,
        role: "ADMIN"
      }
    });

    // Invitar a Admin Tester como Desarrollador en el espacio compartido
    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: testAdminUser.id,
        role: "DEVELOPER"
      }
    });

    // 4. Crear Clientes
    const createdClients: Record<string, string> = {};
    for (const c of mockClients as any[]) {
      const client = await prisma.client.create({
        data: {
          workspaceId: workspace.id,
          contactName: c.name || c.contactName || "Contacto Principal",
          company: c.company,
          email: c.email,
          phone: c.phone || "",
          stage: c.status || c.stage || "LEAD",
        },
      });
      createdClients[c.id] = client.id;
    }

    // 5. Crear Proyectos
    for (const p of mockProjects as any[]) {
      const projectStatus = p.status === "En Desarrollo" ? "DEVELOPMENT" : p.status === "En Producción" ? "DEPLOYED" : "DEVELOPMENT";
      const project = await prisma.project.create({
        data: {
          workspaceId: workspace.id,
          name: p.name,
          code: p.code,
          category: p.category,
          description: p.description || "",
          technologies: JSON.stringify(p.technologies),
          estimatedHours: p.estimatedHours || 0,
          status: projectStatus as any,
          startDate: p.startDate ? new Date(p.startDate) : null,
          endDate: p.endDate ? new Date(p.endDate) : null,
          bannerUrl: p.bannerUrl,
          clientId: p.client?.id ? createdClients[p.client.id] || null : null,
        },
      });

      // Subtareas / Tareas asociadas
      for (let i = 0; i < 3; i++) {
        await prisma.task.create({
          data: {
            projectId: project.id,
            title: `Tarea ${i + 1} de ${project.name}`,
            status: i === 0 ? "COMPLETED" : i === 1 ? "IN_PROGRESS" : "TODO",
            priority: (i % 2 === 0 ? "HIGH" : "MEDIUM") as any,
            assigneeId: superAdmin.id,
          },
        });
      }
    }

    // 6. Crear Servidores de prueba
    for (const s of mockServers as any[]) {
      await prisma.serverInstance.create({
        data: {
          workspaceId: workspace.id,
          name: s.name,
          provider: s.provider || "AWS",
          ipAddress: s.ipAddress || "192.168.1.1",
          status: s.status || "ONLINE",
          cpuUsage: s.cpuUsage || 25,
          ramUsage: s.ramUsage || 40,
          diskUsage: s.diskUsage || 50,
        },
      });
    }

    return { success: true, message: "Base de datos inicializada correctamente con usuarios SuperAdmin y Admin Test." };
  } catch (error: any) {
    console.error("Error al ejecutar el Seeder:", error);
    return { success: false, error: error.message };
  }
}
