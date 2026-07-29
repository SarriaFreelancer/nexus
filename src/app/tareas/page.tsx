"use client";

import React, { useState } from "react";
import { CheckSquare, Plus, Search, Filter, MoreHorizontal, User as UserIcon, Calendar, CheckCircle2 } from "lucide-react";
import { mockNextTasks, mockTeamMembers } from "@/core/infrastructure/mockData";
import { TaskStatus, Priority } from "@/core/domain/types";
import { Badge } from "@/components/ui/Badge";

export default function TareasPage() {
  const columns: { status: TaskStatus; title: string; color: string }[] = [
    { status: "Backlog", title: "Backlog", color: "border-slate-700" },
    { status: "Diseño", title: "Diseño UI/UX", color: "border-blue-500" },
    { status: "Desarrollo", title: "En Desarrollo", color: "border-indigo-500" },
    { status: "Testing", title: "Testing / QA", color: "border-emerald-500" },
    { status: "Deploy", title: "Deploy & Prod", color: "border-amber-500" },
  ];

  const [tasks, setTasks] = useState(mockNextTasks);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-indigo-400" /> Tablero Kanban Avanzado
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Flujo de trabajo unificado con prioridades, subtareas, fechas límite y automatización de despliegue.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start">
          <Plus className="h-4 w-4" />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-h-[650px]">
        {columns.map((col) => {
          const colTasks = tasks.filter(
            (t) => t.status === col.status || (col.status === "Backlog" && t.status === "Ideas")
          );

          return (
            <div
              key={col.status}
              className="bg-[#0f1424] border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between h-full shadow-lg"
            >
              {/* Column Header */}
              <div className="space-y-3 mb-3">
                <div className={`flex items-center justify-between pb-2 border-b-2 ${col.color}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{col.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] font-bold text-slate-400 border border-slate-800">
                      {colTasks.length}
                    </span>
                  </div>
                  <button className="p-1 rounded text-slate-500 hover:text-slate-300">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 min-h-[400px]">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 cursor-grab active:cursor-grabbing transition-all space-y-2.5 shadow-md group"
                    >
                      {/* Badge & Code */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800">
                          {t.code}
                        </span>
                        <Badge variant={t.priority === "Alta" ? "rose" : "amber"}>
                          {t.priority}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-slate-200 text-xs leading-snug group-hover:text-indigo-300 transition-colors">
                        {t.title}
                      </h4>

                      {/* Subtasks checklist indicator */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                        <span>
                          {t.subtasksCompleted} / {t.subtasksCount} subtareas
                        </span>
                      </div>

                      {/* Footer Assignee & Date */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {t.dueDate}
                        </span>

                        {t.assignee && (
                          <img
                            src={t.assignee.avatarUrl}
                            alt={t.assignee.name}
                            className="h-5 w-5 rounded-full object-cover ring-1 ring-indigo-500/40"
                            title={t.assignee.name}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Task Button at bottom of column */}
              <button className="w-full py-2 rounded-xl border border-dashed border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
                <Plus className="h-3.5 w-3.5" /> Agregar Tarea
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
