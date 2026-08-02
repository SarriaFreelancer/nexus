"use client";

import React from "react";
import { BarChart3, TrendingUp, Calendar, Clock, CheckSquare } from "lucide-react";

interface ProductivityChartWidgetProps {
  data?: { name: string; tasksCompleted: number; hoursLogged: number }[];
}

export const ProductivityChartWidget: React.FC<ProductivityChartWidgetProps> = ({ data = [] }) => {
  // Use passed data or fallback to empty state
  const productivityData = data.length > 0 ? data : [
    { name: "Lun", tasksCompleted: 0, hoursLogged: 0 },
    { name: "Mar", tasksCompleted: 0, hoursLogged: 0 },
    { name: "Mié", tasksCompleted: 0, hoursLogged: 0 },
    { name: "Jue", tasksCompleted: 0, hoursLogged: 0 },
    { name: "Vie", tasksCompleted: 0, hoursLogged: 0 },
    { name: "Sáb", tasksCompleted: 0, hoursLogged: 0 },
    { name: "Dom", tasksCompleted: 0, hoursLogged: 0 },
  ];

  // Prevent divide by zero in heights
  const maxTasks = Math.max(...productivityData.map((d) => d.tasksCompleted), 1);
  const maxHours = Math.max(...productivityData.map((d) => d.hoursLogged), 1);

  const totalTasks = productivityData.reduce((sum, d) => sum + d.tasksCompleted, 0);
  const totalHours = productivityData.reduce((sum, d) => sum + d.hoursLogged, 0);

  // Find most productive day
  let bestDay = "-";
  let maxProd = -1;
  productivityData.forEach(d => {
    if (d.tasksCompleted > maxProd) {
      maxProd = d.tasksCompleted;
      bestDay = d.name;
    }
  });

  return (
    <div className="mt-6 p-6 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 p-24 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" /> Rendimiento Semanal
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tareas completadas vs Horas invertidas en los últimos 7 días.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
            <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">Tareas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">Horas</span>
          </div>
        </div>
      </div>

      {/* CSS Grid Chart */}
      <div className="relative h-48 w-full flex items-end justify-between gap-2 sm:gap-4 z-10 mt-4">
        {/* Y Axis Guides */}
        <div className="absolute inset-0 flex flex-col justify-between border-y border-slate-200 dark:border-slate-800/50 pointer-events-none z-0">
          <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-800/80" />
          <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-800/80" />
          <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-800/80" />
          <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-800/80" />
        </div>

        {/* Bars */}
        {productivityData.map((item, idx) => {
          const taskHeight = (item.tasksCompleted / maxTasks) * 100;
          const hourHeight = (item.hoursLogged / maxHours) * 100;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 relative z-10 group/bar">
              <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full relative">
                
                {/* Tooltip */}
                <div className="absolute -top-10 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                  {item.tasksCompleted} Tareas | {item.hoursLogged} hrs
                </div>

                {/* Task Bar */}
                <div
                  className="w-1/2 max-w-[24px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all duration-500 group-hover/bar:brightness-110"
                  style={{ height: `${taskHeight}%` }}
                />
                
                {/* Hours Bar */}
                <div
                  className="w-1/2 max-w-[24px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm shadow-[0_0_15px_rgba(52,211,153,0.15)] transition-all duration-500 group-hover/bar:brightness-110"
                  style={{ height: `${hourHeight}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-2">{item.name}</span>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Total Tareas</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{totalTasks} completadas</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Horas Invertidas</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{totalHours.toFixed(1)} hrs</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Eficiencia</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {totalHours > 0 ? `${(totalTasks / totalHours).toFixed(1)} tks/h` : "100%"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Día más productivo</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{maxProd > 0 ? bestDay : "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
