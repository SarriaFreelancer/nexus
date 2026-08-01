"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { createVersion } from "@/core/application/actions/versionActions";
import { Tag, Calendar, GitCommit } from "lucide-react";

interface CreateVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
}

export function CreateVersionModal({ isOpen, onClose, projects }: CreateVersionModalProps) {
  const [projectId, setProjectId] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [title, setTitle] = useState("");
  const [changelog, setChangelog] = useState("");
  const [isCurrent, setIsCurrent] = useState(true);
  const [branch, setBranch] = useState("");
  const [commitHash, setCommitHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !version || !title) {
      setError("Todos los campos principales son requeridos.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await createVersion({
      projectId,
      version,
      title,
      changelog,
      isCurrent,
      branch,
      commitHash,
    });

    setLoading(false);

    if (res.success) {
      onClose();
      // Reset form
      setProjectId("");
      setVersion("1.0.0");
      setTitle("");
      setChangelog("");
      setIsCurrent(true);
      window.location.reload(); // Quick refresh to show new version
    } else {
      setError(res.error || "Ocurrió un error al crear la versión");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nueva Versión">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-500 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Proyecto asociado</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:border-indigo-500 focus:outline-none transition-all"
            required
          >
            <option value="">Selecciona un proyecto...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Número de Versión
            </label>
            <input
              type="text"
              placeholder="e.g. 1.0.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:border-indigo-500 focus:outline-none transition-all"
              required
            />
            {/* Nueva rama */}
            <label className="text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1 mt-2">
              <GitCommit className="w-3.5 h-3.5" /> Rama (branch)
            </label>
            <input
              type="text"
              placeholder="ej. main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:border-indigo-500 focus:outline-none transition-all"
            />
            {/* Hash del commit */}
            <label className="text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1 mt-2">
              <GitCommit className="w-3.5 h-3.5" /> Hash del commit
            </label>
            <input
              type="text"
              placeholder="e.g. a1b2c3d4..."
              value={commitHash}
              onChange={(e) => setCommitHash(e.target.value)}
              className="w-full bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Título / Nombre</label>
            <input
              type="text"
              placeholder="e.g. Initial Release"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:border-indigo-500 focus:outline-none transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1">
            <GitCommit className="w-3.5 h-3.5" /> Changelog (Lista de cambios)
          </label>
          <textarea
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            placeholder="Un cambio por línea..."
            className="w-full h-24 bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:border-indigo-500 focus:outline-none transition-all resize-none custom-scrollbar"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isCurrent"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="isCurrent" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            Marcar como versión actual (Producción)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear Versión"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
