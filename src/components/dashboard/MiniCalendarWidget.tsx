"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export const MiniCalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const daysHeader = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

  // Generar cuadrícula dinámica del mes
  const generateDaysGrid = () => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Obtener el día de la semana para el primer día (0 = Domingo, 1 = Lunes...)
    // Lo convertimos a 0 = Lunes, 6 = Domingo
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const daysInCurrentMonth = lastDayOfMonth.getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const grid = [];

    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      grid.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      grid.push({
        day,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Completar el resto de la cuadrícula con días del mes siguiente (hasta 35 o 42 casillas)
    const totalCells = grid.length > 35 ? 42 : 35;
    const remainingCells = totalCells - grid.length;
    for (let day = 1; day <= remainingCells; day++) {
      grid.push({
        day,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return grid;
  };

  const daysGrid = generateDaysGrid();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-500" />
          Calendario Real
        </h3>
        <button
          onClick={goToToday}
          className="text-xs text-indigo-500 hover:text-indigo-400 font-bold transition-colors bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20"
        >
          Hoy
        </button>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-wide">
          {monthNames[month]} {year}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            title="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            title="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
        {daysHeader.map((d, i) => (
          <span key={i} className="font-bold text-slate-400 dark:text-slate-500 py-1">
            {d}
          </span>
        ))}
        {daysGrid.map((item, i) => (
          <div
            key={i}
            className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
              item.isToday
                ? "bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/40 ring-2 ring-indigo-400/50"
                : item.isCurrentMonth
                ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer font-semibold"
                : "text-slate-400 dark:text-slate-600"
            }`}
          >
            {item.day}
          </div>
        ))}
      </div>
    </div>
  );
};
