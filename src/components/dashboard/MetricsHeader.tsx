"use client";

import React from "react";
import { formatCurrency, formatHours } from "@/lib/utils";
import { FolderKanban, CheckSquare, Users, DollarSign, Clock, ArrowUpRight } from "lucide-react";

export const MetricsHeader: React.FC<{ metrics: any }> = ({ metrics }) => {
  const cards = [
    {
      title: "Proyectos Activos",
      value: metrics.activeProjects ?? 0,
      growth: "+12%",
      icon: FolderKanban,
      iconBg: "bg-[#6366f1]",
      strokeColor: "#6366f1",
      fillGradId: "grad-purple",
      points: "M0 32 Q 20 18, 40 28 T 80 12 T 120 26 T 160 14",
      areaPath: "M0 32 Q 20 18, 40 28 T 80 12 T 120 26 T 160 14 L 160 40 L 0 40 Z",
      dots: [
        { cx: 40, cy: 28 },
        { cx: 80, cy: 12 },
        { cx: 160, cy: 14 },
      ],
    },
    {
      title: "Tareas en Proceso",
      value: (metrics.totalTasks ?? 0) - (metrics.completedTasks ?? 0) || 0,
      growth: "+5%",
      icon: CheckSquare,
      iconBg: "bg-[#3b82f6]",
      strokeColor: "#3b82f6",
      fillGradId: "grad-blue",
      points: "M0 30 Q 20 34, 40 18 T 80 28 T 120 14 T 160 22",
      areaPath: "M0 30 Q 20 34, 40 18 T 80 28 T 120 14 T 160 22 L 160 40 L 0 40 Z",
      dots: [
        { cx: 40, cy: 18 },
        { cx: 80, cy: 28 },
        { cx: 120, cy: 14 },
      ],
    },
    {
      title: "Clientes Activos",
      value: metrics.totalClients ?? 0,
      growth: "+18%",
      icon: Users,
      iconBg: "bg-[#10b981]",
      strokeColor: "#10b981",
      fillGradId: "grad-green",
      points: "M0 35 Q 20 32, 40 22 T 80 14 T 120 26 T 160 18",
      areaPath: "M0 35 Q 20 32, 40 22 T 80 14 T 120 26 T 160 18 L 160 40 L 0 40 Z",
      dots: [
        { cx: 40, cy: 22 },
        { cx: 80, cy: 14 },
        { cx: 160, cy: 18 },
      ],
    },
    {
      title: "Ingresos (Aprobados)",
      value: formatCurrency(metrics.totalIncome || 0),
      growth: "+7%",
      icon: DollarSign,
      iconBg: "bg-[#0d9488]",
      strokeColor: "#0d9488",
      fillGradId: "grad-teal",
      points: "M0 30 Q 20 18, 40 28 T 80 16 T 120 24 T 160 20",
      areaPath: "M0 30 Q 20 18, 40 28 T 80 16 T 120 24 T 160 20 L 160 40 L 0 40 Z",
      dots: [
        { cx: 40, cy: 28 },
        { cx: 80, cy: 16 },
        { cx: 160, cy: 20 },
      ],
    },
    {
      title: "Horas Registradas",
      value: formatHours(metrics.totalLoggedHours || 0),
      growth: "+8%",
      icon: Clock,
      iconBg: "bg-[#f97316]",
      strokeColor: "#f97316",
      fillGradId: "grad-orange",
      points: "M0 32 Q 20 34, 40 20 T 80 30 T 120 18 T 160 24",
      areaPath: "M0 32 Q 20 34, 40 20 T 80 30 T 120 18 T 160 24 L 160 40 L 0 40 Z",
      dots: [
        { cx: 40, cy: 20 },
        { cx: 80, cy: 30 },
        { cx: 120, cy: 18 },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden relative group"
          >
            {/* Top Row: Icon + Value */}
            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 rounded-xl ${card.iconBg} text-white flex items-center justify-center shadow-sm shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{card.title}</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                  {card.value}
                </h3>
              </div>
            </div>

            {/* Growth Subtitle */}
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-500">
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
              <span>{card.growth}</span>
              <span className="text-slate-400 font-normal text-[11px] ml-0.5">vs. mes pasado</span>
            </div>

            {/* Bottom Smooth Curved Area Sparkline */}
            <div className="mt-3 -mx-5 -mb-5 pt-1 overflow-hidden">
              <svg viewBox="0 0 160 40" className="w-full h-10 overflow-visible" fill="none" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={card.fillGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={card.strokeColor} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={card.strokeColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area Gradient Fill */}
                <path d={card.areaPath} fill={`url(#${card.fillGradId})`} />
                {/* Line Curve */}
                <path d={card.points} stroke={card.strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                {/* Peak Dots */}
                {card.dots.map((dot, dIdx) => (
                  <circle
                    key={dIdx}
                    cx={dot.cx}
                    cy={dot.cy}
                    r="3"
                    fill={card.strokeColor}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};
