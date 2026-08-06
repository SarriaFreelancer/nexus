"use client";

import React, { useState, useEffect } from "react";
import { 
  Tag, 
  GitCommit, 
  Calendar, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  GitBranch, 
  FileText, 
  Download, 
  Trash2, 
  User, 
  FolderGit2, 
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  Plus
} from "lucide-react";
import { getVersions, deleteVersion, updateVersion } from "@/core/application/actions/versionActions";
import { getProjects } from "@/core/application/actions/projectActions";
import { Badge } from "@/components/ui/Badge";
import { VersionesHeader } from "./VersionesHeader";
import { CommitDetailAccordion } from "./CommitDetailAccordion";
import { VersionFilesTab } from "./VersionFilesTab";
import { VersionCompareTab } from "./VersionCompareTab";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import BranchListModal from "@/components/dashboard/BranchListModal";
import CommitListModal from "@/components/dashboard/CommitListModal";
import ProjectTokenModal from "@/components/dashboard/ProjectTokenModal";
import { EditVersionButton } from "@/components/dashboard/EditVersionButton";

export default function VersionesPage() {
  const [versionsList, setVersionsList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Version state (defaults to first version)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Tab State: 'commits' | 'files' | 'compare'
  const [activeTab, setActiveTab] = useState<'commits' | 'files' | 'compare'>('commits');

  // Accordion open commits SHAs
  const [expandedCommits, setExpandedCommits] = useState<Record<string, boolean>>({});

  // Inline Github Modals
  const [inlineView, setInlineView] = useState<'commit' | 'branch' | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenProjectId, setTokenProjectId] = useState<string | null>(null);

  // Real Commits for the selected version
  const [recentCommits, setRecentCommits] = useState<any[]>([]);
  const [loadingCommits, setLoadingCommits] = useState(false);

  // Confirm Modal state for deleting version
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    itemName?: string;
    description?: string;
    warningText?: string;
    confirmText?: string;
    variant?: "danger" | "warning" | "success";
    icon?: "trash" | "alert" | "info" | "folder" | "file";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    onConfirm: () => {},
  });

  const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

  async function loadData() {
    setLoading(true);
    try {
      const vRes = await getVersions();
      const pRes = await getProjects();
      const vData = vRes.data || [];
      const pData = pRes.data || [];

      setVersionsList(vData);
      setProjectsList(pData);

      if (vData.length > 0 && !selectedVersionId) {
        setSelectedVersionId(vData[0].id);
      }
    } catch (e) {
      console.error("Error loading versions page:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedVersion = versionsList.find(v => v.id === selectedVersionId) || versionsList[0];
  const project = selectedVersion?.project;

  // Fetch commits when selected version changes
  useEffect(() => {
    if (!project?.id) return;

    async function fetchCommits() {
      setLoadingCommits(true);
      try {
        const res = await fetch(`/api/commits?projectId=${project.id}&count=10`);
        if (res.ok) {
          const data = await res.json();
          setRecentCommits(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load commits for version", err);
      } finally {
        setLoadingCommits(false);
      }
    }

    fetchCommits();
  }, [selectedVersionId, project?.id]);

  const toggleCommitAccordion = (sha: string) => {
    setExpandedCommits(prev => ({ ...prev, [sha]: !prev[sha] }));
  };

  const handleOpenTokenCheck = (action: 'commit' | 'branch') => {
    if (!project?.gitToken || !project?.gitRepoUrl) {
      setTokenProjectId(project?.id || null);
      setIsTokenModalOpen(true);
    } else {
      setInlineView(inlineView === action ? null : action);
    }
  };

  const handleDeleteVersionClick = (ver: any) => {
    setConfirmConfig({
      isOpen: true,
      title: "Eliminar Versión",
      itemName: `v${ver.version} - ${ver.title}`,
      description: "Esta acción eliminará el registro de esta versión del sistema.",
      warningText: "Esta acción no se puede deshacer.",
      confirmText: "Eliminar permanentemente",
      variant: "danger",
      icon: "trash",
      onConfirm: async () => {
        try {
          const res = await deleteVersion(ver.id);
          if (!res.success) throw new Error(res.error || "Error al eliminar versión");
          closeConfirm();
          loadData();
        } catch (err: any) {
          alert(`No se pudo eliminar: ${err.message}`);
        }
      }
    });
  };

  const handleGenerateChangelog = async () => {
    if (!selectedVersion) return;
    try {
      const generated = recentCommits.map(c => `• ${c.commit?.message?.split("\n")[0]}`).join("\n");
      const res = await updateVersion(selectedVersion.id, { changelog: generated || selectedVersion.changelog });
      if (res.success) {
        loadData();
      }
    } catch (e: any) {
      alert("Error al generar changelog: " + e.message);
    }
  };

  const changesList = typeof selectedVersion?.changelog === "string" 
    ? selectedVersion.changelog.split("\n").filter(Boolean) 
    : [];

  const repoPath = project?.gitRepoUrl
    ? project.gitRepoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "").replace(/\.git$/i, "").replace(/\/$/, "")
    : null;

  const downloadZipUrl = repoPath && selectedVersion
    ? `https://github.com/${repoPath}/archive/refs/tags/v${selectedVersion.version}.zip`
    : repoPath
    ? `https://github.com/${repoPath}/archive/refs/heads/main.zip`
    : "#";

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <VersionesHeader projects={projectsList} />

      {versionsList.length === 0 && !loading && (
        <div className="p-12 text-center bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <Tag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No hay versiones registradas aún</h3>
          <p className="text-xs text-slate-500">Crea tu primera versión SemVer para comenzar a sincronizar commits y changelogs.</p>
        </div>
      )}

      {selectedVersion && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Main Left Panel (3/4 width) */}
          <div className="lg:col-span-3 space-y-5">
            {/* Version Overview Card Header */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-md shadow-indigo-600/30">
                    v{selectedVersion.version}
                  </span>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {project?.name || "Proyecto Global"}
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-semibold text-slate-500">
                        {project?.status || "En Desarrollo"}
                      </span>
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {selectedVersion.isCurrent && (
                    <Badge variant="emerald">Versión Actual en Producción</Badge>
                  )}

                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(selectedVersion.releaseDate).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => handleOpenTokenCheck('branch')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 transition-colors flex items-center gap-1"
                  >
                    <span>Ramas</span>
                    {inlineView === 'branch' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Inline Branch dropdown modal if clicked */}
              {inlineView === 'branch' && project?.id && (
                <BranchListModal projectId={project.id} onClose={() => setInlineView(null)} />
              )}

              {/* Changelog Card Section */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4" />
                    Cambios de la Versión (Changelog)
                  </h3>

                  {changesList.length > 0 ? (
                    <ul className="space-y-2">
                      {changesList.map((chg: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{chg.replace(/^[•\-\*]\s*/, "")}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No hay notas de cambios registradas para este release.</p>
                  )}
                </div>

                {/* Decorative illustration box */}
                <div className="w-32 h-20 bg-indigo-100/60 dark:bg-indigo-900/30 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center shrink-0">
                  <div className="relative flex items-center justify-center">
                    <Layers className="w-8 h-8 text-indigo-500 opacity-80" />
                    <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 pt-2">
                <button
                  onClick={() => setActiveTab('commits')}
                  className={`pb-3 text-xs font-bold transition-all relative ${
                    activeTab === 'commits'
                      ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GitCommit className="w-4 h-4" /> Commits
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('files')}
                  className={`pb-3 text-xs font-bold transition-all relative ${
                    activeTab === 'files'
                      ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Archivos Cambiados
                    <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {recentCommits.length > 0 ? "18" : "0"}
                    </span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('compare')}
                  className={`pb-3 text-xs font-bold transition-all relative ${
                    activeTab === 'compare'
                      ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" /> Comparar Versiones
                  </span>
                </button>
              </div>

              {/* Tab Content 1: Commits Timeline */}
              {activeTab === 'commits' && (
                <div className="space-y-3 pt-2">
                  {recentCommits.length > 0 ? (
                    recentCommits.map((c, index) => {
                      const sha7 = c.sha.substring(0, 7);
                      const isExpanded = !!expandedCommits[c.sha];
                      const isHead = index === 0;

                      return (
                        <div
                          key={c.sha}
                          className="p-4 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                              <a
                                href={c.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                {sha7}
                              </a>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {c.commit?.message?.split("\n")[0]}
                              </h4>
                              {isHead && (
                                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                                  HEAD
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 font-mono text-xs">
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">+ 24</span>
                                <span className="text-rose-600 dark:text-rose-400 font-bold">- 6</span>
                              </div>

                              <button
                                onClick={() => toggleCommitAccordion(c.sha)}
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                <span>Ver cambios</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pl-5">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {c.author?.login || c.commit?.author?.name || "Autor"}
                              </span>
                            </div>
                            <span>·</span>
                            <span>{new Date(c.commit?.author?.date).toLocaleString()}</span>
                            <span>·</span>
                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                              <GitBranch className="w-3 h-3 text-slate-400" />
                              <span>{selectedVersion.branch || "main"}</span>
                            </div>
                          </div>

                          {/* Accordion view for detailed commit diff */}
                          {isExpanded && project?.id && (
                            <CommitDetailAccordion projectId={project.id} sha={c.sha} />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500">
                      {loadingCommits ? "Cargando commits de GitHub..." : "No se encontraron commits para este proyecto."}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content 2: Files Changed */}
              {activeTab === 'files' && project?.id && (
                <VersionFilesTab projectId={project.id} />
              )}

              {/* Tab Content 3: Version Comparison */}
              {activeTab === 'compare' && (
                <VersionCompareTab
                  projectId={project?.id || ""}
                  versions={versionsList}
                  gitRepoUrl={project?.gitRepoUrl}
                />
              )}
            </div>
          </div>

          {/* Right Sidebar (1/4 width) */}
          <div className="space-y-5">
            {/* Version Information Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                Información de la Versión
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Proyecto</span>
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <FolderGit2 className="w-4 h-4 text-indigo-400" />
                    <span>{project?.name || "Sin Proyecto"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Versión</span>
                  <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    <Tag className="w-4 h-4" />
                    <span>v{selectedVersion.version}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Estado</span>
                  <Badge variant={selectedVersion.isCurrent ? "emerald" : "blue"}>
                    {selectedVersion.isCurrent ? "En Producción" : "Archivado / Release"}
                  </Badge>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Fecha de lanzamiento</span>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{new Date(selectedVersion.releaseDate).toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Autor del release</span>
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                      A
                    </div>
                    <span>Administrador</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Rama</span>
                  <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-300">
                    <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedVersion.branch || "main"}</span>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block">Commits</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{recentCommits.length}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block">Archivos cambiados</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">18</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                Acciones
              </h3>

              <div className="space-y-2">
                <EditVersionButton version={selectedVersion} projects={projectsList} label="Etiquetar versión" />

                <button
                  onClick={handleGenerateChangelog}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Generar changelog</span>
                </button>

                <a
                  href={downloadZipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Descargar release (ZIP)</span>
                  <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
                </a>

                <button
                  onClick={() => handleDeleteVersionClick(selectedVersion)}
                  className="w-full py-2 px-3 rounded-xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Eliminar versión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Token Config Modal if needed */}
      {isTokenModalOpen && tokenProjectId && (
        <ProjectTokenModal
          projectId={tokenProjectId}
          onClose={() => {
            setIsTokenModalOpen(false);
            setTokenProjectId(null);
          }}
          onSaved={(token, repoUrl) => {
            setIsTokenModalOpen(false);
            setProjectsList(prev => prev.map(p => p.id === tokenProjectId ? { ...p, gitToken: token, gitRepoUrl: repoUrl } : p));
            setTokenProjectId(null);
            loadData();
          }}
        />
      )}

      {/* Confirm modal for delete */}
      <ConfirmModal
        {...confirmConfig}
        onClose={closeConfirm}
      />
    </div>
  );
}
