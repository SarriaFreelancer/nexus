"use client";

import React, { useState, useEffect } from "react";
import { updateTask, addSubtask, toggleSubtask, deleteSubtask, addTaskAttachment, removeTaskAttachment } from "@/core/application/actions/taskActions";
import { getProjects } from "@/core/application/actions/projectActions";
import { Loader2, Plus, Trash2, CheckCircle2, Circle, Zap, Calendar, FolderKanban, Paperclip, Image as ImageIcon, Link as LinkIcon } from "lucide-react";

export function EditTaskForm({ task, onSuccess, onCancel }: { task: any; onSuccess: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [subtasks, setSubtasks] = useState<any[]>(task.subtasks || []);
  const [status, setStatus] = useState(task.status);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [autoDeploy, setAutoDeploy] = useState(false);
  const [attachments, setAttachments] = useState<any[]>(task.attachments || []);
  const [newAttachmentName, setNewAttachmentName] = useState("");
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("");
  const [addingAttachment, setAddingAttachment] = useState(false);

  useEffect(() => {
    getProjects().then((res) => {
      if (res.success && res.data) setProjects(res.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      projectId: formData.get("projectId") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as string,
      priority: formData.get("priority") as string,
      estimatedHs: Number(formData.get("estimatedHs")),
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
      coverUrl: formData.get("coverUrl") as string,
    };

    try {
      const res = await updateTask(task.id, data as any);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Error al actualizar la tarea");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    setAddingSubtask(true);
    try {
      const res = await addSubtask(task.id, newSubtaskTitle.trim());
      if (res.success && res.data) {
        setSubtasks((prev) => [...prev, res.data]);
        setNewSubtaskTitle("");
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setAddingSubtask(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    const nextState = !currentCompleted;
    // Optimistic UI update
    const newSubtasks = subtasks.map((st) => (st.id === subtaskId ? { ...st, completed: nextState } : st));
    setSubtasks(newSubtasks);
    
    // Check if all subtasks are completed now
    const allCompleted = newSubtasks.length > 0 && newSubtasks.every(st => st.completed);
    if (allCompleted) {
      setStatus("PRODUCTION");
    }
    
    await toggleSubtask(subtaskId, nextState);
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    setSubtasks((prev) => prev.filter((st) => st.id !== subtaskId));
    await deleteSubtask(subtaskId);
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttachmentName.trim() || !newAttachmentUrl.trim()) return;

    setAddingAttachment(true);
    try {
      const res = await addTaskAttachment(task.id, newAttachmentName.trim(), newAttachmentUrl.trim());
      if (res.success && res.data) {
        setAttachments((prev) => [...prev, res.data]);
        setNewAttachmentName("");
        setNewAttachmentUrl("");
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setAddingAttachment(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    await removeTaskAttachment(attachmentId);
  };

  const formattedDueDate = task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-sm">
      {error && <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Título de la Tarea</label>
          <input
            required
            name="title"
            defaultValue={task.title}
            type="text"
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Project Selector (Strict relation to existing projects) */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-indigo-400" /> Proyecto Asociado
          </label>
          <select
            required
            name="projectId"
            key={projects.length}
            defaultValue={task.projectId}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Selecciona un proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Estado</label>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="BACKLOG">Backlog</option>
            <option value="IN_DESIGN">Diseño</option>
            <option value="IN_DEVELOPMENT">Desarrollo</option>
            <option value="IN_TESTING">Testing / QA</option>
            <option value="PRODUCTION">Deploy & Prod</option>
          </select>
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Prioridad</label>
          <select
            name="priority"
            defaultValue={task.priority}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>

        {/* Hours */}
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Horas Estimadas</label>
          <input
            name="estimatedHs"
            type="number"
            min="0"
            defaultValue={task.estimatedHs || 0}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Due Date */}
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Fecha Límite
          </label>
          <input
            name="dueDate"
            type="date"
            defaultValue={formattedDueDate}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Cover Image */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Foto de Portada (URL)
          </label>
          <input
            name="coverUrl"
            type="url"
            placeholder="https://..."
            defaultValue={task.coverUrl || ""}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Descripción</label>
        <textarea
          name="description"
          defaultValue={task.description || ""}
          rows={3}
          className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
        ></textarea>
      </div>

      {/* Subtasks Section */}
      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Checklist / Tareas Internas ({subtasks.filter((st) => st.completed).length} / {subtasks.length})
          </label>
        </div>

        {/* Add Subtask input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Añadir tarea al checklist..."
            className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSubtask(e);
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddSubtask}
            disabled={addingSubtask || !newSubtaskTitle.trim()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 shrink-0"
          >
            {addingSubtask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Añadir
          </button>
        </div>

        {/* Subtasks List */}
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {subtasks.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">No hay tareas internas creadas aún.</p>
          ) : (
            subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 text-xs"
              >
                <button
                  type="button"
                  onClick={() => handleToggleSubtask(st.id, st.completed)}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  {st.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className={st.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}>
                    {st.title}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSubtask(st.id)}
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Attachments Section */}
      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5">
            <Paperclip className="w-4 h-4 text-indigo-400" /> Archivos Adjuntos ({attachments.length})
          </label>
        </div>

        {/* Add Attachment inputs */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newAttachmentName}
            onChange={(e) => setNewAttachmentName(e.target.value)}
            placeholder="Nombre (ej. Diseño Figma)"
            className="w-full sm:w-1/3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
          <input
            type="url"
            value={newAttachmentUrl}
            onChange={(e) => setNewAttachmentUrl(e.target.value)}
            placeholder="URL del archivo..."
            className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddAttachment(e);
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddAttachment}
            disabled={addingAttachment || !newAttachmentName.trim() || !newAttachmentUrl.trim()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1 shrink-0"
          >
            {addingAttachment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Añadir
          </button>
        </div>

        {/* Attachments List */}
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {attachments.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">No hay archivos adjuntos.</p>
          ) : (
            attachments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-200 hover:text-indigo-500 dark:hover:text-indigo-400 truncate font-medium hover:underline">
                    {a.name}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAttachment(a.id)}
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors shrink-0 ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Deployment Automation Option */}
      <div className="p-3 rounded-xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Automatización de Despliegue</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Ejecutar CI/CD automáticamente al mover a "Deploy & Prod"</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAutoDeploy(!autoDeploy)}
          className={`w-9 h-5 rounded-full relative transition-colors ${autoDeploy ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}
        >
          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all ${autoDeploy ? "right-0.75" : "left-0.75"}`}></div>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}
