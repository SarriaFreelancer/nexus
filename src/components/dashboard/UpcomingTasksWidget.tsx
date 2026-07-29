"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Circle } from "lucide-react";

interface UpcomingTasksWidgetProps {
  tasks?: any[];
}

export const UpcomingTasksWidget: React.FC<UpcomingTasksWidgetProps> = ({ tasks = [] }) => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Próximas Tareas</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Ver todas
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Circle className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {task.title}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{task.project?.name || "General"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={task.priority === "HIGH" || task.priority === "URGENT" ? "rose" : "amber"}>
                {task.priority === "HIGH" ? "Alta" : task.priority === "URGENT" ? "Urgente" : task.priority === "MEDIUM" ? "Media" : "Baja"}
              </Badge>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 min-w-[45px] text-right">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "-"}
              </span>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No hay tareas pendientes.</div>
        )}
      </div>
    </div>
  );
};
