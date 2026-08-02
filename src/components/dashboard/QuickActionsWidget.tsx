"use client";

import React from "react";
import { FolderPlus, CheckSquare, Users, Rocket, Tag, FileText } from "lucide-react";

export const QuickActionsWidget: React.FC = () => {
  const actions = [
    { label: "Nuevo Proyecto", icon: FolderPlus, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
    { label: "Nueva Tarea", icon: CheckSquare, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Nuevo Cliente", icon: Users, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { label: "Nuevo Deploy", icon: Rocket, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10" },
    { label: "Nueva Versión", icon: Tag, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
    { label: "Nuevo Documento", icon: FileText, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-500/10" },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 px-1">
        Acciones Rápidas
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all group text-left"
            >
              <div className={`p-2 rounded-xl ${action.bg} transition-colors`}>
                <Icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
