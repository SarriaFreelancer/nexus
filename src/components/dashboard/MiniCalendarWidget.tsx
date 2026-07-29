"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const MiniCalendarWidget: React.FC = () => {
  const daysHeader = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
  const daysGrid = [
    { day: 28, isCurrentMonth: false },
    { day: 29, isCurrentMonth: false },
    { day: 30, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true, isSelected: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 31, isCurrentMonth: true },
    { day: 1, isCurrentMonth: false },
  ];

  return (
    <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-100">Calendario</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Ver calendario
        </button>
      </div>

      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-slate-200">Mayo 2025</span>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
        {daysHeader.map((d, i) => (
          <span key={i} className="font-semibold text-slate-500 py-1">
            {d}
          </span>
        ))}
        {daysGrid.map((item, i) => (
          <div
            key={i}
            className={`py-1.5 rounded-lg font-medium transition-all ${
              item.isSelected
                ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/40"
                : item.isCurrentMonth
                ? "text-slate-300 hover:bg-slate-800/80 cursor-pointer"
                : "text-slate-600"
            }`}
          >
            {item.day}
          </div>
        ))}
      </div>
    </div>
  );
};
