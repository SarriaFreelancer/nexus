"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getProjects } from "@/core/application/actions/projectActions";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { FolderKanban, Plus, Search, Filter, GitBranch, ExternalLink, Globe, Layers, Loader2, Edit3 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CreateProjectForm } from "@/components/dashboard/CreateProjectForm";
import { EditProjectForm } from "@/components/dashboard/EditProjectForm";

export default function ProyectosPage() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("TODOS");
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<any | null>(null);

  const fetchProjects = () => {
    setIsLoading(true);
    getProjects().then((res) => {
      if (res.success && res.data) {
        setDbProjects(res.data);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filtered = dbProjects.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const translatedStatus = p.status === "DEVELOPMENT" ? "En Desarrollo" : p.status === "DESIGN" ? "En Diseño" : p.status === "TESTING" ? "En Pruebas" : p.status === "DEPLOYED" ? "En Producción" : p.status;
    const matchesStatus = selectedStatus === "TODOS" || translatedStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Proyecto">
        <CreateProjectForm 
          onCancel={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProjects();
          }} 
        />
      </Modal>

      <Modal isOpen={!!editProject} onClose={() => setEditProject(null)} title="Editar Proyecto" width="max-w-[1000px]">
        {editProject && (
          <EditProjectForm 
            project={editProject}
            onCancel={() => setEditProject(null)} 
            onSuccess={() => {
              setEditProject(null);
              fetchProjects();
            }} 
          />
        )}
      </Modal>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-indigo-400" /> Proyectos Enterprise
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Gestión 360° de repositorios, arquitectura, versiones SemVer y asignaciones del equipo.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, categoría o tech..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {["TODOS", "En Desarrollo", "En Diseño", "En Pruebas", "En Producción"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20 text-indigo-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((proj: any) => {
          const translatedStatus = proj.status === "DEVELOPMENT" ? "En Desarrollo" : proj.status === "DESIGN" ? "En Diseño" : proj.status === "TESTING" ? "En Pruebas" : proj.status === "DEPLOYED" ? "En Producción" : proj.status;
          
          let progress = 0;
          if (proj.tasks && proj.tasks.length > 0) {
            const completed = proj.tasks.filter((t: any) => t.status === "DEPLOYING" || t.status === "PRODUCTION").length;
            progress = Math.round((completed / proj.tasks.length) * 100);
          }

          // Safe parsing for technologies JSON
          let techList = [];
          try {
            techList = Array.isArray(proj.technologies) ? proj.technologies : typeof proj.technologies === "string" ? JSON.parse(proj.technologies) : [];
          } catch (e) {
            techList = [];
          }

          return (
          <div
            key={proj.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex items-start justify-between gap-4">
                <Link href={`/proyectos/${proj.id}`} className="flex items-center gap-3 cursor-pointer group/link">
                  <div className="h-10 w-10 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center font-black text-indigo-300 text-sm shadow-md">
                    {proj.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover/link:text-indigo-500 dark:group-hover/link:text-indigo-400 transition-colors">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover/link:text-slate-600 dark:group-hover/link:text-slate-300 transition-colors">
                      Cliente: {proj.client?.company || "Sin cliente"}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.preventDefault(); setEditProject(proj); }} 
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <Badge variant="purple" size="md">
                    v1.0.0
                  </Badge>
                  <Badge
                    variant={
                      translatedStatus === "En Desarrollo"
                        ? "indigo"
                        : translatedStatus === "En Diseño"
                        ? "blue"
                        : translatedStatus === "En Pruebas"
                        ? "emerald"
                        : "amber"
                    }
                    size="md"
                  >
                    {translatedStatus}
                  </Badge>
                </div>
              </div>

              {/* Progress & Metrics */}
              <div className="space-y-1.5 bg-slate-100 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Progreso del proyecto</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{progress}%</span>
                </div>
                <ProgressBar value={progress} color="bg-gradient-to-r from-indigo-500 to-purple-500" />
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2">
                  <span>Horas Est.: {proj.estimatedHours || 0}h</span>
                  <span>Horas Reales: {proj.actualHours || 0}h</span>
                </div>
              </div>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {techList.map((t: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Links & Team */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                {proj.gitRepoUrl && (
                  <a
                    href={`https://${proj.gitRepoUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                  >
                    <GitBranch className="h-3.5 w-3.5" /> Git
                  </a>
                )}
                {proj.serverDomain && (
                  <a
                    href={`https://${proj.serverDomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" /> Server
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Equipo:</span>
                <AvatarGroup users={proj.team || []} limit={4} />
              </div>
            </div>
          </div>
        )})}
      </div>
      )}
    </div>
  );
}
