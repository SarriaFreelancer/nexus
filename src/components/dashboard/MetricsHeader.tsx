"use client";

import React from "react";
import { formatCurrency, formatHours } from "@/lib/utils";
import { FolderKanban, CheckSquare, Users, DollarSign, Clock, ArrowUpRight } from "lucide-react";

export const MetricsHeader: React.FC<{ metrics: any }> = ({ metrics }) => {
  const cards = [
    {
      title: "Proyectos Activos",
      value: metrics.activeProjects,
      growth: `+12%`, // Static for now as it's not in our DB

      icon: FolderKanban,
      color: "from-indigo-600/20 to-purple-600/10 border-indigo-500/30 text-indigo-400",
      iconBg: "bg-indigo-950 text-indigo-400 border border-indigo-700/50",
    },
    {
      title: "Tareas en Proceso",
      value: metrics.totalTasks - metrics.completedTasks,
      growth: `+5%`,
      icon: CheckSquare,
      color: "from-blue-600/20 to-indigo-600/10 border-blue-500/30 text-blue-400",
      iconBg: "bg-blue-950 text-blue-400 border border-blue-700/50",
    },
    {
      title: "Clientes Activos",
      value: metrics.totalClients,
      growth: `+18%`,
      icon: Users,
      color: "from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-400",
      iconBg: "bg-emerald-950 text-emerald-400 border border-emerald-700/50",
    },
    {
      title: "Ingresos del Mes",
      value: formatCurrency(24500), // Static as we haven't implemented financials
      growth: `+8%`,
      icon: DollarSign,
      color: "from-emerald-600/20 to-green-600/10 border-emerald-500/30 text-emerald-400",
      iconBg: "bg-emerald-950 text-emerald-400 border border-emerald-700/50",
    },
    {
      title: "Horas Registradas",
      value: formatHours(342.5), // Static for now
      growth: `+15%`,
      icon: Clock,
      color: "from-amber-600/20 to-orange-600/10 border-amber-500/30 text-amber-400",
      iconBg: "bg-amber-950 text-amber-400 border border-amber-700/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-gradient-to-b bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-md group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" />
                {card.growth} vs el mes pasado
              </span>
            </div>

            <div className="mt-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                {card.value}
              </h3>
            </div>

            {/* Sparkline Visual Bar */}
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/50 flex items-center gap-1">
              {[40, 65, 45, 80, 55, 90, 75, 100].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-indigo-500/30 group-hover:bg-indigo-500/60 rounded-full transition-all duration-300"
                  style={{ height: `${h * 0.16}px` }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
