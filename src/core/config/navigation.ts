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
  Users as UsersCore,
  Crown
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: number;
  allowedRoles?: string[];
  isSuperAdminOnly?: boolean;
}

export const navigationItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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
  { title: "Colaboradores", href: "/colaboradores", icon: UsersCore, allowedRoles: ["ADMIN", "MANAGER"] },
  { title: "Panel SuperAdmin", href: "/superadmin", icon: Crown, isSuperAdminOnly: true },
  { title: "Auditoría", href: "/auditoria", icon: ShieldAlert, allowedRoles: ["ADMIN"] },
  { title: "Notificaciones", href: "/notificaciones", icon: Bell },
  { title: "Configuración", href: "/configuracion", icon: Settings, allowedRoles: ["ADMIN", "MANAGER"] },
];
