"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace, getProjectAccessFilter, getTaskAccessFilter } from "@/lib/serverAuth";

export async function getDashboardMetrics(selectedDateStr?: string) {
  try {
    const { workspace, user, member, role } = await getCurrentWorkspace();
    const projectFilter = getProjectAccessFilter(user, member, role);
    const taskFilter = getTaskAccessFilter(user, member, role);

    let targetDate = selectedDateStr ? new Date(selectedDateStr) : new Date();
    targetDate.setHours(23, 59, 59, 999);
    
    const totalProjects = await prisma.project.count({
      where: { 
        workspaceId: workspace.id,
        createdAt: { lte: targetDate },
        ...(projectFilter ? { AND: [projectFilter] } : {})
      }
    });
    const activeProjects = await prisma.project.count({
      where: {
        workspaceId: workspace.id,
        createdAt: { lte: targetDate },
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
        createdAt: { lte: targetDate },
        ...(taskFilter ? { AND: [taskFilter] } : {})
      }
    });
    const completedTasks = await prisma.task.count({
      where: {
        project: { workspaceId: workspace.id },
        updatedAt: { lte: targetDate },
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
        updatedAt: { lte: targetDate },
        ...(taskFilter ? { AND: [taskFilter] } : {})
      },
      _sum: { loggedHs: true }
    });
    const totalLoggedHours = loggedHoursSum._sum?.loggedHs || 0;

    const financialIncomeSum = await prisma.financialRecord.aggregate({
      where: { 
        workspaceId: workspace.id, 
        date: { lte: targetDate },
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

export async function getDashboardData(selectedDateStr?: string) {
  try {
    const { workspace, user, member, role } = await getCurrentWorkspace();
    const projectFilter = getProjectAccessFilter(user, member, role);
    const taskFilter = getTaskAccessFilter(user, member, role);

    let targetDate = selectedDateStr ? new Date(selectedDateStr) : new Date();
    targetDate.setHours(23, 59, 59, 999);

    const [
      recentProjects,
      upcomingTasks,
      servers,
      recentActivity,
      projectsDistribution,
      rawCalendarEvents
    ] = await Promise.all([
      // Proyectos Recientes
      prisma.project.findMany({
        take: 4,
        where: { 
          workspaceId: workspace.id,
          updatedAt: { lte: targetDate },
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

      // Tareas Próximas (para widget de tareas, tomamos 4)
      prisma.task.findMany({
        take: 4,
        where: {
          project: { workspaceId: workspace.id },
          createdAt: { lte: targetDate },
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
          updatedAt: { lte: targetDate },
          ...(projectFilter ? { project: projectFilter } : {})
        },
        orderBy: { updatedAt: "desc" },
        include: { project: true }
      }),

      // Actividad Reciente 
      (role === "ADMIN" || role === "MANAGER" || (user as any)?.role === "SUPER_ADMIN") ? prisma.auditLog.findMany({
        take: 5,
        where: {
          timestamp: { lte: targetDate },
          user: {
            memberships: {
              some: { workspaceId: workspace.id }
            }
          }
        },
        orderBy: { timestamp: "desc" },
        include: { user: true }
      }) : Promise.resolve([]),

      // Distribución de Proyectos (Agrupado por estado)
      prisma.project.groupBy({
        by: ['status'],
        where: { 
          workspaceId: workspace.id,
          createdAt: { lte: targetDate },
          ...(projectFilter ? { AND: [projectFilter] } : {})
        },
        _count: {
          status: true
        }
      }),
      // Calendario de eventos: Tareas que no estén completadas, ordenadas por fecha límite
      prisma.task.findMany({
        take: 5,
        where: {
          project: { workspaceId: workspace.id },
          status: { notIn: ["COMPLETED", "ARCHIVED"] },
          dueDate: { not: null },
          ...(taskFilter ? { AND: [taskFilter] } : {})
        },
        orderBy: { dueDate: "asc" },
        include: { project: true }
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

    const formattedCalendarEvents = rawCalendarEvents.map((task: any) => {
      let color = "#6366f1";
      if (task.priority === "HIGH") color = "#10b981";
      if (task.priority === "URGENT") color = "#f59e0b";
      if (task.status === "COMPLETED" || task.status === "ARCHIVED") color = "#64748b";

      return {
        id: task.id,
        title: task.title,
        date: task.dueDate?.toISOString() || "",
        projectName: task.project?.name || "",
        color,
        status: task.status
      };
    });

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
        alerts,
        calendarEvents: formattedCalendarEvents
      }
    };
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    return { success: false, data: null, error: error.message };
  }
}

export async function getWeeklyProductivity(selectedDateStr?: string) {
  try {
    const { workspace } = await getCurrentWorkspace();
    
    let targetDate = selectedDateStr ? new Date(selectedDateStr) : new Date();
    if (isNaN(targetDate.getTime())) {
      targetDate = new Date();
    }

    // Get past 7 days up to targetDate
    const dates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(targetDate);
      d.setDate(targetDate.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const startDate = dates[0];
    const endDate = new Date(targetDate);
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

    // Fetch all tasks for projects in this workspace
    const tasks = await prisma.task.findMany({
      where: {
        project: { workspaceId: workspace.id },
      },
    });

    const priorityHoursMap: Record<string, number> = {
      LOW: 1.5,
      MEDIUM: 2.5,
      HIGH: 4.0,
      URGENT: 6.0,
    };

    // Group by day
    const chartData = dates.map(date => {
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const teHours = timeEntries
        .filter(te => te.date >= date && te.date < nextDay)
        .reduce((sum, te) => sum + te.hours, 0);

      const dayCompletedTasks = tasks.filter(
        t => (t.status === "DEPLOYED" || t.status === "COMPLETED") &&
             t.updatedAt >= date && t.updatedAt < nextDay
      );
      const dayCompletedCount = dayCompletedTasks.length;

      const dayActiveTasks = tasks.filter(
        t => t.updatedAt >= date && t.updatedAt < nextDay
      );

      let dayHours = teHours;

      if (dayHours === 0 && dayCompletedCount > 0) {
        dayHours = dayCompletedTasks.reduce((sum, t) => {
          if (t.loggedHs && t.loggedHs > 0) return sum + t.loggedHs;
          if (t.estimatedHs && t.estimatedHs > 0) return sum + t.estimatedHs;
          return sum + (priorityHoursMap[t.priority] || 2.5);
        }, 0);
      }

      return {
        name: dayName.charAt(0).toUpperCase() + dayName.slice(1).replace('.', ''),
        tasksCompleted: dayCompletedCount,
        hoursLogged: Number(dayHours.toFixed(1))
      };
    });

    return { success: true, data: chartData };
  } catch (error: any) {
    console.error("Error fetching weekly productivity:", error);
    return { success: false, data: [], error: error.message };
  }
}

export async function getFullCalendarEvents(month: number, year: number) {
  try {
    const { workspace, user, member, role } = await getCurrentWorkspace();
    const taskFilter = getTaskAccessFilter(user, member, role);
    
    // Rango del mes
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const tasks = await prisma.task.findMany({
      where: {
        project: { workspaceId: workspace.id },
        dueDate: {
          gte: startDate,
          lte: endDate
        },
        ...(taskFilter ? { AND: [taskFilter] } : {})
      },
      include: {
        project: true
      },
      orderBy: { dueDate: "asc" }
    });

    const formattedEvents = tasks.map((task) => {
      let color = "#6366f1"; // Default indigo
      if (task.priority === "HIGH") color = "#10b981"; // Emerald
      if (task.priority === "URGENT") color = "#f59e0b"; // Amber/Orange
      if (task.status === "COMPLETED" || task.status === "ARCHIVED") color = "#64748b"; // Slate

      return {
        id: task.id,
        title: task.title,
        date: task.dueDate?.toISOString() || "",
        projectName: task.project.name,
        color,
        status: task.status
      };
    });

    return { success: true, data: formattedEvents };
  } catch (error: any) {
    console.error("Error fetching full calendar events:", error);
    return { success: false, data: [], error: error.message };
  }
}
