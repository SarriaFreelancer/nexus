"use client";

import React from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface SystemAlertsWidgetProps {
  alerts?: any[];
}

export const SystemAlertsWidget: React.FC<SystemAlertsWidgetProps> = ({ alerts = [] }) => {
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
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Alertas del Sistema</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Ver todas
        </button>
      </div>

      <div className="space-y-3">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3">
              {getIcon(alt.type)}
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{alt.message}</p>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">
              {new Date(alt.timestamp).toLocaleDateString(undefined, { hour: 'numeric', minute: 'numeric' })}
            </span>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">Sistemas funcionando correctamente.</div>
        )}
      </div>
    </div>
  );
};
