"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { navigationItems } from "@/core/config/navigation";
import { mockCurrentUser } from "@/core/infrastructure/mockData";
import { cn } from "@/lib/utils";
import { ProfileModal } from "./ProfileModal";
import { getUserWorkspaces, switchActiveWorkspace, createWorkspace } from "@/core/application/actions/workspaceActions";
import { getNotifications } from "@/core/application/actions/notificationActions";
import { Modal } from "@/components/ui/Modal";
import { Plus, Check, Loader2, Building, ChevronDown, ChevronsLeft, ChevronsRight, ShieldCheck, LogOut } from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const currentUser = {
    name: session?.user?.name || mockCurrentUser.name,
    email: session?.user?.email || mockCurrentUser.email,
    avatarUrl: (session?.user as any)?.image || mockCurrentUser.avatarUrl,
    role: (session?.user as any)?.role || "SUPER_ADMIN",
  };

  // Workspace Switcher states
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNewWsModalOpen, setIsNewWsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [creatingWs, setCreatingWs] = useState(false);

  const fetchWorkspaces = async () => {
    const res = await getUserWorkspaces();
    if (res.success && res.data) {
      setWorkspaces(res.data);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
    getNotifications().then(res => {
      if (res.success && res.data) {
        setUnreadNotifCount(res.data.filter((n: any) => !n.isRead).length);
      }
    });
  }, [pathname]);

  const activeWorkspace = workspaces.find((w) => w.isActive) || workspaces[0];

  const handleSwitch = async (wsId: string) => {
    setIsDropdownOpen(false);
    const res = await switchActiveWorkspace(wsId);
    if (res.success) {
      fetchWorkspaces();
      window.location.reload();
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setCreatingWs(true);
    const res = await createWorkspace(newWsName.trim());
    if (res.success) {
      setNewWsName("");
      setIsNewWsModalOpen(false);
      setIsDropdownOpen(false);
      fetchWorkspaces();
      window.location.reload();
    } else {
      alert("Error al crear espacio: " + res.error);
    }
    setCreatingWs(false);
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-[#0b0e1a] border-r border-slate-800/60 flex flex-col justify-between transition-all duration-300 z-30 select-none",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Top Header & Workspace Selector */}
      <div className="p-4 space-y-4">
        {/* App Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl overflow-hidden ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/30 shrink-0">
            <img
              src="/nexus-logo-new.jpg"
              alt="NEXUS Emblem"
              className="h-full w-full object-cover"
            />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-extrabold text-white tracking-wider text-base leading-tight">
                NEXUS
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                Development Operations
              </p>
            </div>
          )}
        </div>

        {/* Workspace Switcher */}
        {!collapsed ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-extrabold shrink-0 shadow-md">
                  {activeWorkspace?.name ? activeWorkspace.name.substring(0, 2).toUpperCase() : "WS"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {activeWorkspace?.name || "Espacio de Trabajo"}
                  </p>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                    {activeWorkspace?.role || "MIEMBRO"}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0e1324] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                    {/* Propios */}
                    {workspaces.filter(w => w.role === "ADMIN" || w.role === "SUPER_ADMIN").length > 0 && (
                      <div>
                        <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Tus Espacios de Trabajo</p>
                        <div className="space-y-1 mt-1">
                          {workspaces.filter(w => w.role === "ADMIN" || w.role === "SUPER_ADMIN").map((w) => (
                            <button
                              key={w.id}
                              onClick={() => handleSwitch(w.id)}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                                w.isActive ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800/60'
                              }`}
                            >
                              <span className="truncate">{w.name}</span>
                              {w.isActive && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Compartidos */}
                    {workspaces.filter(w => w.role !== "ADMIN" && w.role !== "SUPER_ADMIN").length > 0 && (
                      <div>
                        <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Espacios Compartidos</p>
                        <div className="space-y-1 mt-1">
                          {workspaces.filter(w => w.role !== "ADMIN" && w.role !== "SUPER_ADMIN").map((w) => (
                            <button
                              key={w.id}
                              onClick={() => handleSwitch(w.id)}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                                w.isActive ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800/60'
                              }`}
                            >
                              <span className="truncate">{w.name}</span>
                              {w.isActive && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsNewWsModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-indigo-400 hover:bg-indigo-500/10 font-bold transition-colors cursor-pointer border-t border-slate-800 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Nuevo Espacio de Trabajo</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer"
              title={activeWorkspace?.name || "Espacio de Trabajo"}
              onClick={() => setCollapsed(false)}
            >
              {activeWorkspace?.name ? activeWorkspace.name.substring(0, 2).toUpperCase() : "WS"}
            </div>
          </div>
        )}

        {/* Modal para Crear Workspace */}
        <Modal isOpen={isNewWsModalOpen} onClose={() => setIsNewWsModalOpen(false)} title="Crear Nuevo Espacio de Trabajo">
          <form onSubmit={handleCreateWorkspace} className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Nombre del Espacio de Trabajo</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  required
                  type="text"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="Ej. Mi Agencia Tech, Proyecto X..."
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsNewWsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={creatingWs || !newWsName.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {creatingWs && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear Espacio
              </button>
            </div>
          </form>
        </Modal>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {(() => {
          const isSuperAdmin = session?.user?.email === "superadmin@nexus.com" || (session?.user as any)?.role === "SUPER_ADMIN";
          const userWorkspaceRole = activeWorkspace?.role || (session?.user as any)?.role || "ADMIN";

          return navigationItems.filter(item => {
            if (item.isSuperAdminOnly) {
              return isSuperAdmin;
            }
            if (!item.allowedRoles) return true;
            return item.allowedRoles.includes(userWorkspaceRole) || isSuperAdmin;
          }).map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group",
                isActive
                  ? "bg-indigo-600/90 text-white shadow-md shadow-indigo-600/30 font-semibold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                  )}
                />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </div>

              {!collapsed && (item.href === "/notificaciones" ? unreadNotifCount > 0 : !!item.badge) && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {item.href === "/notificaciones" ? unreadNotifCount : item.badge}
                </span>
              )}
            </Link>
          );
        });
        })()}
      </nav>

      {/* Bottom Profile & Toggle */}
      <div className="p-3 border-t border-slate-800/60 space-y-3">
        {/* Bottom User Profile */}
        {!collapsed ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex-1 flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-900/80 transition-colors cursor-pointer min-w-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-indigo-500/40 shrink-0"
                />
                <div className="truncate text-left min-w-0">
                  <p className="text-xs font-semibold text-slate-200 leading-tight truncate">
                    {currentUser.name}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <ShieldCheck className="h-3 w-3 text-indigo-400 shrink-0" />
                    <span className="truncate">{currentUser.role === "SUPER_ADMIN" ? "Super Administrador" : "Administrador"}</span>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Cerrar Sesión"
              className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Cerrar Sesión"
            className="flex justify-center w-full p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
          title={collapsed ? "Expandir Sidebar" : "Colapsar Sidebar"}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </aside>
  );
};
