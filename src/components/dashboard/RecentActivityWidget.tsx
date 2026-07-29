"use client";

import React from "react";
import { Tag, CheckSquare, Cloud, FolderKanban } from "lucide-react";

interface RecentActivityWidgetProps {
  activities?: any[];
}

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ activities = [] }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "version":
        return <Tag className="h-3.5 w-3.5 text-indigo-400" />;
      case "task":
        return <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />;
      case "project":
        return <FolderKanban className="h-3.5 w-3.5 text-blue-400" />;
      case "server":
        return <Cloud className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <Tag className="h-3.5 w-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Actividad Reciente</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Ver todo
        </button>
      </div>

      <div className="space-y-3.5">
        {activities.map((act) => (
          <div key={act.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              {act.user?.avatarUrl ? (
                <img
                  src={act.user.avatarUrl}
                  alt={act.user.name}
                  className="h-7 w-7 rounded-lg object-cover ring-1 ring-slate-800"
                />
              ) : (
                <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  {act.user?.name?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <p className="text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{act.user?.name || "Usuario"}</span>{" "}
                  {act.action}{" "}
                  <span className="font-semibold text-indigo-400">{act.details?.target || act.entity}</span>
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {new Date(act.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {getIcon(act.details?.type || "project")}
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No hay actividad reciente.</div>
        )}
      </div>
    </div>
  );
};
