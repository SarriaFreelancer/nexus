"use client";

import React, { useState, useEffect } from "react";
import { updateProject } from "@/core/application/actions/projectActions";
import { getProjectEvents, addProjectComment } from "@/core/application/actions/projectEventActions";
import { 
  MessageSquare, GitCommit, FileText, UserPlus, Clock, Loader2, Send, 
  Info, PieChart as PieChartIcon, Zap, Shield, CheckCircle2, Bot, Filter,
  Flag, Users, Layers, Activity, FileUp, Pause, CheckSquare, Edit3
} from "lucide-react";

export function EditProjectForm({ project, onSuccess, onCancel }: { project: any, onSuccess: () => void, onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    getProjectEvents(project.id).then(res => {
      if (res.success && res.data) setEvents(res.data);
      setLoadingEvents(false);
    });
  }, [project.id]);

  const PRESET_BANNERS = [
    "https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
  ];

  const [selectedBanner, setSelectedBanner] = useState(project.bannerUrl && PRESET_BANNERS.includes(project.bannerUrl) ? project.bannerUrl : "");
  const [customBanner, setCustomBanner] = useState(project.bannerUrl && !PRESET_BANNERS.includes(project.bannerUrl) ? project.bannerUrl : "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const bannerToSave = customBanner || selectedBanner;

    const data = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      technologies: JSON.stringify((formData.get("technologies") as string).split(",").map(t => t.trim())),
      estimatedHours: Number(formData.get("estimatedHours")),
      status: formData.get("status") as string,
      bannerUrl: bannerToSave || null,
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

  const [activeFilter, setActiveFilter] = useState("Todos");

  const filteredEvents = events.filter((evt) => {
    if (activeFilter === "Todos") return true;
    if (activeFilter === "Estado") return evt.type === "STATUS_CHANGE";
    if (activeFilter === "Comentarios") return evt.type === "COMMENT";
    if (activeFilter === "Colaboradores") return evt.type === "MEMBER_ADDED" || evt.type === "MEMBER";
    if (activeFilter === "Tareas") return evt.type === "TASK_ADDED" || evt.type === "TASK_UPDATED" || evt.type === "TASK_STATUS";
    if (activeFilter === "Fases" || activeFilter === "Sistema" || activeFilter === "Archivos") return evt.type === "CREATED" || evt.type === "SYSTEM";
    return false;
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh] text-sm overflow-hidden">


      {error && <div className="mb-4 p-3 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl shrink-0">{error}</div>}

      {/* Two Column Layout */}
      <div className="flex-1 overflow-y-auto pr-2 flex gap-6 pb-20 custom-scrollbar">
        
        {/* LEFT COLUMN: Form + Timeline */}
        <div className="flex-1 space-y-8">
          
          {/* Form Fields */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Nombre del Proyecto</label>
                <input required name="name" defaultValue={project.name} type="text" className="w-full bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1a1f35] focus:outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Código (Máx 4 letras)</label>
                <input required name="code" defaultValue={project.code} type="text" maxLength={4} className="w-full bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1a1f35] focus:outline-none uppercase transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Descripción</label>
              <textarea name="description" defaultValue={project.description || ""} rows={3} className="w-full bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1a1f35] focus:outline-none resize-none transition-all"></textarea>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Categoría</label>
                <select name="category" defaultValue={project.category} className="w-full bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1a1f35] focus:outline-none transition-all">
                  <option value="Web App">Web App</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="SaaS">SaaS</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="Infraestructura">Infraestructura</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Estado</label>
                <div className="relative">
                  <select name="status" defaultValue={project.status} className="w-full bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 pl-8 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1a1f35] focus:outline-none transition-all appearance-none">
                    <option value="DISCOVERY">Descubrimiento</option>
                    <option value="DESIGN">En Diseño</option>
                    <option value="DEVELOPMENT">En Desarrollo</option>
                    <option value="TESTING">En Pruebas</option>
                    <option value="DEPLOYED">En Producción</option>
                    <option value="ARCHIVED">Finalizado</option>
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Imagen / Portada del Proyecto</label>
              <div className="grid grid-cols-5 gap-2 mb-2">
                {PRESET_BANNERS.map((url, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => { setSelectedBanner(url); setCustomBanner(""); }}
                    className={`h-16 rounded-lg cursor-pointer overflow-hidden border-2 transition-all ${selectedBanner === url ? "border-indigo-500 scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img src={url} className="w-full h-full object-cover" alt="Preset" />
                  </div>
                ))}
              </div>
              <input 
                type="text" 
                placeholder="O pega una URL personalizada de imagen..." 
                value={customBanner}
                onChange={(e) => { setCustomBanner(e.target.value); setSelectedBanner(""); }}
                className="w-full bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1a1f35] focus:outline-none transition-all text-xs" 
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Tecnologías (separadas por coma)</label>
                <input name="technologies" defaultValue={currentTechs} type="text" className="w-full bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1a1f35] focus:outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Horas Estimadas</label>
                <input name="estimatedHours" defaultValue={project.estimatedHours} type="number" min="0" className="w-full bg-slate-100/50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1a1f35] focus:outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="pt-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Línea de Tiempo</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Historial completo de eventos y cambios del proyecto.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button 
                type="button" 
                onClick={() => setActiveFilter("Todos")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border ${
                  activeFilter === "Todos" 
                    ? "bg-indigo-600 text-white border-indigo-600" 
                    : "bg-slate-100 dark:bg-[#13182b] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1a1f35] border-slate-200 dark:border-slate-800/60"
                }`}
              >
                Todos
              </button>
              {["Estado", "Fases", "Colaboradores", "Tareas", "Comentarios", "Archivos", "Sistema"].map(f => (
                <button 
                  key={f} 
                  type="button" 
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border ${
                    activeFilter === f 
                      ? "bg-indigo-600 text-white border-indigo-600" 
                      : "bg-slate-100 dark:bg-[#13182b] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1a1f35] border-slate-200 dark:border-slate-800/60"
                  }`}
                >
                  {f}
                </button>
              ))}
              <button type="button" className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#13182b] text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 ml-auto border border-slate-200 dark:border-slate-800/60 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Events */}
            <div className="relative border-l border-slate-200 dark:border-slate-800/60 ml-4 space-y-8">
              {loadingEvents ? (
                <div className="pl-8 py-4"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>
              ) : filteredEvents.length === 0 ? (
                <div className="pl-8 py-4 text-xs text-slate-500">No hay eventos para este filtro.</div>
              ) : filteredEvents.map((evt, idx) => {
                // Determine styling based on event type to match mockup
                let Icon = Clock;
                let iconColor = "text-slate-500";
                let iconBg = "bg-slate-100 dark:bg-slate-800";
                let badgeText = "Sistema";
                let badgeColor = "bg-slate-500/10 text-slate-400";
                
                if (evt.type === "CREATED") {
                  Icon = Flag; iconColor = "text-indigo-400"; iconBg = "bg-indigo-500/10"; badgeText = "Creación"; badgeColor = "bg-indigo-500/10 text-indigo-400";
                } else if (evt.type === "MEMBER_ADDED" || evt.type === "MEMBER") {
                  Icon = Users; iconColor = "text-emerald-400"; iconBg = "bg-emerald-500/10"; badgeText = "Colaborador"; badgeColor = "bg-emerald-500/10 text-emerald-400";
                } else if (evt.type === "STATUS_CHANGE") {
                  Icon = Activity; iconColor = "text-amber-500"; iconBg = "bg-amber-500/10"; badgeText = "Estado"; badgeColor = "bg-amber-500/10 text-amber-500";
                } else if (evt.type === "COMMENT") {
                  Icon = MessageSquare; iconColor = "text-blue-400"; iconBg = "bg-blue-500/10"; badgeText = "Comentario"; badgeColor = "bg-blue-500/10 text-blue-400";
                } else if (evt.type === "TASK_ADDED") {
                  Icon = CheckSquare; iconColor = "text-fuchsia-400"; iconBg = "bg-fuchsia-500/10"; badgeText = "Tarea"; badgeColor = "bg-fuchsia-500/10 text-fuchsia-400";
                } else if (evt.type === "TASK_UPDATED") {
                  Icon = Edit3; iconColor = "text-cyan-400"; iconBg = "bg-cyan-500/10"; badgeText = "Edición Tarea"; badgeColor = "bg-cyan-500/10 text-cyan-400";
                } else if (evt.type === "TASK_STATUS") {
                  Icon = Layers; iconColor = "text-violet-400"; iconBg = "bg-violet-500/10"; badgeText = "Estado Tarea"; badgeColor = "bg-violet-500/10 text-violet-400";
                }

                return (
                  <div key={evt.id} className="relative pl-8 group">
                    {/* Event Dot */}
                    <div className="absolute -left-1.5 top-2 w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full border-2 border-white dark:border-[#0b0e1a] group-hover:bg-indigo-400 transition-colors"></div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        {/* Event Icon Square */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${iconBg}`}>
                          <Icon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        
                        {/* Event Content */}
                        <div className="pt-0.5">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {evt.type === 'STATUS_CHANGE' ? 'Estado actualizado' : evt.type === 'CREATED' ? 'Proyecto creado' : evt.content}
                          </h4>
                          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug max-w-sm">
                            {(() => {
                              if (evt.type === 'STATUS_CHANGE') {
                                let details = evt.details;
                                if (typeof details === 'string') {
                                  try { details = JSON.parse(details); } catch(e){}
                                }
                                if (details && details.before && details.after) {
                                  const translate = (st: string) => st === "DEVELOPMENT" ? "En Desarrollo" : st === "DESIGN" ? "En Diseño" : st === "TESTING" ? "En Pruebas" : st === "DEPLOYED" ? "En Producción" : st === "ARCHIVED" ? "Finalizado" : st === "DISCOVERY" ? "Descubrimiento" : st;
                                  return `El estado del proyecto cambió de ${translate(details.before)} a ${translate(details.after)}.`;
                                }
                              }
                              return evt.content;
                            })()}
                          </p>
                          
                          {/* Sub-event (Mocked automation) */}
                          {evt.type === 'STATUS_CHANGE' && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/60">
                              <div className="p-1 rounded bg-slate-100 dark:bg-slate-800">
                                <Bot className="w-3.5 h-3.5 text-slate-500" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Automatización ejecutada</p>
                                <p className="text-[10px] text-slate-500">Se notificó al equipo sobre el cambio de estado.</p>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Completado
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side: Badge + User + Date */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeColor}`}>
                            {badgeText}
                          </span>
                          <div className="flex items-center gap-2 text-right">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{evt.user.name}</span>
                              <span className="text-[10px] text-slate-500 mt-1">{new Date(evt.createdAt).toLocaleDateString()}</span>
                              <span className="text-[10px] text-slate-500">{new Date(evt.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <img src={evt.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(evt.user.name)}&background=random`} alt={evt.user.name} className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-[#0b0e1a]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Info Cards */}
        <div className="w-[320px] shrink-0 space-y-4">
          
          {/* Card 1: Información General */}
          <div className="bg-slate-50/50 dark:bg-[#13182b]/80 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5">
            <h4 className="flex items-center gap-2 text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-4">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400"><Info className="w-4 h-4" /></div>
              Información General
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Fecha de creación</p>
                  <p className="text-[13px] text-slate-700 dark:text-slate-300">{new Date(project.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Creado por</p>
                  <p className="text-[13px] text-slate-700 dark:text-slate-300">David Sarria</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Última actualización</p>
                  <p className="text-[13px] text-slate-700 dark:text-slate-300">{new Date(project.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Resumen del Proyecto */}
          <div className="bg-slate-50/50 dark:bg-[#13182b]/80 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5">
            <h4 className="flex items-center gap-2 text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400"><PieChartIcon className="w-4 h-4" /></div>
              Resumen del Proyecto
            </h4>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-slate-500">Fase Actual</span>
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[11px] font-bold">Pruebas</span>
              </div>
              
              <div>
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="text-slate-500">Progreso General</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">68%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[68%] rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/60">
                <span className="text-[12px] text-slate-500">Colaboradores</span>
                <div className="flex items-center">
                  <span className="text-[13px] text-slate-700 dark:text-slate-300 font-bold mr-2">6</span>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} className="w-6 h-6 rounded-full border-2 border-white dark:border-[#13182b]" />)}
                    <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-white dark:border-[#13182b] flex items-center justify-center text-[10px] text-white font-bold">+2</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="text-slate-500">Tareas Completadas</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">18 / 26</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[70%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Automatizaciones */}
          <div className="bg-slate-50/50 dark:bg-[#13182b]/80 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="flex items-center gap-2 text-[13px] font-bold text-slate-800 dark:text-slate-200">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400"><Zap className="w-4 h-4" /></div>
                Automatizaciones
              </h4>
              <div className="w-8 h-4 bg-indigo-500 rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { icon: GitCommit, title: "Al cambiar a Producción", sub: "Crear respaldo automático" },
                { icon: MessageSquare, title: "Al cambiar de fase", sub: "Notificar al equipo" },
                { icon: FileText, title: "Al completar todas las tareas", sub: "Solicitar revisión" },
                { icon: UserPlus, title: "Al cambiar estado a En Pausa", sub: "Asignar responsable" },
              ].map((auto, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-slate-200/50 dark:bg-slate-800/50 text-slate-500">
                    <auto.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-slate-400">{auto.title}</p>
                    <p className="text-[12px] text-slate-700 dark:text-slate-300">{auto.sub}</p>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Auditoría */}
          <div className="bg-slate-50/50 dark:bg-[#13182b]/80 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="flex items-center gap-2 text-[13px] font-bold text-slate-800 dark:text-slate-200">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400"><Shield className="w-4 h-4" /></div>
                Auditoría
              </h4>
              <span className="text-[11px] text-indigo-500 hover:underline cursor-pointer font-medium">Ver todos</span>
            </div>
            
            <div className="space-y-3">
              {[
                { label: "Cambios realizados", val: 23 },
                { label: "Comentarios", val: 14 },
                { label: "Archivos adjuntos", val: 9 },
                { label: "Historial de versiones", val: 5 },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center text-[12px]">
                  <span className="text-slate-500">{stat.label}</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto -mx-5 -mb-5 px-5 py-4 bg-white/90 dark:bg-[#0f1424]/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-end gap-3 z-10 shrink-0 rounded-b-2xl">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 text-sm font-bold transition-all border border-slate-200 dark:border-slate-700/50">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}
