import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  GitFork,
  Tag,
  Users,
  FileText,
  BookOpen,
  Server,
  Rocket,
  DollarSign,
  BarChart3,
  Bot,
  Bell,
  Settings,
  ShieldAlert,
  Users as UsersCore
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: number;
  allowedRoles?: string[];
}

export const navigationItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Proyectos", href: "/proyectos", icon: FolderKanban },
  { title: "Tareas", href: "/tareas", icon: CheckSquare },
  { title: "Roadmaps", href: "/roadmaps", icon: GitFork },
  { title: "Versiones", href: "/versiones", icon: Tag },
  { title: "Clientes (CRM)", href: "/clientes", icon: UsersCore, allowedRoles: ["ADMIN", "MANAGER", "COMMERCIAL"] },
  { title: "Cotizaciones", href: "/cotizaciones", icon: FileText, allowedRoles: ["ADMIN", "MANAGER", "COMMERCIAL"] },
  { title: "Documentación", href: "/documentacion", icon: BookOpen },
  { title: "Servidores", href: "/servidores", icon: Server, allowedRoles: ["ADMIN", "DEVELOPER"] },
  { title: "Deploys", href: "/deploys", icon: Rocket, allowedRoles: ["ADMIN", "DEVELOPER"] },
  { title: "Finanzas", href: "/finanzas", icon: DollarSign, allowedRoles: ["ADMIN", "COMMERCIAL"] },
  { title: "Reportes", href: "/reportes", icon: BarChart3, allowedRoles: ["ADMIN", "MANAGER", "COMMERCIAL"] },
  { title: "IA Assistant", href: "/ia-assistant", icon: Bot },
  { title: "Usuarios", href: "/usuarios", icon: UsersCore, allowedRoles: ["ADMIN"] },
  { title: "Auditoría", href: "/auditoria", icon: ShieldAlert, allowedRoles: ["ADMIN"] },
  { title: "Notificaciones", href: "/notificaciones", icon: Bell, badge: 12 },
  { title: "Configuración", href: "/configuracion", icon: Settings, allowedRoles: ["ADMIN", "MANAGER"] },
];
