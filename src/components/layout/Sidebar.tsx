"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/core/config/navigation";
import { mockCurrentUser } from "@/core/infrastructure/mockData";
import { ChevronDown, ChevronsLeft, ChevronsRight, Layers, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileModal } from "./ProfileModal";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
              src="/nexus-logo.png"
              alt="NEXUS Emblem"
              className="h-full w-full object-cover object-top scale-125"
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
          <button className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 text-left transition-all">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-400 text-xs font-bold">
                ST
              </div>
              <span className="text-xs font-semibold text-slate-200 truncate">
                SarriaTech Workspace
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        ) : (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-lg bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-400 text-xs font-bold" title="SarriaTech Workspace">
              ST
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navigationItems.map((item) => {
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

              {!collapsed && item.badge && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile & Toggle */}
      <div className="p-3 border-t border-slate-800/60 space-y-3">
        {!collapsed ? (
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-900/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={mockCurrentUser.avatarUrl}
                alt={mockCurrentUser.name}
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-indigo-500/40"
              />
              <div className="truncate text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight truncate">
                  {mockCurrentUser.name}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <ShieldCheck className="h-3 w-3 text-indigo-400 shrink-0" />
                  <span className="truncate">Super Administrador</span>
                </div>
              </div>
            </div>
          </button>
        ) : (
          <button onClick={() => setIsProfileOpen(true)} className="flex justify-center w-full hover:opacity-80 transition-opacity">
            <img
              src={mockCurrentUser.avatarUrl}
              alt={mockCurrentUser.name}
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-indigo-500/40"
            />
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
