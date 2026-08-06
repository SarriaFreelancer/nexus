"use client";

import React, { useEffect, useState } from "react";
import { FileText, Loader2, FilePlus, FileEdit, FileMinus, Eye, ChevronDown, ChevronUp } from "lucide-react";

interface CommitDetailAccordionProps {
  projectId: string;
  sha: string;
}

export function CommitDetailAccordion({ projectId, sha }: CommitDetailAccordionProps) {
  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFileList, setShowFileList] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/commits/detail?projectId=${projectId}&sha=${sha}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cargar detalles del commit");
        setDetails(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [projectId, sha]);

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
        <span>Cargando detalle de cambios de GitHub...</span>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs text-red-500">
        {error || "No se pudo cargar la información del commit."}
      </div>
    );
  }

  const files = details.files || [];
  const addedFiles = files.filter((f: any) => f.status === "added").length;
  const modifiedFiles = files.filter((f: any) => f.status === "modified").length;
  const removedFiles = files.filter((f: any) => f.status === "removed" || f.status === "deleted").length;

  const totalAdditions = details.stats?.additions || 0;
  const totalDeletions = details.stats?.deletions || 0;
  const totalChanges = totalAdditions + totalDeletions;

  const additionsPercentage = totalChanges > 0 ? Math.round((totalAdditions / totalChanges) * 100) : 50;

  return (
    <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in-50 duration-200">
      {/* Left Box: Extended Commit Message & Files Accordion */}
      <div className="lg:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          {details.commit?.message || "Sin descripción adicional."}
        </p>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowFileList(!showFileList)}
            className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Archivos modificados ({files.length})</span>
            {showFileList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showFileList && (
            <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {files.map((file: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800">
                  <span className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[70%]">{file.filename}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{file.additions}</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">-{file.deletions}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Box: Breakdown Statistics Card */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
            {files.length} archivos modificados
          </h4>

          {/* Dual Progress Bar (Additions vs Deletions) */}
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex mb-3">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${additionsPercentage}%` }} />
            <div className="bg-rose-500 h-full transition-all" style={{ width: `${100 - additionsPercentage}%` }} />
          </div>

          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2">
              <FilePlus className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span><strong className="text-slate-800 dark:text-slate-200">+{addedFiles}</strong> archivos agregados</span>
            </li>
            <li className="flex items-center gap-2">
              <FileEdit className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span><strong className="text-slate-800 dark:text-slate-200">~{modifiedFiles}</strong> archivos modificados</span>
            </li>
            <li className="flex items-center gap-2">
              <FileMinus className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span><strong className="text-slate-800 dark:text-slate-200">-{removedFiles}</strong> archivos eliminados</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => setShowFileList(!showFileList)}
          className="w-full py-1.5 px-3 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-white dark:bg-[#0f1424] text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors flex items-center justify-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showFileList ? "Ocultar archivos" : "Ver archivos"}</span>
        </button>
      </div>
    </div>
  );
}
