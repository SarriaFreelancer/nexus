"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getProjectPublicInfo, acceptProjectInvitation } from "@/core/application/actions/projectActions";
import { FolderKanban, Building, CheckCircle2, X, Loader2, Sparkles, ShieldCheck } from "lucide-react";

function JoinProjectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const projectId = searchParams.get("projectId") || searchParams.get("id");

  const [projectInfo, setProjectInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      const currentUrl = `/proyectos/unirse?projectId=${projectId || ""}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (projectId && status === "authenticated") {
      getProjectPublicInfo(projectId).then((res) => {
        if (res.success && res.data) {
          setProjectInfo(res.data);
        } else {
          setError(res.error || "No se pudo obtener información del proyecto.");
        }
        setLoading(false);
      });
    }
  }, [projectId, status, router]);

  const handleAccept = async () => {
    if (!projectId) return;
    setJoining(true);
    setError("");

    const res = await acceptProjectInvitation(projectId);
    if (res.success) {
      // Force hard reload so Next.js re-initializes workspace session cookies
      window.location.href = `/proyectos/${projectId}`;
    } else {
      setError(res.error || "Error al unirse al proyecto.");
      setJoining(false);
    }
  };

  const handleDecline = () => {
    router.push("/proyectos");
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-indigo-400 font-bold text-sm">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Verificando invitación al proyecto...</span>
        </div>
      </div>
    );
  }

  if (error || !projectInfo) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
            <X className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Invitación No Válida
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error || "El enlace de invitación ha expirado o el proyecto ya no existe."}
          </p>
          <button
            onClick={handleDecline}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
          >
            Ir a mis Proyectos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
        {/* Banner */}
        <div className="relative h-40 w-full bg-slate-900">
          {projectInfo.bannerUrl ? (
            <img src={projectInfo.bannerUrl} alt={projectInfo.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-950 flex items-center justify-center">
              <span className="text-5xl font-black text-white/10">{projectInfo.code}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1424] via-transparent to-black/40" />
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-indigo-500/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3 h-3" /> Invitación a Proyecto
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {projectInfo.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              Espacio de Trabajo: <strong className="text-slate-700 dark:text-slate-200">{projectInfo.workspaceName}</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2 text-xs">
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              Al aceptar esta invitación, te unirás como colaborador a este proyecto y tendrás acceso a sus tareas, roadmaps y documentación compartida.
            </p>
            {projectInfo.description && (
              <p className="text-[11px] text-slate-400 italic">
                "{projectInfo.description}"
              </p>
            )}
          </div>

          {/* User Logged Info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-indigo-400">Conectado como:</p>
              <p className="text-slate-700 dark:text-slate-300 truncate font-mono text-[11px]">
                {session?.user?.name} ({session?.user?.email})
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleDecline}
              disabled={joining}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
            >
              Cancelar / Rechazar
            </button>

            <button
              type="button"
              onClick={handleAccept}
              disabled={joining}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Unirme al Proyecto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JoinProjectPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 min-h-screen flex items-center justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    }>
      <JoinProjectContent />
    </Suspense>
  );
}
