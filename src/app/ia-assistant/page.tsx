"use client";

import React, { useState } from "react";
import { Bot, Sparkles, ShieldAlert, Cpu, Code2, AlertTriangle, CheckCircle2, Play } from "lucide-react";
import { mockProjects } from "@/core/infrastructure/mockData";
import { Badge } from "@/components/ui/Badge";

export default function IAAssistantPage() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0].id);
  const [isAuditing, setIsAuditing] = useState(false);

  const runAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-400" /> AI Technical Co-Pilot
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Auditoría inteligente de código, detección de deuda técnica, fallos de arquitectura y recomendaciones de seguridad.
          </p>
        </div>

        <button
          onClick={runAudit}
          disabled={isAuditing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start"
        >
          {isAuditing ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              <span>Analizando Código...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Ejecutar Auditoría IA</span>
            </>
          )}
        </button>
      </div>

      {/* Project Selector */}
      <div className="p-4 rounded-2xl bg-[#0f1424] border border-slate-800/80 flex items-center gap-4">
        <span className="text-xs font-bold text-slate-300">Proyecto a Auditar:</span>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          {mockProjects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} - {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* AI Diagnostic Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Índice de Mantenibilidad</span>
            <Badge variant="emerald">Excelente (94/100)</Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Clean Architecture aplicada correctamente. Componentes desacoplados en `src/core/domain` y `src/core/infrastructure`.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Deuda Técnica Estimada</span>
            <Badge variant="amber">4.5 Horas</Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Recomendada la extracción de tipos duplicados en handlers de API y optimización de índices Prisma en tablas de auditoría.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Vulnerabilidades de Seguridad</span>
            <Badge variant="indigo">0 Críticas</Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sin vulnerabilidades detectadas en dependencias de `package.json`. Headers de seguridad HTTPS y RLS configurados.
          </p>
        </div>
      </div>

      {/* Specific Findings List */}
      <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" /> Hallazgos y Sugerencias de la IA
        </h3>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">
                Uso de Repository Pattern y DTOs Centralizados
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Las entidades del dominio están 100% protegidas contra efectos secundarios directos de la base de datos.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">
                Sugerencia: Cache Redis en Endpoint de Telemetría
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Se recomienda habilitar caching de 10 segundos en `/api/telemetry` para reducir la carga de CPU en Hetzner.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
