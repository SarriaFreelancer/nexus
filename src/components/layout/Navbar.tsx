"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Search, Plus, Bell, Calendar, SlidersHorizontal, ShieldCheck } from "lucide-react";
import { mockCurrentUser } from "@/core/infrastructure/mockData";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { CalendarWidget } from "./CalendarWidget";
import { ProfileModal } from "./ProfileModal";

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const currentUser = {
    name: session?.user?.name || mockCurrentUser.name,
    email: session?.user?.email || mockCurrentUser.email,
    avatarUrl: (session?.user as any)?.image || mockCurrentUser.avatarUrl,
    role: (session?.user as any)?.role || "SUPER_ADMIN",
  };

  return (
    <>
      <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#090c15]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        {/* Search Bar Spotlight Trigger */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/50 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs w-80 transition-all shadow-inner"
          >
            <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="flex-1 text-left">Buscar en Nexus...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* Customization Button */}
          <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all">
            <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
            <span>Personalizar</span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Quick Create Action */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="h-8 w-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all"
            title="Crear Proyecto / Tarea / Cliente"
          >
            <Plus className="h-4 w-4" />
          </button>

          <NotificationBell />

          {/* Calendar Quick Action */}
          <CalendarWidget />

          {/* User Profile Avatar */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800/80 hover:opacity-80 transition-opacity cursor-pointer"
            title="Ver Perfil y Configuración"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="h-8 w-8 rounded-xl object-cover ring-2 ring-indigo-500/40"
            />
          </button>
        </div>
      </header>

      {/* Spotlight Command Modal */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
