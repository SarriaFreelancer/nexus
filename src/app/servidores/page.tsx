"use client";

import React, { useState, useEffect } from "react";
import { Server, Plus, Activity, HardDrive, Cpu, Terminal, ArrowUpRight } from "lucide-react";
import { getServers } from "@/core/application/actions/serverActions";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { CreateServerForm } from "@/components/dashboard/CreateServerForm";

export default function ServidoresPage() {
  const [servers, setServers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchServers = () => {
    getServers().then(res => {
      if (res.success && res.data) setServers(res.data);
    });
  };

  useEffect(() => {
    fetchServers();
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Servidor">
        <CreateServerForm 
          onCancel={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchServers();
          }} 
        />
      </Modal>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Server className="h-5 w-5 text-indigo-400" /> Infraestructura & DevOps
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Monitoreo en tiempo real, despliegues continuos y estado de los servidores.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Añadir Servidor</span>
        </button>
      </div>

      {/* Server Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {servers.map((srv) => (
          <div
            key={srv.id}
            className="bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${srv.status === "ONLINE" ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-indigo-400 transition-colors">
                    {srv.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{srv.ipAddress}</p>
                </div>
              </div>
              <Badge variant={srv.status === "ONLINE" ? "emerald" : "rose"}>
                {srv.status}
              </Badge>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800/60">
              Provider: <span className="text-slate-700 dark:text-slate-300 font-medium">{srv.provider}</span>
              <br />
              Project: <span className="text-slate-700 dark:text-slate-300 font-medium">{srv.project?.name || "N/A"}</span>
            </div>

            {/* Metrics */}
            <div className="space-y-4">
              {/* CPU */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                    <Cpu className="h-3.5 w-3.5" /> CPU
                  </span>
                  <span className={`font-mono font-semibold ${srv.cpuUsage > 80 ? 'text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {srv.cpuUsage}%
                  </span>
                </div>
                <ProgressBar value={srv.cpuUsage} color={srv.cpuUsage > 80 ? "bg-rose-500" : "bg-indigo-500"} />
              </div>

              {/* RAM */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                    <Activity className="h-3.5 w-3.5" /> RAM
                  </span>
                  <span className={`font-mono font-semibold ${srv.ramUsage > 80 ? 'text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {srv.ramUsage}%
                  </span>
                </div>
                <ProgressBar value={srv.ramUsage} color={srv.ramUsage > 80 ? "bg-rose-500" : "bg-indigo-500"} />
              </div>

              {/* Storage */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                    <HardDrive className="h-3.5 w-3.5" /> Storage
                  </span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {srv.diskUsage}%
                  </span>
                </div>
                <ProgressBar value={srv.diskUsage} color="bg-emerald-500" />
              </div>
            </div>

            {/* Actions overlay on hover */}
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30">
                <Terminal className="h-3.5 w-3.5" /> Console
              </button>
              <button className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-300 dark:border-slate-700">
                Detalles <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
