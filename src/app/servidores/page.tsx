"use client";

import React from "react";
import { Server, Activity, Cpu, HardDrive, ShieldCheck, RefreshCw, Plus, Terminal } from "lucide-react";
import { mockServers } from "@/core/infrastructure/mockData";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";

export default function ServidoresPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Server className="h-5 w-5 text-indigo-400" /> Infraestructura & Telemetría VPS
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Monitoreo en tiempo real de uso de CPU, RAM, Disco, Docker containers y certificados SSL.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start">
          <Plus className="h-4 w-4" />
          <span>Vincular Servidor</span>
        </button>
      </div>

      {/* Grid of Servers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockServers.map((srv) => (
          <div
            key={srv.id}
            className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-950 border border-indigo-700/60 text-indigo-400">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{srv.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">IP: {srv.ip} • Provider: Hetzner Cloud</p>
                </div>
              </div>

              <Badge variant="emerald" size="md">
                {srv.status}
              </Badge>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Cpu className="h-3.5 w-3.5 text-indigo-400" /> CPU
                  </span>
                  <span className="text-slate-100 font-bold">{srv.cpu}%</span>
                </div>
                <ProgressBar value={srv.cpu} color="bg-indigo-500" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-blue-400" /> RAM
                  </span>
                  <span className="text-slate-100 font-bold">{srv.ram}%</span>
                </div>
                <ProgressBar value={srv.ram} color="bg-blue-500" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <HardDrive className="h-3.5 w-3.5 text-emerald-400" /> Disco
                  </span>
                  <span className="text-slate-100 font-bold">{srv.disk}%</span>
                </div>
                <ProgressBar value={srv.disk} color="bg-emerald-500" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] font-bold text-slate-300 border border-slate-800">
                  Ubuntu 24.04 LTS
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] font-bold text-slate-300 border border-slate-800">
                  Docker v26.1
                </span>
              </div>

              <button className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                <Terminal className="h-3.5 w-3.5" /> Abrir Consola SSH
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
