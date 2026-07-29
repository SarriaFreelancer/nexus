"use client";

import React, { useState, useEffect } from "react";
import { updateProject } from "@/core/application/actions/projectActions";
import { getProjectEvents, addProjectComment } from "@/core/application/actions/projectEventActions";
import { MessageSquare, GitCommit, FileText, UserPlus, Clock, Loader2, Send } from "lucide-react";

export function EditProjectForm({ project, onSuccess, onCancel }: { project: any, onSuccess: () => void, onCancel: () => void }) {
  const [activeTab, setActiveTab] = useState<"details" | "timeline">("details");

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Tabs Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800/80 mb-4 px-1">
        <button
          onClick={() => setActiveTab("details")}
          className={`pb-2 px-1 text-xs font-bold transition-all border-b-2 ${
            activeTab === "details"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Detalles del Proyecto
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`pb-2 px-1 text-xs font-bold transition-all border-b-2 ${
            activeTab === "timeline"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Línea de Tiempo
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2">
        {activeTab === "details" && (
          <ProjectDetailsTab project={project} onSuccess={onSuccess} onCancel={onCancel} />
        )}
        {activeTab === "timeline" && (
          <ProjectTimelineTab projectId={project.id} />
        )}
      </div>
    </div>
  );
}

// ==========================================
// PESTAÑA 1: DETALLES (Formulario)
// ==========================================
function ProjectDetailsTab({ project, onSuccess, onCancel }: { project: any, onSuccess: () => void, onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      technologies: JSON.stringify((formData.get("technologies") as string).split(",").map(t => t.trim())),
      estimatedHours: Number(formData.get("estimatedHours")),
      status: formData.get("status") as string,
    };

    try {
      const res = await updateProject(project.id, data as any);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Error al actualizar proyecto");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentTechs = Array.isArray(project.technologies) 
    ? project.technologies.join(", ")
    : typeof project.technologies === "string" 
      ? (() => { try { return JSON.parse(project.technologies).join(", ") } catch(e){ return "" } })() 
      : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      {error && <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl">{error}</div>}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Nombre del Proyecto</label>
          <input required name="name" defaultValue={project.name} type="text" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Código (Máx 4 letras)</label>
          <input required name="code" defaultValue={project.code} type="text" maxLength={4} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none uppercase" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Descripción</label>
        <textarea name="description" defaultValue={project.description || ""} rows={3} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none resize-none"></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Categoría</label>
          <select name="category" defaultValue={project.category} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none">
            <option value="Web App">Web App</option>
            <option value="Mobile App">Mobile App</option>
            <option value="SaaS">SaaS</option>
            <option value="E-Commerce">E-Commerce</option>
            <option value="Infraestructura">Infraestructura</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Estado</label>
          <select name="status" defaultValue={project.status} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none">
            <option value="DISCOVERY">Descubrimiento</option>
            <option value="DESIGN">En Diseño</option>
            <option value="DEVELOPMENT">En Desarrollo</option>
            <option value="TESTING">En Pruebas</option>
            <option value="DEPLOYED">En Producción</option>
            <option value="ARCHIVED">Finalizado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Tecnologías (separadas por coma)</label>
          <input name="technologies" defaultValue={currentTechs} type="text" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Horas Estimadas</label>
          <input name="estimatedHours" defaultValue={project.estimatedHours} type="number" min="0" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}

// ==========================================
// PESTAÑA 2: LÍNEA DE TIEMPO
// ==========================================
function ProjectTimelineTab({ projectId }: { projectId: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEvents = () => {
    getProjectEvents(projectId).then(res => {
      if (res.success) {
        setEvents(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchEvents();
  }, [projectId]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    
    const res = await addProjectComment(projectId, comment);
    if (res.success) {
      setComment("");
      fetchEvents(); // reload events
    }
    setIsSubmitting(false);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "COMMENT": return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "STATUS_CHANGE": return <GitCommit className="w-4 h-4 text-emerald-500" />;
      case "MEMBER_ADDED": return <UserPlus className="w-4 h-4 text-amber-500" />;
      case "CREATED": return <FileText className="w-4 h-4 text-indigo-500" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Caja de Comentarios */}
      <form onSubmit={handleComment} className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 space-y-2">
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Añadir un comentario o nota al proyecto..."
            className="w-full bg-white dark:bg-[#0b0e1a] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
            rows={2}
          />
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting || !comment.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Comentar
            </button>
          </div>
        </div>
      </form>

      {/* Timeline */}
      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
      ) : events.length === 0 ? (
        <div className="text-center p-10 text-slate-500 dark:text-slate-400 text-xs">
          No hay historial para este proyecto.
        </div>
      ) : (
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-6">
          {events.map((evt, idx) => (
            <div key={evt.id} className="relative pl-6">
              {/* Event Dot */}
              <div className="absolute -left-3.5 top-0 w-7 h-7 bg-white dark:bg-[#0b0e1a] border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow-sm">
                {getEventIcon(evt.type)}
              </div>

              {/* Event Content */}
              <div className="bg-white dark:bg-[#0f1424] p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <img src={evt.user.avatarUrl || "https://i.pravatar.cc/150"} alt={evt.user.name} className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{evt.user.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(evt.createdAt).toLocaleString()}
                  </span>
                </div>
                
                {evt.type === "COMMENT" ? (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap">
                    {evt.content}
                  </p>
                ) : (
                  <div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {evt.content}
                    </span>
                    {evt.details && (
                      <div className="mt-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        {evt.details.before && evt.details.after ? (
                          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                            <span className="line-through">{evt.details.before}</span>
                            <span className="text-indigo-400 font-bold">→</span>
                            <span className="text-emerald-500 font-bold">{evt.details.after}</span>
                          </div>
                        ) : (
                          <pre className="text-[10px] text-slate-500 font-mono">
                            {JSON.stringify(evt.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
