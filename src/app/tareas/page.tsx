"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Search, Filter, MoreHorizontal, User as UserIcon, Calendar, CheckCircle2, Loader2, GripVertical, Edit3 } from "lucide-react";
import { getAllTasks, moveTaskStatus } from "@/core/application/actions/taskActions";
import { getProjects } from "@/core/application/actions/projectActions";
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
  const columns = [
    { status: "DISCOVERY", title: "Descubrimiento", color: "border-purple-500" },
    { status: "DESIGN", title: "Diseño UI/UX", color: "border-blue-500" },
    { status: "DEVELOPMENT", title: "En Desarrollo", color: "border-indigo-500" },
    { status: "TESTING", title: "Testing / QA", color: "border-cyan-500" },
    { status: "DEPLOYED", title: "Desplegado", color: "border-emerald-500" },
    { status: "MAINTENANCE", title: "Mantenimiento", color: "border-amber-500" },
    { status: "PAUSED", title: "En Pausa", color: "border-orange-500" },
    { status: "COMPLETED", title: "Completado", color: "border-green-500" },
    { status: "ARCHIVED", title: "Archivado", color: "border-slate-500" },
  ];

  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<any | null>(null);
  const [activeTask, setActiveTask] = useState<any | null>(null);

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

  useEffect(() => {
    getProjects().then((res) => {
      if (res.success && res.data) setProjects(res.data);
    });
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [selectedProjectId]);

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
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Tarea</span>
            </button>
          </div>
      </div>

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
        <div className="flex gap-4 overflow-x-auto min-h-[650px] pb-4 snap-x">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);

            return (
              <DroppableColumn
                key={col.status}
                id={col.status}
                className="bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 flex flex-col h-full shadow-lg min-w-[280px] max-w-[320px] shrink-0 snap-start"
              >
                {/* Column Header */}
                <div className="space-y-3 mb-3 shrink-0">
                  <div className={`flex items-center justify-between pb-2 border-b-2 ${col.color}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{col.title}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                        {colTasks.length}
                      </span>
                    </div>
                    <button className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 min-h-[400px]">
                  {colTasks.map((t) => {
                    const subtasksCompleted = t.subtasks?.filter((st: any) => st.completed).length || 0;
                    const subtasksCount = t.subtasks?.length || 0;
                    
                    return (
                    <DraggableTask key={t.id} task={t}>
                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all space-y-2.5 shadow-md group">
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
                            <Badge variant={t.priority === "URGENT" || t.priority === "HIGH" ? "rose" : t.priority === "MEDIUM" ? "amber" : "neutral"}>
                              {t.priority}
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
                          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "Sin fecha"}
                          </span>

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
