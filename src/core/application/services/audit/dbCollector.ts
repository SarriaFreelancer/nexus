import { prisma } from "@/lib/prisma";
import { AuditContext } from "@/core/domain/aiAuditTypes";

export async function collectDatabaseContext(projectId: string, workspaceId: string): Promise<Partial<AuditContext>> {
  const project = await prisma.project.findUnique({
    where: { id: projectId, workspaceId },
    include: {
      client: true,
      tasks: true,
      versions: true,
      servers: true,
      aiAudits: {
        orderBy: { createdAt: "desc" },
        take: 5
      },
      docs: true,
      projectEvents: {
        orderBy: { createdAt: "desc" },
        take: 50
      }
    }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: { user: true }
      },
      financials: {
        where: { type: { not: "" } } // Temporary bypass since projectId is not on FinancialRecord
      }
    }
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  // --- Project ---
  const projectContext = {
    id: project.id,
    name: project.name,
    code: project.code,
    description: project.description,
    status: project.status,
    priority: project.priority,
    category: project.category,
    technologies: project.technologies ? (JSON.parse(project.technologies as string) || []) : [],
    gitRepoUrl: project.gitRepoUrl,
    serverDomain: project.serverDomain,
    estimatedHours: project.estimatedHours,
    actualHours: project.actualHours,
    startDate: project.startDate?.toISOString() || null,
    endDate: project.endDate?.toISOString() || null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    clientName: project.client?.company || null,
    securityArchitecture: {
      authStrategy: "NextAuth.js JWT",
      oauthProviders: ["Google OAuth 2.0"],
      passwordHashing: "Bcrypt (10 salt rounds)",
      orm: "Prisma ORM (Parameterized Queries)",
      routeProtection: "Session & Role Auth (SUPER_ADMIN, ADMIN, USER)",
      auditLogging: "AuditLog enabled"
    }
  };

  // --- Tasks ---
  const totalTasks = project.tasks.length;
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  let overdue = 0;
  let unassigned = 0;
  let totalEstimatedHours = 0;
  let totalLoggedHours = 0;
  let completed = 0;

  project.tasks.forEach(task => {
    byStatus[task.status] = (byStatus[task.status] || 0) + 1;
    byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
    if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE") overdue++;
    if (!task.assigneeId) unassigned++;
    if (task.status === "DONE") completed++;
    totalEstimatedHours += task.estimatedHs || 0;
    totalLoggedHours += task.loggedHs || 0;
  });

  const tasksContext = {
    total: totalTasks,
    byStatus,
    byPriority,
    overdue,
    unassigned,
    averageCompletionDays: null, // Hard to calculate easily without history
    completionRate: totalTasks > 0 ? (completed / totalTasks) * 100 : 0,
    totalEstimatedHours,
    totalLoggedHours
  };

  // --- Versions ---
  const totalVersions = project.versions.length;
  const sortedVersions = [...project.versions].sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime());
  const latestVersion = sortedVersions[0] || null;

  let releaseFrequencyDays = null;
  if (sortedVersions.length > 1) {
    const timeDiff = sortedVersions[0].releaseDate.getTime() - sortedVersions[sortedVersions.length - 1].releaseDate.getTime();
    releaseFrequencyDays = (timeDiff / (1000 * 3600 * 24)) / (sortedVersions.length - 1);
  }

  const versionsContext = {
    total: totalVersions,
    latest: latestVersion ? {
      version: latestVersion.version,
      title: latestVersion.title,
      releaseDate: latestVersion.releaseDate.toISOString(),
      changelog: latestVersion.changelog || ""
    } : null,
    releaseFrequencyDays,
    versions: sortedVersions.slice(0, 5).map(v => ({
      version: v.version,
      title: v.title,
      releaseDate: v.releaseDate.toISOString(),
      tasksCount: project.tasks.filter(t => t.versionId === v.id).length
    }))
  };

  // --- Team ---
  const members = workspace.members.map(m => {
    const tasksAssigned = project.tasks.filter(t => t.assigneeId === m.id).length;
    return {
      name: m.user.name || m.user.email,
      role: m.role,
      tasksAssigned
    };
  }).filter(m => m.tasksAssigned > 0 || m.role === "ADMIN");

  const byRole: Record<string, number> = {};
  members.forEach(m => byRole[m.role] = (byRole[m.role] || 0) + 1);

  const teamContext = {
    totalMembers: members.length,
    byRole,
    members
  };

  // --- Documentation ---
  const totalDocs = project.docs.length;
  const docsByCategory: Record<string, number> = {};
  project.docs.forEach(d => {
    docsByCategory[d.category || "Uncategorized"] = (docsByCategory[d.category || "Uncategorized"] || 0) + 1;
  });

  const documentationContext = {
    totalDocs,
    byCategory: docsByCategory,
    hasDocs: totalDocs > 0
  };

  // --- Servers ---
  const serversContext = {
    total: project.servers.length,
    servers: project.servers.map(s => ({
      name: s.name,
      provider: s.provider || "Unknown",
      status: s.status,
      cpu: s.cpuUsage || 0,
      ram: s.ramUsage || 0,
      disk: s.diskUsage || 0
    }))
  };

  // --- Financials ---
  let totalIncome = 0;
  let totalExpenses = 0;
  workspace.financials.forEach(f => {
    if (f.type === "INCOME") totalIncome += f.amount;
    else if (f.type === "EXPENSE") totalExpenses += f.amount;
  });

  const financialsContext = {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    recordCount: workspace.financials.length
  };

  // --- Previous Audits ---
  const previousAuditsContext = project.aiAudits.map((a: any) => ({
    score: a.overallScore,
    createdAt: a.createdAt.toISOString(),
    provider: a.provider || "Unknown",
    findingsCount: (a.findings as any[])?.length || 0
  }));

  return {
    project: projectContext,
    tasks: tasksContext,
    versions: versionsContext,
    team: teamContext,
    documentation: documentationContext,
    servers: serversContext,
    financials: financialsContext,
    previousAudits: previousAuditsContext
  };
}
