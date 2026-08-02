"use client";

import React, { useState, useTransition } from "react";
import { Bot, Sparkles, AlertTriangle, CheckCircle2, Play, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { runAiAudit } from "@/core/application/actions/aiAuditActions";
import type { AuditResult } from "@/core/domain/aiAuditTypes";

interface IAAssistantClientProps {
  projects: any[];
  providerInfo: { name: string; model: string } | null;
  latestAudit: any | null;
  auditHistory: any[];
}

export default function IAAssistantClient({
  projects,
  latestAudit,
}: IAAssistantClientProps) {
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || "");
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AuditResult | null>(latestAudit?.parsedResult || null);
  const [error, setError] = useState<string | null>(null);

  const handleRunAudit = async () => {
    if (!selectedProject) return;
    setIsAuditing(true);
    setError(null);

    try {
      const result = await runAiAudit(selectedProject);
      if (result.success && result.data) {
        setCurrentResult(result.data);
      } else {
        setError(result.error || "Hubo un error al ejecutar la auditoría.");
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setIsAuditing(false);
    }
  };

  // Helper to get color for score
  const getScoreVariant = (score: number) => {
    if (score >= 90) return "emerald";
    if (score >= 70) return "blue";
    if (score >= 50) return "amber";
    return "rose";
  };

  // Helper to get text for score
  const getScoreText = (score: number) => {
    if (score >= 90) return "Excelente";
    if (score >= 70) return "Bueno";
    if (score >= 50) return "Regular";
    return "Crítico";
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-400" /> AI Technical Co-Pilot
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Auditoría inteligente de código, detección de deuda técnica, fallos de arquitectura y recomendaciones de seguridad.
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={isAuditing || projects.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start disabled:opacity-50"
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

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl">
          {error}
        </div>
      )}

      {/* Project Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 flex items-center gap-4">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Proyecto a Auditar:</span>
        <select
          value={selectedProject}
          onChange={(e) => {
            setSelectedProject(e.target.value);
            setCurrentResult(null); // Limpiar resultado al cambiar de proyecto
          }}
          className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          {projects.length === 0 && <option value="">Sin proyectos</option>}
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} - {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* AI Diagnostic Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Índice de Mantenibilidad</span>
              <Badge variant={currentResult ? getScoreVariant(currentResult.maintainability?.score || 0) : "neutral"}>
                {currentResult ? `${getScoreText(currentResult.maintainability?.score || 0)} (${currentResult.maintainability?.score || 0}/100)` : "Sin datos"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {currentResult 
                ? currentResult.summary?.oneLiner 
                : "Ejecuta una auditoría para obtener un análisis de mantenibilidad y arquitectura del proyecto."}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Deuda Técnica Estimada</span>
              <Badge variant={currentResult ? (currentResult.technicalDebt?.totalHours > 20 ? "rose" : currentResult.technicalDebt?.totalHours > 10 ? "amber" : "emerald") : "neutral"}>
                {currentResult ? `${currentResult.technicalDebt?.totalHours || 0} Horas` : "Sin datos"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {currentResult 
                ? (currentResult.technicalDebt?.items.map((a: any) => a.area).join(", ") || "No se detectaron áreas críticas con deuda técnica urgente.") 
                : "La IA estimará la deuda técnica basada en patrones de código."}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Vulnerabilidades de Seguridad</span>
              <Badge variant={currentResult ? (currentResult.security?.critical > 0 ? "rose" : currentResult.security?.high > 0 ? "amber" : "emerald") : "neutral"}>
                {currentResult ? `${currentResult.security?.critical || 0} Críticas` : "Sin datos"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {currentResult 
                ? `Detectadas: ${currentResult.security?.high || 0} Altas, ${currentResult.security?.medium || 0} Medias. ${currentResult.security?.critical === 0 ? "El sistema parece seguro." : "Revisión inmediata sugerida."}`
                : "Análisis de vulnerabilidades, dependencias y riesgos de seguridad."}
            </p>
          </div>
        </div>
      </div>

      {/* Security Issues List */}
      {currentResult && currentResult.security?.issues && currentResult.security.issues.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-rose-200 dark:border-rose-900/50 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Vulnerabilidades de Seguridad Detectadas
          </h3>
          
          <div className="space-y-3">
            {currentResult.security.issues.map((issue, idx) => (
              <div key={`sec-${idx}`} className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {issue.title}
                    </h4>
                    {issue.affectedArea && (
                      <span className="text-[10px] font-mono bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded">
                        {issue.affectedArea}
                      </span>
                    )}
                    {issue.severity && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        issue.severity === 'CRITICAL' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                        issue.severity === 'HIGH' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                        issue.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {issue.severity === 'CRITICAL' ? 'CRÍTICA' :
                         issue.severity === 'HIGH' ? 'ALTA' :
                         issue.severity === 'MEDIUM' ? 'MEDIA' :
                         issue.severity === 'LOW' ? 'BAJA' : issue.severity}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                    {issue.description}
                  </p>
                  {issue.recommendation && (
                    <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 border-l-2 border-rose-400 pl-2 mt-1.5">
                      <span className="font-semibold">Recomendación:</span> {issue.recommendation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specific Findings List */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" /> Hallazgos y Sugerencias de la IA
        </h3>

        <div className="space-y-3">
          {currentResult ? (
            <>
              {currentResult.findings?.map((finding, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 flex items-start gap-3">
                  {finding.type === 'positive' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : finding.type === 'critical' ? (
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : finding.type === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {finding.title || finding.explanation}
                      </h4>
                      {finding.file && (
                        <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                          {finding.file}{finding.line ? `:${finding.line}` : ''}
                        </span>
                      )}
                      {finding.priority && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          finding.priority === 'CRITICAL' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                          finding.priority === 'HIGH' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                          finding.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {finding.priority === 'CRITICAL' ? 'CRÍTICA' :
                           finding.priority === 'HIGH' ? 'ALTA' :
                           finding.priority === 'MEDIUM' ? 'MEDIA' :
                           finding.priority === 'LOW' ? 'BAJA' : finding.priority}
                        </span>
                      )}
                    </div>
                    {finding.title && <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                      {finding.explanation}
                    </p>}
                    {finding.solution && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 border-l-2 border-indigo-400 pl-2 mt-1.5">
                        <span className="font-semibold">Solución:</span> {finding.solution}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {currentResult.recommendations?.map((rec, idx) => (
                <div key={`rec-${idx}`} className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Sugerencia: {rec.title || rec.description}
                    </h4>
                    {rec.title && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {rec.description}
                    </p>}
                  </div>
                </div>
              ))}
            </>
          ) : (
             <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 flex items-start gap-3">
               <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
               <div>
                 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                   Inicia una auditoría para ver los hallazgos
                 </h4>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                   Selecciona un proyecto y presiona el botón "Ejecutar Auditoría IA".
                 </p>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
