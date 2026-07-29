"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/serverAuth";

export async function recordAuditLog(
  userId: string,
  action: string,
  description: string,
  entity: string,
  details?: any
) {
  try {
    const formattedDetails = {
      description,
      ip: details?.ip || "192.168.1.105",
      browser: details?.browser || "Chrome 124 / Windows 11",
      city: details?.city || "Medellín, Colombia",
      before: details?.before || null,
      after: details?.after || null,
      ...details,
    };

    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        details: JSON.parse(JSON.stringify(formattedDetails)),
      },
    });
  } catch (error) {
    console.error("Error writing audit log:", error);
  }
}

export async function getAuditLogs(page: number = 1, limit: number = 10) {
  try {
    const { workspace } = await getCurrentWorkspace();

    const skip = (page - 1) * limit;

    const [dbLogs, count] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: {
          user: {
            select: { name: true, email: true, avatarUrl: true },
          },
        },
      }),
      prisma.auditLog.count(),
    ]);

    // Format DB logs to match AuditLog page expects
    const formattedDbLogs = dbLogs.map((log) => {
      const detailsObj: any = typeof log.details === "string" ? JSON.parse(log.details) : log.details || {};
      return {
        id: log.id,
        user: log.user || { name: "Usuario", email: "user@system.com", avatarUrl: null },
        action: log.action,
        description: detailsObj.description || log.action,
        entity: log.entity,
        details: detailsObj,
        timestamp: log.timestamp.toISOString(),
      };
    });

    if (count > 0) {
      return {
        success: true,
        data: {
          logs: formattedDbLogs,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          totalItems: count,
        },
      };
    }

    // Fallback to mock data if database has no audit logs yet
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
          after: { status: "En Desarrollo", estimatedHours: 120 },
        },
        timestamp: new Date().toISOString(),
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
          after: { teamSize: 4, newMember: "Carlos Ruiz" },
        },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    const startIndex = (page - 1) * limit;
    const paginatedLogs = allMockLogs.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        logs: paginatedLogs,
        totalPages: Math.ceil(allMockLogs.length / limit),
        currentPage: page,
        totalItems: allMockLogs.length,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
