"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Key, GitBranch, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface GitConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
}

export function GitConfigModal({ isOpen, onClose, projects }: GitConfigModalProps) {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [gitRepoUrl, setGitRepoUrl] = useState<string>("");
  const [gitToken, setGitToken] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Update initial fields when project selection changes
  useEffect(() => {
    if (selectedProjectId) {
      const proj = projects.find(p => p.id === selectedProjectId);
      if (proj) {
        setGitRepoUrl(proj.gitRepoUrl || "");
        setGitToken(proj.gitToken || "");
      }
    }
  }, [selectedProjectId, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/projects/github-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          gitRepoUrl: gitRepoUrl.trim(),
          gitToken: gitToken.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar la configuración");

      setMessage({ type: "success", text: "Token y Repositorio de GitHub actualizados con éxito." });
      
      // Update local project object reference if possible
      const proj = projects.find(p => p.id === selectedProjectId);
      if (proj) {
        proj.gitRepoUrl = gitRepoUrl.trim();
        proj.gitToken = gitToken.trim();
      }

      router.refresh();
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "No se pudo guardar la configuración" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuración de GitHub Token">
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${
            message.type === "success" 
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" 
              : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Seleccionar Proyecto
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-slate-400" />
            URL del Repositorio de GitHub
          </label>
          <input
            type="text"
            placeholder="https://github.com/usuario/repositorio"
            value={gitRepoUrl}
            onChange={(e) => setGitRepoUrl(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
          />
          <p className="text-[10px] text-slate-500 mt-1">Ejemplo: https://github.com/mi-empresa/mi-proyecto</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-500" />
            Personal Access Token (PAT)
          </label>
          <input
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={gitToken}
            onChange={(e) => setGitToken(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none font-mono text-xs"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Token de acceso personal de GitHub con permisos de lectura de contenido (`repo:read` o `repo`). Se usará prioritariamente para la Auditoría IA y Changelogs.
          </p>
        </div>

        <div className="pt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || !selectedProjectId}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-colors"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
