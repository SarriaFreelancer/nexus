"use client";

import React, { useEffect, useState } from "react";
import { GitFork, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { getProjects } from "@/core/application/actions/projectActions";
import { Badge } from "@/components/ui/Badge";
import { translateProjectStatus } from "@/lib/utils";

export default function RoadmapsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProjects().then((res) => {
      if (res.success && res.data) {
        setProjects(res.data);
      }
      setIsLoading(false);
    });
  }, []);

  const lifecycleStages = [
    { name: "Idea & Discovery", desc: "Definición y viabilidad inicial" },
    { name: "Análisis & Requisitos", desc: "Especificación funcional y PRD" },
    { name: "Diseño UX/UI", desc: "Wireframes, Figma y Design System" },
    { name: "Arquitectura", desc: "Modelo de datos y Clean Architecture" },
    { name: "Backend", desc: "Servicios, API REST/GraphQL y Prisma" },
    { name: "Frontend", desc: "Componentes Next.js y React UI" },
    { name: "QA & Pruebas", desc: "Testing automatizado E2E y linters" },
    { name: "Deploy & Prod", desc: "Despliegue Docker / Vercel / VPS" },
    { name: "Mantenimiento", desc: "Telemetría, logs y SLA" },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <GitFork className="h-5 w-5 text-indigo-500" /> Lifecycle Pipeline & Roadmaps
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Visualización punto a punto de cada software desde su concepción hasta su producción y mantenimiento.
        </p>
      </div>

      {/* Stage Flow Pipeline Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 shadow-md overflow-x-auto custom-scrollbar">
        <div className="flex items-center min-w-[1100px] gap-2">
          {lifecycleStages.map((stage, idx) => (
            <React.Fragment key={idx}>
              <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 text-center space-y-1 shadow-sm">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Etapa {idx + 1}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{stage.name}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{stage.desc}</p>
              </div>
              {idx < lifecycleStages.length - 1 && (
                <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Projects Roadmap Tracker */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Estado del Pipeline por Proyecto</h3>

        <div className="space-y-4">
          {projects.length === 0 && !isLoading ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-xs">
              No hay proyectos registrados en este espacio de trabajo.
            </div>
          ) : (
            projects.map((proj) => {
              const totalTasks = proj.tasks ? proj.tasks.length : 0;
              const completedTasks = proj.tasks ? proj.tasks.filter((t: any) => t.status === "DEPLOYED" || t.status === "COMPLETED").length : 0;
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 35;
              const translatedStatus = translateProjectStatus(proj.status);
              const currentVersion = proj.versions && proj.versions.length > 0 ? proj.versions[0].version : "v1.0.0";

              return (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-4 hover:border-indigo-500/40 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-xs shadow-md shrink-0">
                        {proj.code}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{proj.name}</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Versión actual: {currentVersion}</span>
                      </div>
                    </div>
                    <Badge variant="indigo" size="md">
                      {translatedStatus.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Progress Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-9 gap-2">
                    {lifecycleStages.map((stg, i) => {
                      const isCompleted = (i + 1) * 11 <= progress;
                      const isCurrent = !isCompleted && ((i === 0 && progress < 11) || ((i) * 11 <= progress && (i + 1) * 11 > progress));

                      return (
                        <div
                          key={i}
                          className={`p-2.5 rounded-xl border text-center space-y-1 transition-all ${
                            isCompleted
                              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-bold"
                              : isCurrent
                              ? "bg-indigo-600 text-white font-extrabold border-indigo-600 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40"
                              : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 font-medium"
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            ) : isCurrent ? (
                              <Clock className="h-4 w-4 text-white animate-pulse" />
                            ) : (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{i + 1}</span>
                            )}
                          </div>
                          <p className="text-[11px] truncate">{stg.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
