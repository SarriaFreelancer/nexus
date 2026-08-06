"use client";

import React, { useState, useEffect } from "react";
import ProjectTokenModal from "@/components/dashboard/ProjectTokenModal";
import { useParams, useRouter } from "next/navigation";
import { getProjectById } from "@/core/application/actions/projectActions";
import { FolderKanban, ArrowLeft, Loader2, GitBranch, Globe, Calendar, Clock, CheckCircle2, Share2, Copy, UserPlus, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";
import { ProjectDocuments } from "@/components/projects/ProjectDocuments";

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"resumen" | "documentos">("resumen");

  useEffect(() => {
    if (id) {
      getProjectById(id).then(res => {
        if (res.success && res.data) {
          setProject(res.data);
        } else if ((res as any).requiresJoin && (res as any).projectId) {
          router.push(`/proyectos/unirse?projectId=${(res as any).projectId}`);
          return;
        }
        setIsLoading(false);
      });
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-slate-500 font-medium">Cargando proyecto...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Proyecto no encontrado</h2>
        <button
          onClick={() => {}}
          className="text-xs text-indigo-600 hover:underline"
        >
          Ver últimos commits
        </button>
        {/* Botón token */}
        <button
          onClick={() => { setSelectedProjectId(id); setIsModalOpen(true); }}
          className="text-xs text-indigo-600 hover:underline ml-2"
        >
          Configurar Token
        </button>
      </div>
    );
  }

  const translatedStatus = project.status === "DEVELOPMENT" ? "En Desarrollo" : project.status === "DESIGN" ? "En Diseño" : project.status === "TESTING" ? "En Pruebas" : project.status === "DEPLOYED" ? "En Producción" : project.status;
  
  let progress = 0;
  if (project.tasks && project.tasks.length > 0) {
    const completed = project.tasks.filter((t: any) => t.status === "DEPLOYED" || t.status === "COMPLETED").length;
    progress = Math.round((completed / project.tasks.length) * 100);
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <Link href="/proyectos" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-500 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a Proyectos
      </Link>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center font-black text-indigo-300 text-xl shadow-md shrink-0">
            {project.code}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3">
              {project.name}
              <Badge variant={translatedStatus === "En Desarrollo" ? "indigo" : translatedStatus === "En Diseño" ? "blue" : translatedStatus === "En Pruebas" ? "emerald" : "amber"} size="md">
                {translatedStatus}
              </Badge>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Cliente: <span className="text-slate-700 dark:text-slate-300">{project.client?.company || "Sin cliente"}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 min-w-[240px]">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Progreso General</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{progress}%</span>
            </div>
            <ProgressBar value={progress} color="bg-gradient-to-r from-indigo-500 to-purple-500" />
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("resumen")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "resumen" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab("documentos")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "documentos" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
        >
          Documentos
        </button>
      </div>

      {activeTab === "resumen" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Column */}
        <div className="space-y-6 col-span-1">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
              Detalles del Proyecto
            </h3>
            
            {project.description && (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {project.description}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <FolderKanban className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-500 dark:text-slate-400">Categoría:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{project.category}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-500 dark:text-slate-400">Horas Estimadas:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{project.estimatedHours || 0}h</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-500 dark:text-slate-400">Creado en:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2 block">Tecnologías:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(() => {
                  let techList = [];
                  try {
                    techList = Array.isArray(project.technologies) ? project.technologies : typeof project.technologies === "string" ? JSON.parse(project.technologies) : [];
                  } catch (e) {
                    techList = [];
                  }
                  return techList.map((t: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                      {t}
                    </span>
                  ));
                })()}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2 block">Equipo:</span>
              <AvatarGroup users={project.team || []} limit={6} />
            </div>
          </div>
        </div>

        {/* Tasks/Activity Column */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              Tareas y Sprints
            </h3>
            
            {(!project.tasks || project.tasks.length === 0) ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No hay tareas asignadas a este proyecto aún.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.tasks.map((task: any) => (
                  <div key={task.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{task.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{task.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {activeTab === "documentos" && (
        <ProjectDocuments projectId={id} />
      )}

      {/* Modal Compartir Proyecto */}
      <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Compartir Proyecto">
        <div className="space-y-5 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Copia el enlace directo de este proyecto para compartirlo con los colaboradores asignados a tu espacio de trabajo.
          </p>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">Enlace Directo del Proyecto</label>
            <div className="flex gap-2">
              <input
                readOnly
                type="text"
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "¡Copiado!" : "Copiar"}</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">Colaboradores del Espacio de Trabajo</span>
              <Link
                href="/usuarios"
                className="flex items-center gap-1 text-indigo-500 hover:text-indigo-400 font-bold text-[11px]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Invitar Colaboradores</span>
              </Link>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Los usuarios invitados a tu espacio de trabajo en el módulo <span className="font-bold text-slate-700 dark:text-slate-300">/usuarios</span> podrán acceder a este proyecto automáticamente según el nivel de permisos otorgado.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
