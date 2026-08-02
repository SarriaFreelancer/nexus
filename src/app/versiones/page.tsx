"use client";
import BranchListModal from "@/components/dashboard/BranchListModal";
import ProjectTokenModal from "@/components/dashboard/ProjectTokenModal";

import React, { useState } from "react";
import { Tag, GitCommit, Calendar, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
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
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'commit' | 'branch' | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'commit' | 'branch' | null>(null);
  const [pendingVersionId, setPendingVersionId] = useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      const vRes = await getVersions();
      const pRes = await getProjects();
      setVersionsList(vRes.data || []);
      setProjectsList(pRes.data || []);
    }
    fetchData();
  }, []);

  const openCommitInline = (projectId: string, versionId: string) => {
    const project = projectsList.find((p: any) => p.id === projectId);
    if (!project?.gitToken || !project?.gitRepoUrl) {
      setSelectedProjectId(projectId);
      setPendingAction('commit');
      setPendingVersionId(versionId);
      setIsTokenModalOpen(true);
    } else {
      setActiveVersionId(activeVersionId === versionId && activeView === 'commit' ? null : versionId);
      setActiveView('commit');
    }
  };

  const openBranchInline = (projectId: string, versionId: string) => {
    const project = projectsList.find((p: any) => p.id === projectId);
    if (!project?.gitToken || !project?.gitRepoUrl) {
      setSelectedProjectId(projectId);
      setPendingAction('branch');
      setPendingVersionId(versionId);
      setIsTokenModalOpen(true);
    } else {
      setActiveVersionId(activeVersionId === versionId && activeView === 'branch' ? null : versionId);
      setActiveView('branch');
    }
  };

  const closeTokenModal = () => {
    setIsTokenModalOpen(false);
    setPendingAction(null);
    setSelectedProjectId(null);
    setPendingVersionId(null);
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
              className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4 shadow-lg overflow-hidden"
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
                      onClick={() => openCommitInline(ver.project.id, ver.id)}
                      className={`text-xs flex items-center gap-1 hover:underline transition-colors ${activeVersionId === ver.id && activeView === 'commit' ? 'text-indigo-800 dark:text-indigo-400 font-bold' : 'text-indigo-600'}`}
                    >
                      Últimos commits {activeVersionId === ver.id && activeView === 'commit' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                    </button>
                  )}
                  <EditVersionButton version={ver} projects={projectsList} />
                  
                  {ver.project?.id && (
                    <button
                      onClick={() => openBranchInline(ver.project.id, ver.id)}
                      className={`text-xs flex items-center gap-1 hover:underline transition-colors ${activeVersionId === ver.id && activeView === 'branch' ? 'text-indigo-800 dark:text-indigo-400 font-bold' : 'text-indigo-600'}`}
                    >
                      Ramas {activeVersionId === ver.id && activeView === 'branch' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                    </button>
                  )}
                </div>
              </div>

              {changes.length > 0 && (
                <div className="space-y-2 bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 mt-4">
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
              
              {/* Accordion content for inline github components */}
              {activeVersionId === ver.id && activeView === 'commit' && ver.project?.id && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                  <CommitListModal projectId={ver.project.id} onClose={() => setActiveVersionId(null)} />
                </div>
              )}
              {activeVersionId === ver.id && activeView === 'branch' && ver.project?.id && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                  <BranchListModal projectId={ver.project.id} onClose={() => setActiveVersionId(null)} />
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

      {isTokenModalOpen && selectedProjectId && (
        <ProjectTokenModal
          projectId={selectedProjectId}
          onClose={closeTokenModal}
          onSaved={(token, repoUrl) => {
            setIsTokenModalOpen(false);
            setProjectsList(prev => prev.map(p => p.id === selectedProjectId ? { ...p, gitToken: token, gitRepoUrl: repoUrl } : p));
            if (pendingAction === 'commit') {
              setActiveView('commit');
              setActiveVersionId(pendingVersionId);
            } else if (pendingAction === 'branch') {
              setActiveView('branch');
              setActiveVersionId(pendingVersionId);
            }
            setPendingAction(null);
            setPendingVersionId(null);
          }}
        />
      )}
    </div>
  );
}
