"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace, getProjectAccessFilter, getTaskAccessFilter } from "@/lib/serverAuth";

export async function getDashboardMetrics() {
  try {
    const { workspace, user, member, role } = await getCurrentWorkspace();
    const projectFilter = getProjectAccessFilter(user, member, role);
    const taskFilter = getTaskAccessFilter(user, member, role);

    const totalProjects = await prisma.project.count({
      where: { 
        workspaceId: workspace.id,
        ...(projectFilter ? { AND: [projectFilter] } : {})
      }
    });
    const activeProjects = await prisma.project.count({
      where: {
        workspaceId: workspace.id,
        status: {
          notIn: ["PAUSED", "COMPLETED", "ARCHIVED"]
        },
        ...(projectFilter ? { AND: [projectFilter] } : {})
      }
    });

    // To count tasks in a workspace, we query tasks that belong to projects of that workspace
    const totalTasks = await prisma.task.count({
      where: { 
        project: { workspaceId: workspace.id },
        ...(taskFilter ? { AND: [taskFilter] } : {})
      }
    });
    const completedTasks = await prisma.task.count({
      where: {
        project: { workspaceId: workspace.id },
        status: {
          in: ["DEPLOYED", "COMPLETED"]
        },
        ...(taskFilter ? { AND: [taskFilter] } : {})
      }
    });

    const totalClients = await prisma.client.count({
      where: { 
        workspaceId: workspace.id,
        // Optional: filter clients to only those belonging to allowed projects if strictly needed
      }
    });

    const loggedHoursSum = await prisma.task.aggregate({
      where: { 
        project: { workspaceId: workspace.id },
        ...(taskFilter ? { AND: [taskFilter] } : {})
      },
      _sum: { loggedHs: true }
    });
    const totalLoggedHours = loggedHoursSum._sum?.loggedHs || 0;

    const financialIncomeSum = await prisma.financialRecord.aggregate({
      where: { 
        workspaceId: workspace.id, 
        type: "INCOME",
        // Project level filtering could be applied if FinancialRecord was linked to projects
      },
      _sum: { amount: true }
    });
    const totalIncome = (role === "ADMIN" || role === "MANAGER" || (user as any)?.role === "SUPER_ADMIN") ? (financialIncomeSum._sum?.amount || 0) : 0;

    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      success: true,
      data: {
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        totalClients,
        taskProgress,
        totalLoggedHours,
        totalIncome,
      }
    };
  } catch (error: any) {
    console.error("Error fetching dashboard metrics:", error);
    return { success: false, data: null, error: error.message };
  }
}

