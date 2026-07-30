"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Search, Filter, MoreHorizontal, User as UserIcon, Calendar, CheckCircle2, Loader2, GripVertical, Edit3, AlertTriangle, Clock } from "lucide-react";
import { getAllTasks, moveTaskStatus } from "@/core/application/actions/taskActions";
import { getProjects } from "@/core/application/actions/projectActions";
import { getWorkspaceTaskStatuses, createCustomTaskStatus } from "@/core/application/actions/taskStatusActions";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CreateTaskForm } from "@/components/dashboard/CreateTaskForm";
import { EditTaskForm } from "@/components/dashboard/EditTaskForm";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';

// Draggable Task Component
function DraggableTask({ task, children }: { task: any, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.8 : 1,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
      {children}
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div ref={setNodeRef} className={`${className} ${isOver ? 'ring-2 ring-indigo-500 bg-indigo-500/10' : ''} transition-all`}>
      {children}
    </div>
  );
}

export default function TareasPage() {
  const [taskStatuses, setTaskStatuses] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewStatusModalOpen, setIsNewStatusModalOpen] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("border-purple-500");
  const [creatingStatus, setCreatingStatus] = useState(false);
  const [editTask, setEditTask] = useState<any | null>(null);
  const [activeTask, setActiveTask] = useState<any>(null);

  const topScrollRef = React.useRef<HTMLDivElement>(null);
  const bottomScrollRef = React.useRef<HTMLDivElement>(null);

  const handleTopScroll = () => {
    if (topScrollRef.current && bottomScrollRef.current) {
      bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const handleBottomScroll = () => {
    if (topScrollRef.current && bottomScrollRef.current) {
      topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const fetchTasks = () => {
    setIsLoading(true);
    getAllTasks(selectedProjectId || undefined).then((res) => {
      if (res.success && res.data) {
        setTasks(res.data);
      }
      setIsLoading(false);
    });
  };

  const fetchStatusesAndProjects = async () => {
    const [stRes, prRes] = await Promise.all([
      getWorkspaceTaskStatuses(),
      getProjects()
    ]);
    if (stRes.success && stRes.data) setTaskStatuses(stRes.data);
    if (prRes.success && prRes.data) setProjects(prRes.data);
  };

  useEffect(() => {
    fetchStatusesAndProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [selectedProjectId]);

  const handleCreateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusName.trim()) return;
    setCreatingStatus(true);
    try {
      const res = await createCustomTaskStatus(newStatusName.trim(), newStatusColor);
      if (res.success) {
        setNewStatusName("");
        setIsNewStatusModalOpen(false);
        if (res.data) {
          setTaskStatuses((prev) => [...prev, res.data]);
        }
        await fetchStatusesAndProjects();
      } else {
        alert("Error al crear estado: " + (res.error || "Intenta nuevamente"));
      }
    } catch (err: any) {
      alert("Error al crear estado: " + err.message);
    } finally {
      setCreatingStatus(false);
    }
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveTask(active.data.current);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatusId = over.id; // column id
    const task = tasks.find(t => t.id === taskId);
    
    const targetStatus = newStatusId;

    if (task && task.status !== targetStatus) {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));
      
      const res = await moveTaskStatus(taskId, targetStatus);
      if (!res.success) {
        // Revert on error
        fetchTasks();
      }
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Tarea">
        <CreateTaskForm 
          onCancel={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchTasks();
          }} 
        />
      </Modal>

      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Editar Tarea" width="max-w-xl">
        {editTask && (
          <EditTaskForm
            task={editTask}
            onCancel={() => setEditTask(null)}
            onSuccess={() => {
              setEditTask(null);
              fetchTasks();
            }}
          />
        )}
      </Modal>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-indigo-400" /> Tablero Kanban Avanzado
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Flujo de trabajo unificado con prioridades, subtareas, fechas límite y automatización de despliegue.
          </p>
        </div>

        <div className="flex items-center gap-3">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#0f1424] text-slate-300 text-sm font-medium border border-slate-800/80 rounded-xl px-3 py-2 outline-none w-48 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Todos los Proyectos</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar tareas..." 
                className="pl-9 pr-4 py-2 bg-[#0f1424] border border-slate-800/80 rounded-xl text-sm font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-full md:w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-[#161b2c] text-sm font-bold text-slate-300 rounded-xl hover:bg-slate-800 transition-colors border border-slate-800">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>
            <button 
              onClick={() => setIsNewStatusModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#161b2c] hover:bg-slate-800 text-slate-300 text-sm font-bold rounded-xl transition-all border border-slate-800"
            >
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Nuevo Estado</span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Tarea</span>
            </button>
          </div>
      </div>

      <Modal isOpen={isNewStatusModalOpen} onClose={() => setIsNewStatusModalOpen(false)} title="Crear Nuevo Estado de Tarea">
        <form onSubmit={handleCreateStatus} className="space-y-4 text-sm">
          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Nombre del Estado</label>
            <input
              required
              type="text"
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
              placeholder="Ej. Revisión Cliente, Por Desplegar..."
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Color del Borde / Estado</label>
            <select
              value={newStatusColor}
              onChange={(e) => setNewStatusColor(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="border-purple-500">Púrpura</option>
              <option value="border-pink-500">Rosa</option>
              <option value="border-amber-500">Ámbar</option>
              <option value="border-teal-500">Teal / Turquesa</option>
              <option value="border-indigo-500">Índigo</option>
              <option value="border-rose-500">Rojo / Rose</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsNewStatusModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creatingStatus || !newStatusName.trim()}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {creatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar Estado
            </button>
          </div>
        </form>
      </Modal>

      {/* Kanban Board Columns */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : (
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Sleek Top Horizontal Scrollbar */}
        <div 
          ref={topScrollRef} 
          onScroll={handleTopScroll}
          className="overflow-x-auto w-full mb-2 h-3.5 custom-scrollbar shrink-0"
        >
          <div style={{ width: `${taskStatuses.length * 300 + (taskStatuses.length - 1) * 16}px` }} className="h-1" />
        </div>

        <div 
          ref={bottomScrollRef}
          onScroll={handleBottomScroll}
          className="flex gap-4 overflow-x-auto min-h-[650px] pb-4 snap-x custom-scrollbar"
        >
          {taskStatuses.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);

            return (
              <DroppableColumn
                key={col.key}
                id={col.key}
                className="bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 flex flex-col h-full shadow-lg min-w-[280px] max-w-[320px] shrink-0 snap-start"
              >
                {/* Column Header */}
                <div className="space-y-3 mb-3 shrink-0">
                  <div className={`flex items-center justify-between pb-2 border-b-2 ${col.color || 'border-indigo-500'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{col.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                        {colTasks.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 min-h-[400px]">
                  {colTasks.map((t) => {
                    const subtasksCompleted = t.subtasks?.filter((st: any) => st.completed).length || 0;
                    const subtasksCount = t.subtasks?.length || 0;

                    const isCompleted = t.status === "COMPLETED" || t.status === "DEPLOYED";
                    const now = new Date();
                    const dueDate = t.dueDate ? new Date(t.dueDate) : null;
                    const isOverdue = !isCompleted && dueDate && dueDate < now;
                    const hoursDiff = dueDate ? (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60) : null;
                    const isDueSoon = !isCompleted && !isOverdue && hoursDiff !== null && hoursDiff <= 48 && hoursDiff >= 0;
                    
                    return (
                    <DraggableTask key={t.id} task={t}>
                      <div className={`p-3.5 rounded-xl border transition-all space-y-2.5 shadow-md group ${
                        isOverdue
                          ? "bg-rose-50/80 dark:bg-rose-950/25 border-rose-500/70 dark:border-rose-700/80 shadow-rose-500/10 ring-1 ring-rose-500/40"
                          : isDueSoon
                          ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-400 dark:border-amber-700/70"
                          : "bg-slate-100 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40"
                      }`}>
                        {t.coverUrl && (
                          <div className="w-full h-24 -mt-1 mb-2 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                            <img src={t.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {/* Badge & Code */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800">
                            {t.project?.code || "TSK"}-{t.id.substring(0,4).toUpperCase()}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Badge variant={isOverdue ? "rose" : t.priority === "URGENT" || t.priority === "HIGH" ? "rose" : t.priority === "MEDIUM" ? "amber" : "neutral"}>
                              {isOverdue ? "VENCIDA" : t.priority}
                            </Badge>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTask(t);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                              title="Editar tarea"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs leading-snug group-hover:text-indigo-300 transition-colors">
                          {t.title}
                        </h4>

                        {/* Subtasks checklist indicator */}
                        {subtasksCount > 0 && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                            <span>
                              {subtasksCompleted} / {subtasksCount} subtareas
                            </span>
                          </div>
                        )}

                        {/* Footer Assignee & Date */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/60 text-[10px]">
                          {isOverdue ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500/10 dark:bg-rose-950/80 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-rose-500 animate-bounce" /> VENCIDA ({new Date(t.dueDate).toLocaleDateString()})
                            </span>
                          ) : isDueSoon ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-950/80 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Clock className="h-3 w-3 text-amber-500 animate-pulse" /> PRÓXIMA ({new Date(t.dueDate).toLocaleDateString()})
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "Sin fecha"}
                            </span>
                          )}

                          {t.assignee && (
                            <img
                              src={t.assignee.avatarUrl || `https://ui-avatars.com/api/?name=${t.assignee.name}`}
                              alt={t.assignee.name}
                              className="h-5 w-5 rounded-full object-cover ring-1 ring-indigo-500/40"
                              title={t.assignee.name}
                            />
                          )}
                        </div>
                      </div>
                    </DraggableTask>
                  )})}
                </div>

                {/* Add Task Button at bottom of column */}
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-2 mt-3 shrink-0 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> Agregar Tarea
                </button>
              </DroppableColumn>
            );
          })}
        </div>
      </DndContext>
      )}
    </div>
  );
}
