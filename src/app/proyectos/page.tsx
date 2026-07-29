"use client";

import React, { useState } from "react";
import { mockProjects } from "@/core/infrastructure/mockData";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { FolderKanban, Plus, Search, Filter, GitBranch, ExternalLink, Globe, Layers } from "lucide-react";

export default function ProyectosPage() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("TODOS");

  const filtered = mockProjects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === "TODOS" || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-indigo-400" /> Proyectos Enterprise
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Gestión 360° de repositorios, arquitectura, versiones SemVer y asignaciones del equipo.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start">
          <Plus className="h-4 w-4" />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0f1424] border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, categoría o tech..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {["TODOS", "En Desarrollo", "En Diseño", "En Pruebas", "En Producción"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((proj) => (
          <div
            key={proj.id}
            className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center font-black text-indigo-300 text-sm shadow-md">
                    {proj.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-base group-hover:text-indigo-400 transition-colors">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Cliente: {proj.clientName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="purple" size="md">
                    v{proj.currentVersion}
                  </Badge>
                  <Badge
                    variant={
                      proj.status === "En Desarrollo"
                        ? "indigo"
                        : proj.status === "En Diseño"
                        ? "blue"
                        : proj.status === "En Pruebas"
                        ? "emerald"
                        : "amber"
                    }
                    size="md"
                  >
                    {proj.status}
                  </Badge>
                </div>
              </div>

              {/* Progress & Metrics */}
              <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">Progreso del proyecto</span>
                  <span className="text-slate-200 font-bold">{proj.progress}%</span>
                </div>
                <ProgressBar value={proj.progress} color="bg-gradient-to-r from-indigo-500 to-purple-500" />
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                  <span>Horas Est.: {proj.hoursEstimated}h</span>
                  <span>Horas Reales: {proj.hoursReal}h</span>
                </div>
              </div>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {proj.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Links & Team */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/60 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                {proj.gitRepo && (
                  <a
                    href={`https://${proj.gitRepo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                  >
                    <GitBranch className="h-3.5 w-3.5" /> Git
                  </a>
                )}
                {proj.serverDomain && (
                  <a
                    href={`https://${proj.serverDomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" /> Server
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500">Equipo:</span>
                <AvatarGroup users={proj.team} limit={4} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
