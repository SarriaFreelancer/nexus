"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProjectById } from "@/core/application/actions/projectActions";
import { FolderKanban, ArrowLeft, Loader2, GitBranch, Globe, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import Link from "next/link";

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getProjectById(id).then(res => {
        if (res.success && res.data) {
          setProject(res.data);
        }
        setIsLoading(false);
      });
    }
  }, [id]);

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
        <button onClick={() => router.push('/proyectos')} className="text-indigo-500 hover:underline">
          Volver a Proyectos
        </button>
      </div>
    );
  }

  const translatedStatus = project.status === "DEVELOPMENT" ? "En Desarrollo" : project.status === "DESIGN" ? "En Diseño" : project.status === "TESTING" ? "En Pruebas" : project.status === "DEPLOYED" ? "En Producción" : project.status;
  
  let progress = 0;
  if (project.tasks && project.tasks.length > 0) {
    const completed = project.tasks.filter((t: any) => t.status === "DEPLOYING" || t.status === "PRODUCTION").length;
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

        <div className="flex flex-col gap-2 min-w-[200px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Progreso General</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{progress}%</span>
          </div>
          <ProgressBar value={progress} color="bg-gradient-to-r from-indigo-500 to-purple-500" />
        </div>
      </div>

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
    </div>
  );
}
