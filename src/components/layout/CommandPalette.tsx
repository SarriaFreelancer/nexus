"use client";

import React, { useState, useEffect } from "react";
import { Search, FolderKanban, Users, CheckSquare, Server, BookOpen, X, Command } from "lucide-react";
import { mockProjects, mockClients, mockNextTasks, mockServers } from "@/core/infrastructure/mockData";
import { useRouter } from "next/navigation";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProjects = mockProjects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) || p.code.toLowerCase().includes(query.toLowerCase())
  );
  const filteredClients = mockClients.filter((c) =>
    c.company.toLowerCase().includes(query.toLowerCase()) || c.contactName.toLowerCase().includes(query.toLowerCase())
  );
  const filteredTasks = mockNextTasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()) || t.code.toLowerCase().includes(query.toLowerCase())
  );
  const filteredServers = mockServers.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) || s.ip.includes(query)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="h-5 w-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar proyectos, tareas, clientes, servidores, repos o documentos... (Esc para salir)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <FolderKanban className="h-3.5 w-3.5" /> Proyectos ({filteredProjects.length})
              </div>
              <div className="space-y-1">
                {filteredProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      router.push(`/proyectos`);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-600/20 hover:border hover:border-indigo-500/30 cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-indigo-950 border border-indigo-700/50 flex items-center justify-center font-bold text-indigo-300 text-[10px] overflow-hidden shrink-0">
                        {proj.bannerUrl ? (
                          <img src={proj.bannerUrl} alt={proj.name} className="w-full h-full object-cover" />
                        ) : (
                          proj.code
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{proj.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{proj.category} • {proj.clientName}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      v{proj.currentVersion}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5" /> Tareas ({filteredTasks.length})
              </div>
              <div className="space-y-1">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      router.push(`/tareas`);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-600/20 hover:border hover:border-emerald-500/30 cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                        {task.code}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{task.projectName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CRM Clients */}
          {filteredClients.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Clientes CRM ({filteredClients.length})
              </div>
              <div className="space-y-1">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => {
                      router.push(`/clientes`);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-600/20 hover:border hover:border-blue-500/30 cursor-pointer transition-all text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{client.company}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{client.contactName} • {client.email}</p>
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                      {client.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Servers */}
          {filteredServers.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5" /> Servidores ({filteredServers.length})
              </div>
              <div className="space-y-1">
                {filteredServers.map((server) => (
                  <div
                    key={server.id}
                    onClick={() => {
                      router.push(`/servidores`);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-600/20 hover:border hover:border-amber-500/30 cursor-pointer transition-all text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{server.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{server.environment} • IP: {server.ip}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {server.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <Command className="h-3 w-3" />
            <span>Navega con flechas y presiona Enter</span>
          </div>
          <span>SarriaTech Spotlight Engine v1.0</span>
        </div>
      </div>
    </div>
  );
};