export async function getDashboardData() {
  try {
    const { workspace, user, member, role } = await getCurrentWorkspace();
    const projectFilter = getProjectAccessFilter(user, member, role);
    const taskFilter = getTaskAccessFilter(user, member, role);

    const [
      recentProjects,
      upcomingTasks,
      servers,
      recentActivity,
      projectsDistribution
    ] = await Promise.all([
      // Proyectos Recientes
      prisma.project.findMany({
        take: 4,
        where: { 
          workspaceId: workspace.id,
          ...(projectFilter ? { AND: [projectFilter] } : {})
        },
        orderBy: { updatedAt: "desc" },
        include: {
          client: true,
          tasks: true,
          workspace: {
            include: {
              members: {
                include: { user: true }
              }
            }
          }
        }
      }),

      // Tareas Próximas
      prisma.task.findMany({
        take: 4,
        where: {
          project: { workspaceId: workspace.id },
          status: { notIn: ["COMPLETED", "ARCHIVED"] },
          ...(taskFilter ? { AND: [taskFilter] } : {})
        },
        orderBy: [
          { priority: "desc" },
          { dueDate: "asc" }
        ],
        include: {
          project: true,
          assignee: true
        }
      }),

      // Servidores
      prisma.serverInstance.findMany({
        take: 4,
        where: { 
          workspaceId: workspace.id,
          ...(projectFilter ? { project: projectFilter } : {})
        },
        orderBy: { updatedAt: "desc" },
        include: { project: true }
      }),

      // Actividad Reciente 
      (role === "ADMIN" || role === "MANAGER" || (user as any)?.role === "SUPER_ADMIN") ? prisma.auditLog.findMany({
        take: 5,
        orderBy: { timestamp: "desc" },
        include: { user: true }
      }) : Promise.resolve([]),

      // Distribución de Proyectos (Agrupado por estado)
      prisma.project.groupBy({
        by: ['status'],
        where: { 
          workspaceId: workspace.id,
          ...(projectFilter ? { AND: [projectFilter] } : {})
        },
        _count: {
          status: true
        }
      })
    ]);

    // Calcular distribución de proyectos
    const distributionColorMap: Record<string, string> = {
      DISCOVERY: "#8b5cf6",
      DESIGN: "#3b82f6",
      DEVELOPMENT: "#6366f1",
      TESTING: "#10b981",
      DEPLOYED: "#f59e0b",
      MAINTENANCE: "#64748b",
      PAUSED: "#ef4444"
    };

    const totalProjects = projectsDistribution.reduce((acc, curr) => acc + curr._count.status, 0);
    
    const statusTranslationMap: Record<string, string> = {
      DISCOVERY: "Descubrimiento",
      DESIGN: "En Diseño",
      DEVELOPMENT: "En Desarrollo",
      TESTING: "En Pruebas",
      DEPLOYED: "En Producción",
      MAINTENANCE: "Mantenimiento",
      PAUSED: "Pausado",
      ARCHIVED: "Finalizado"
    };

    const formattedDistribution = projectsDistribution.map(item => ({
      name: statusTranslationMap[item.status] || item.status,
      count: item._count.status,
      percentage: totalProjects > 0 ? Number(((item._count.status / totalProjects) * 100).toFixed(1)) : 0,
      color: distributionColorMap[item.status] || "#cbd5e1"
    }));

    // Simular Alertas (por ej. si hay servidores con RAM/CPU alta)
    const alerts = servers
      .filter(s => s.cpuUsage > 80 || s.ramUsage > 80)
      .map(s => ({
        id: `alt-${s.id}`,
        type: s.cpuUsage > 90 || s.ramUsage > 90 ? "error" : "warning",
        message: `Alto uso de recursos en ${s.name} (${s.cpuUsage}% CPU, ${s.ramUsage}% RAM)`,
        timestamp: new Date().toISOString()
      }));

    return {
      success: true,
      data: {
        recentProjects,
        upcomingTasks,
        servers,
        recentActivity,
        projectDistribution: formattedDistribution,
        alerts
      }
    };
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    return { success: false, data: null, error: error.message };
  }
}

export async function getWeeklyProductivity() {
  try {
    const { workspace } = await getCurrentWorkspace();
    const today = new Date();
    // Get past 7 days
    const dates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const startDate = dates[0];
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    // Fetch time entries in this range for tasks in this workspace
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        task: { project: { workspaceId: workspace.id } },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Fetch tasks completed in this range for projects in this workspace
    const completedTasks = await prisma.task.findMany({
      where: {
        project: { workspaceId: workspace.id },
        status: { in: ["DEPLOYED", "COMPLETED"] },
        updatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Group by day
    const chartData = dates.map(date => {
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const dayHours = timeEntries
        .filter(te => te.date >= date && te.date < nextDay)
        .reduce((sum, te) => sum + te.hours, 0);

      const dayCompleted = completedTasks
        .filter(t => t.updatedAt >= date && t.updatedAt < nextDay)
        .length;

      return {
        name: dayName.charAt(0).toUpperCase() + dayName.slice(1), // e.g. "Lun", "Mar"
        tasksCompleted: dayCompleted,
        hoursLogged: dayHours
      };
    });

    return { success: true, data: chartData };
  } catch (error: any) {
    console.error("Error fetching weekly productivity:", error);
    return { success: false, data: [], error: error.message };
  }
}
