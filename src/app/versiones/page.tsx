"use client";

import React from "react";
import { Tag, Plus, GitCommit, Calendar, CheckCircle2, ArrowRight } from "lucide-react";
import { mockProjects } from "@/core/infrastructure/mockData";
import { Badge } from "@/components/ui/Badge";

export default function VersionesPage() {
  const versionsList = [
    {
      version: "2.8.1",
      project: "GNS",
      date: "28 Mayo 2025",
      author: "David Sarria",
      isCurrent: true,
      changes: [
        "Implementación del módulo de telemetría de servidores real-time",
        "Optimización de rendimiento en consultas Prisma multi-workspace",
        "Corrección de bug en asignación de tareas Kanban",
      ],
    },
    {
      version: "1.2.0",
      project: "Inventario Pro",
      date: "24 Mayo 2025",
      author: "María Gómez",
      isCurrent: true,
      changes: [
        "Sincronización automática de código de barras con escáner USB",
        "Exportación de reportes de inventario a Excel y PDF",
      ],
    },
    {
      version: "1.0.0-rc2",
      project: "Landing Constructora",
      date: "20 Mayo 2025",
      author: "Carlos Ruiz",
      isCurrent: false,
      changes: [
        "Agregadas animaciones 3D con Framer Motion y WebGL",
        "Formulario de contacto vinculado directamente al CRM",
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Tag className="h-5 w-5 text-indigo-400" /> Control de Versiones SemVer
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Historial de releases (SemVer 2.0.0), changelogs automáticos y commits vinculados por proyecto.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start">
          <Plus className="h-4 w-4" />
          <span>Crear Nueva Versión</span>
        </button>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {versionsList.map((ver, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 hover:border-slate-700 transition-all space-y-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-indigo-950 text-indigo-300 font-extrabold text-sm border border-indigo-700/60 shadow-md">
                  v{ver.version}
                </span>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{ver.project}</h3>
                  <p className="text-xs text-slate-400">Publicado por {ver.author}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {ver.isCurrent && <Badge variant="emerald">Versión Actual en Producción</Badge>}
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="h-3.5 w-3.5" /> {ver.date}
                </span>
              </div>
            </div>

            {/* Changes Log */}
            <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
              <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <GitCommit className="h-3.5 w-3.5" /> Cambios de la Versión (Changelog)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {ver.changes.map((chg, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{chg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
