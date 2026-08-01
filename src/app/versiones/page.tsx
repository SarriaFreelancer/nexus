"use client";

import React, { useState } from "react";
import { Tag, GitCommit, Calendar, CheckCircle2 } from "lucide-react";
import { getVersions } from "@/core/application/actions/versionActions";
import { getProjects } from "@/core/application/actions/projectActions";
import { Badge } from "@/components/ui/Badge";
import { VersionesHeader } from "./VersionesHeader";
import { EditVersionButton } from "@/components/dashboard/EditVersionButton";
import CommitListModal from "@/components/dashboard/CommitListModal";

export default function VersionesPage() {
  const [versionsList, setVersionsList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    async function fetchData() {
      const vRes = await getVersions();
      const pRes = await getProjects();
      setVersionsList(vRes.data || []);
      setProjectsList(pRes.data || []);
    }
    fetchData();
  }, []);

  const openModal = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProjectId(null);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <VersionesHeader projects={projectsList} />

      {/* Timeline List */}
      <div className="space-y-4">
        {versionsList.map((ver: any) => {
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
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {ver.project?.name || "Global"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{ver.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {ver.isCurrent && <Badge variant="emerald">Versión Actual en Producción</Badge>}
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="h-3.5 w-3.5" /> {new Date(ver.releaseDate).toLocaleDateString()}
                  </span>
                  {ver.commitHash && ver.project?.gitRepoUrl && (
                    <a
                      href={`https://github.com/${ver.project.gitRepoUrl.replace(/^https?:\/\//, "").replace(/\.git$/i, "")}/commit/${ver.commitHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:underline"
                    >
                      Ver commit
                    </a>
                  )}
                  {ver.project?.gitRepoUrl && (
                    <button
                      onClick={() => openModal(ver.project.id)}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Ver últimos commits
                    </button>
                  )}
                  <EditVersionButton version={ver} projects={projectsList} />
                </div>
              </div>

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

      {isModalOpen && selectedProjectId && (
        <CommitListModal projectId={selectedProjectId} onClose={closeModal} />
      )}
    </div>
  );
}
