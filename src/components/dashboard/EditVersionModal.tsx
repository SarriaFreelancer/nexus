"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { updateVersion } from "@/core/application/actions/versionActions";
import { Tag, Calendar, GitCommit } from "lucide-react";

interface EditVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
  initialData: any;
}

export function EditVersionModal({ isOpen, onClose, projects, initialData }: EditVersionModalProps) {
  const [projectId, setProjectId] = useState("");
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [changelog, setChangelog] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData && isOpen) {
      setProjectId(initialData.projectId || "");
      setVersion(initialData.version || "");
      setTitle(initialData.title || "");
      setChangelog(initialData.changelog || "");
      setIsCurrent(initialData.isCurrent || false);
      setError("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version || !title) {
      setError("Todos los campos principales son requeridos.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await updateVersion(initialData.id, {
      version,
      title,
      changelog,
      isCurrent
    });

    setLoading(false);

    if (res.success) {
      onClose();
      window.location.reload(); // Quick refresh to show updated version
    } else {
      setError(res.error || "Ocurrió un error al actualizar la versión");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Versión">
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
            disabled
            className="w-full bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 text-sm opacity-60 cursor-not-allowed"
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
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
