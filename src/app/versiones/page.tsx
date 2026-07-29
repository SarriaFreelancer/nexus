import React from "react";
import { Tag, Plus, GitCommit, Calendar, CheckCircle2, ArrowRight } from "lucide-react";
import { getVersions } from "@/core/application/actions/versionActions";
import { Badge } from "@/components/ui/Badge";

export default async function VersionesPage() {
  const result = await getVersions();
  const versionsList = result.data || [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tag className="h-5 w-5 text-indigo-400" /> Control de Versiones SemVer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
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
        {versionsList.map((ver: any) => {
          // Parse changelog split by newlines if it's a single string
          const changes = typeof ver.changelog === "string" ? ver.changelog.split("\n").filter(Boolean) : [];

          return (
            <div
              key={ver.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-indigo-950 text-indigo-300 font-extrabold text-sm border border-indigo-700/60 shadow-md">
                    v{ver.version}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{ver.project?.name || "Global"}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{ver.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {ver.isCurrent && <Badge variant="emerald">Versión Actual en Producción</Badge>}
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="h-3.5 w-3.5" /> {new Date(ver.releaseDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Changes Log */}
              {changes.length > 0 && (
                <div className="space-y-2 bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60">
                  <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <GitCommit className="h-3.5 w-3.5" /> Cambios de la Versión (Changelog)
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {changes.map((chg: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{chg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}

        {versionsList.length === 0 && (
          <div className="text-center text-slate-400 dark:text-slate-500 py-10 font-medium">
            No hay versiones registradas aún.
          </div>
        )}
      </div>
    </div>
  );
}
