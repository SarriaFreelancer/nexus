"use client";

import React from "react";
import { mockSystemAlerts } from "@/core/infrastructure/mockData";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export const SystemAlertsWidget: React.FC = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-400 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-100">Alertas del Sistema</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Ver todas
        </button>
      </div>

      <div className="space-y-3">
        {mockSystemAlerts.map((alt) => (
          <div
            key={alt.id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3">
              {getIcon(alt.type)}
              <p className="text-xs font-medium text-slate-200">{alt.message}</p>
            </div>
            <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
              {alt.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
