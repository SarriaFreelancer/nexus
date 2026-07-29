"use client";

import React from "react";
import { mockProjectsStatusDistribution } from "@/core/infrastructure/mockData";

export const ProjectDistributionWidget: React.FC = () => {
  const total = mockProjectsStatusDistribution.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Resumen de Proyectos</h3>
        </div>
        <select className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-400 focus:outline-none">
          <option>Este mes</option>
          <option>Trimestre</option>
          <option>Año</option>
        </select>
      </div>

      <div className="flex items-center gap-6 my-2">
        {/* SVG Donut Chart */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Segments */}
            <path
              strokeWidth="4"
              strokeDasharray="42.9, 100"
              stroke="#6366f1"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-2xl font-extrabold text-slate-100">{total}</span>
            <p className="text-[10px] text-slate-400 font-medium">Total</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 text-xs">
          {mockProjectsStatusDistribution.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-200">{item.count}</span>
                <span className="text-slate-500 text-[11px] min-w-[36px] text-right">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
