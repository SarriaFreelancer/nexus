"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/serverAuth";

export async function getAuditLogs(page: number = 1, limit: number = 10) {
  try {
    const { workspace, role } = await getCurrentWorkspace();
    
    // En una aplicación real usaríamos findMany con paginación
    // let logs = await prisma.auditLog.findMany({
    //   where: { ... }, skip: (page-1)*limit, take: limit 
    // });
    // Por ahora retornamos datos simulados.

    const allMockLogs = [
      {
        id: "log-1",
        user: { name: "David Sarria", email: "david@sarriatech.com", avatarUrl: "https://i.pravatar.cc/150?u=david" },
        action: "MODIFIED_PROJECT",
        description: "Proyecto Modificado",
        entity: "Nexus CRM",
        details: {
          ip: "192.168.1.100",
          browser: "Chrome 120 / Windows 11",
          city: "Medellín, Colombia",
          before: { status: "En Diseño", estimatedHours: 80 },
          after: { status: "En Desarrollo", estimatedHours: 120 }
        },
        timestamp: new Date().toISOString()
      },
      {
        id: "log-2",
        user: { name: "Ana García", email: "ana@sarriatech.com", avatarUrl: "https://i.pravatar.cc/150?u=ana" },
        action: "ADDED_COLLABORATOR",
        description: "Agregó colaborador",
        entity: "Nexus App (Proyecto)",
        details: {
          ip: "10.0.0.54",
          browser: "Safari 17 / macOS",
          city: "Bogotá, Colombia",
          before: { teamSize: 3 },
          after: { teamSize: 4, newMember: "Carlos Ruiz" }
        },
        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        id: "log-3",
        user: { name: "Carlos Ruiz", email: "carlos@sarriatech.com", avatarUrl: "https://i.pravatar.cc/150?u=carlos" },
        action: "JOINED_PROJECT",
        description: "Colaborador se unió",
        entity: "Nexus App (Proyecto)",
        details: {
          ip: "172.16.0.2",
          browser: "Firefox 122 / Linux",
          city: "Cali, Colombia",
          before: { isMember: false },
          after: { isMember: true, role: "DEVELOPER" }
        },
        timestamp: new Date(Date.now() - 4000000).toISOString() 
      },
      {
        id: "log-4",
        user: { name: "David Sarria", email: "david@sarriatech.com", avatarUrl: "https://i.pravatar.cc/150?u=david" },
        action: "SHARED_PROJECT",
        description: "Compartió el proyecto",
        entity: "API Gateway",
        details: {
          ip: "192.168.1.100",
          browser: "Chrome 120 / Windows 11",
          city: "Medellín, Colombia",
          before: { visibility: "PRIVATE" },
          after: { visibility: "SHARED", sharedWith: "Cliente Externo" }
        },
        timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      }
    ];

    // Simular 50 items para paginación
    const extendedLogs = [...allMockLogs];
    for (let i = 5; i <= 35; i++) {
      extendedLogs.push({
        id: `log-${i}`,
        user: { name: "Sistema", email: "system@sarriatech.com", avatarUrl: "https://i.pravatar.cc/150?u=sys" },
        action: "SYSTEM_BACKUP",
        description: "Backup automático",
        entity: "Database",
        details: {
          ip: "127.0.0.1",
          browser: "Cron Job",
          city: "AWS us-east-1",
          before: { lastBackup: "Ayer" },
          after: { lastBackup: "Hoy" }
        },
        timestamp: new Date(Date.now() - (86400000 * i)).toISOString()
      });
    }

    const startIndex = (page - 1) * limit;
    const paginatedLogs = extendedLogs.slice(startIndex, startIndex + limit);

    return { 
      success: true, 
      data: {
        logs: paginatedLogs,
        totalPages: Math.ceil(extendedLogs.length / limit),
        currentPage: page,
        totalItems: extendedLogs.length
      } 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
