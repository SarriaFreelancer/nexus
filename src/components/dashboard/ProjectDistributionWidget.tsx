"use client";

import React from "react";
import { PieChart } from "lucide-react";

interface ProjectDistributionWidgetProps {
  data?: any[];
}

export const ProjectDistributionWidget: React.FC<ProjectDistributionWidgetProps> = ({ data = [] }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  // We need to calculate cumulative percentages to position the segments correctly in the SVG
  let currentOffset = 0;
  const segments = data.map((item) => {
    const percentage = item.percentage || 0;
    const segment = {
      ...item,
      offset: currentOffset
    };
    currentOffset += percentage;
    return segment;
  });

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <PieChart className="h-4 w-4 text-indigo-400" /> Distribución de Proyectos
        </h3>
        <select className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-500 dark:text-slate-400 focus:outline-none">
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
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Dynamic Segments */}
            {segments.map((item, idx) => (
              <path
                key={idx}
                strokeWidth="4"
                strokeDasharray={`${item.percentage}, 100`}
                strokeDashoffset={`-${item.offset}`}
                stroke={item.color}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                className="transition-all duration-1000 ease-out"
              />
            ))}
          </svg>
          <div className="absolute text-center">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{total}</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Total</p>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-4 flex-1">
          {segments.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 dark:text-slate-500 font-mono">{item.count}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 min-w-[35px] text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
