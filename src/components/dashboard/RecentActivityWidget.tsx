"use client";

import React from "react";
import { mockRecentActivity } from "@/core/infrastructure/mockData";
import { Tag, CheckSquare, Cloud, FolderKanban } from "lucide-react";

export const RecentActivityWidget: React.FC = () => {
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
    <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-100">Actividad Reciente</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Ver todo
        </button>
      </div>

      <div className="space-y-3.5">
        {mockRecentActivity.map((act) => (
          <div key={act.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <img
                src={act.user.avatarUrl}
                alt={act.user.name}
                className="h-7 w-7 rounded-lg object-cover ring-1 ring-slate-800"
              />
              <div>
                <p className="text-slate-300">
                  <span className="font-semibold text-slate-100">{act.user.name}</span>{" "}
                  {act.action}{" "}
                  <span className="font-semibold text-indigo-400">{act.target}</span>
                </p>
                <p className="text-[10px] text-slate-500">{act.timestamp}</p>
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              {getIcon(act.type)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
