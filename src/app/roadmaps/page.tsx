"use client";

import React from "react";
import { GitFork, CheckCircle, Clock, AlertCircle, ChevronRight, ShieldCheck } from "lucide-react";
import { mockProjects } from "@/core/infrastructure/mockData";
import { Badge } from "@/components/ui/Badge";

export default function RoadmapsPage() {
  const lifecycleStages = [
    { name: "Idea & Discovery", desc: "Definición y viabilidad inicial", color: "indigo" },
    { name: "Análisis & Requisitos", desc: "Especificación funcional y PRD", color: "blue" },
    { name: "Diseño UX/UI", desc: "Wireframes, Figma y Design System", color: "purple" },
    { name: "Arquitectura", desc: "Modelo de datos y Clean Architecture", color: "indigo" },
    { name: "Backend", desc: "Servicios, API REST/GraphQL y Prisma", color: "blue" },
    { name: "Frontend", desc: "Componentes Next.js y React UI", color: "emerald" },
    { name: "QA & Pruebas", desc: "Testing automatizado E2E y linters", color: "amber" },
    { name: "Deploy & Prod", desc: "Despliegue Docker / Vercel / VPS", color: "rose" },
    { name: "Mantenimiento", desc: "Telemetría, logs y SLA", color: "emerald" },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <GitFork className="h-5 w-5 text-indigo-400" /> Lifecycle Pipeline & Roadmaps
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Visualización punto a punto de cada software desde su concepción hasta su producción y mantenimiento.
        </p>
      </div>

      {/* Stage Flow Pipeline Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 overflow-x-auto">
        <div className="flex items-center min-w-[1100px] gap-2">
          {lifecycleStages.map((stage, idx) => (
            <React.Fragment key={idx}>
              <div className="flex-1 p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Etapa {idx + 1}
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{stage.name}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{stage.desc}</p>
              </div>
              {idx < lifecycleStages.length - 1 && (
                <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Projects Roadmap Tracker */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Estado del Pipeline por Proyecto</h3>

        <div className="space-y-4">
          {mockProjects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center font-bold text-indigo-300 text-xs">
                    {proj.code}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{proj.name}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Versión actual: v{proj.currentVersion}</span>
                  </div>
                </div>
                <Badge variant="indigo" size="md">
                  {proj.status}
                </Badge>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-1 md:grid-cols-9 gap-2">
                {lifecycleStages.map((stg, i) => {
                  const isCompleted = (i + 1) * 11 <= proj.progress;
                  const isCurrent = Math.abs((i + 1) * 11 - proj.progress) < 10;

                  return (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-center space-y-1 transition-all ${
                        isCompleted
                          ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                          : isCurrent
                          ? "bg-indigo-950/60 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-600/30"
                          : "bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {isCompleted ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        ) : isCurrent ? (
                          <Clock className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                        ) : (
                          <span className="text-[10px] text-slate-600 font-bold">{i + 1}</span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold truncate">{stg.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
