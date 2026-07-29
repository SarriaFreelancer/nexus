"use client";

import React from "react";
import { mockServers } from "@/core/infrastructure/mockData";
import { Server, Activity } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const ServerStatusWidget: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100">Estado de Servidores</h3>
        </div>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Ver todas
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockServers.map((srv) => (
          <div
            key={srv.id}
            className="p-4 rounded-2xl bg-[#0f1424] border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">{srv.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-medium">{srv.environment}</span>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                <Activity className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2 text-[11px] font-medium pt-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">CPU</span>
                <span className="text-slate-200 font-bold">{srv.cpu}%</span>
                <ProgressBar value={srv.cpu} color="bg-indigo-500" className="w-24" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">RAM</span>
                <span className="text-slate-200 font-bold">{srv.ram}%</span>
                <ProgressBar value={srv.ram} color="bg-blue-500" className="w-24" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">Disco</span>
                <span className="text-slate-200 font-bold">{srv.disk}%</span>
                <ProgressBar value={srv.disk} color="bg-emerald-500" className="w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
