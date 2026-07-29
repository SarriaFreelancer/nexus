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
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: number;
}

export const navigationItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Proyectos", href: "/proyectos", icon: FolderKanban },
  { title: "Tareas", href: "/tareas", icon: CheckSquare },
  { title: "Roadmaps", href: "/roadmaps", icon: GitFork },
  { title: "Versiones", href: "/versiones", icon: Tag },
  { title: "Clientes (CRM)", href: "/clientes", icon: Users },
  { title: "Cotizaciones", href: "/cotizaciones", icon: FileText },
  { title: "Documentación", href: "/documentacion", icon: BookOpen },
  { title: "Servidores", href: "/servidores", icon: Server },
  { title: "Deploys", href: "/deploys", icon: Rocket },
  { title: "Finanzas", href: "/finanzas", icon: DollarSign },
  { title: "Reportes", href: "/reportes", icon: BarChart3 },
  { title: "IA Assistant", href: "/ia-assistant", icon: Bot },
  { title: "Notificaciones", href: "/notificaciones", icon: Bell, badge: 12 },
  { title: "Configuración", href: "/configuracion", icon: Settings },
];
