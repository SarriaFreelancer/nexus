"use client";

import React, { useEffect, useState } from "react";
import { FileCode, Loader2, GitCommit, FilePlus, FileEdit, FileMinus } from "lucide-react";

interface VersionFilesTabProps {
  projectId: string;
}

export function VersionFilesTab({ projectId }: VersionFilesTabProps) {
  const [commits, setCommits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/commits?projectId=${projectId}&count=5`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cargar commits");
        setCommits(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
        <p className="text-xs text-slate-500">Analizando archivos de la versión en GitHub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 text-xs">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-200">
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-indigo-400" />
          Resumen de Archivos en los Últimos Commits
        </h3>

        <div className="space-y-2">
          {commits.map((c) => (
            <div key={c.sha} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                  {c.sha.substring(0, 7)}
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {c.commit?.message?.split("\n")[0]}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {c.commit?.author?.name} · {new Date(c.commit?.author?.date).toLocaleString()}
                  </p>
                </div>
              </div>

              <a
                href={c.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-indigo-500 hover:underline"
              >
                Ver en GitHub
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
