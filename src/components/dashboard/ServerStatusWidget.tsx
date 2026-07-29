"use client";

import React from "react";
import { Server, Activity } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface ServerStatusWidgetProps {
  servers?: any[];
}

export const ServerStatusWidget: React.FC<ServerStatusWidgetProps> = ({ servers = [] }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Estado de Servidores</h3>
        </div>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Ver todas
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {servers.map((srv) => (
          <div
            key={srv.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{srv.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${srv.status === "ONLINE" ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{srv.project?.name || "General"}</span>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <Activity className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2 text-[11px] font-medium pt-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">CPU</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{Math.round(srv.cpuUsage)}%</span>
                <ProgressBar value={srv.cpuUsage} color={srv.cpuUsage > 80 ? "bg-rose-500" : "bg-indigo-500"} className="w-24" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">RAM</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{Math.round(srv.ramUsage)}%</span>
                <ProgressBar value={srv.ramUsage} color={srv.ramUsage > 80 ? "bg-rose-500" : "bg-blue-500"} className="w-24" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Disco</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{Math.round(srv.diskUsage)}%</span>
                <ProgressBar value={srv.diskUsage} color={srv.diskUsage > 90 ? "bg-rose-500" : "bg-emerald-500"} className="w-24" />
              </div>
            </div>
          </div>
        ))}
        {servers.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl">
            No hay servidores registrados.
          </div>
        )}
      </div>
    </div>
  );
};
