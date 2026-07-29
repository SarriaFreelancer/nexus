export type GlobalRole = "SUPER_ADMIN" | "USER";

export type WorkspaceRole =
  | "ADMIN"
  | "MANAGER"
  | "DEVELOPER"
  | "DESIGNER"
  | "QA"
  | "COMMERCIAL"
  | "CLIENT"
  | "GUEST";

export type ProjectStatus =
  | "En Desarrollo"
  | "En Diseño"
  | "En Pruebas"
  | "En Producción"
  | "Finalizados"
  | "Pausado";

export type Priority = "Baja" | "Media" | "Alta" | "Urgente";

export type TaskStatus =
  | "Ideas"
  | "Backlog"
  | "Pendiente"
  | "Análisis"
  | "Diseño"
  | "Desarrollo"
  | "Testing"
  | "Deploy"
  | "Producción"
  | "Mantenimiento"
  | "Archivadas";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: WorkspaceRole;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  role: WorkspaceRole;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  category: string;
  status: ProjectStatus;
  progress: number;
  bannerUrl: string;
  logoUrl?: string;
  technologies: string[];
  clientName: string;
  team: User[];
  hoursEstimated: number;
  hoursReal: number;
  currentVersion: string;
  gitRepo?: string;
  serverDomain?: string;
  updatedAt: string;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: string;
  title: string;
  releaseDate: string;
  isCurrent: boolean;
  author: string;
  changesCount: number;
  changelog: string;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  projectName: string;
  assignee?: User;
  dueDate: string;
  subtasksCount: number;
  subtasksCompleted: number;
}

export interface CRMClient {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  stage: "Lead" | "Contactado" | "Propuesta" | "Negociación" | "Ganado" | "Facturación";
  value: number;
  lastInteraction: string;
}

export interface ServerTelemetry {
  id: string;
  name: string;
  environment: "Producción" | "Staging" | "Backups" | "Desarrollo";
  ip: string;
  status: "ONLINE" | "WARNING" | "OFFLINE";
  cpu: number;
  ram: number;
  disk: number;
}

export interface ActivityItem {
  id: string;
  user: User;
  action: string;
  target: string;
  timestamp: string;
  type: "version" | "task" | "project" | "server" | "crm";
}

export interface SystemAlert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  timestamp: string;
}

export interface SystemMetrics {
  activeProjects: number;
  activeProjectsGrowth: number;
  inProgressTasks: number;
  inProgressTasksGrowth: number;
  activeClients: number;
  activeClientsGrowth: number;
  monthlyRevenue: number;
  monthlyRevenueGrowth: number;
  loggedHours: number;
  loggedHoursGrowth: number;
}
