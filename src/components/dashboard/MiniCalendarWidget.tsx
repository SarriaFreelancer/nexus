"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO string
  projectName: string;
  color: string;
  status: string;
}

interface MiniCalendarWidgetProps {
  events?: CalendarEvent[];
}

export const MiniCalendarWidget: React.FC<MiniCalendarWidgetProps> = ({ events = [] }) => {
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Calendario de Eventos
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-2 py-1 rounded-md transition-colors"
          >
            Hoy
          </button>
          <div className="flex items-center gap-0.5">
            <button
              onClick={prevMonth}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Label */}
      <div className="mb-4">
        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
          {monthNames[month]} {year}
        </span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center mb-6">
        {daysHeader.map((d, i) => (
          <span key={i} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pb-1">
            {d}
          </span>
        ))}
        {daysGrid.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-center h-7 w-7 mx-auto rounded-full text-xs font-semibold transition-all ${
              item.isToday
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                : item.isCurrentMonth
                ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                : "text-slate-300 dark:text-slate-600"
            }`}
          >
            {item.day}
          </div>
        ))}
      </div>

      {/* Today's Events List */}
      <div className="flex-1 space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">No hay tareas pendientes.</p>
          </div>
        ) : (
          events.map((evt) => {
            const dateObj = new Date(evt.date);
            // Si es hoy, mostramos la hora. Si es otro día, mostramos el día y mes
            const isToday = dateObj.toDateString() === today.toDateString();
            const timeLabel = isToday 
              ? format(dateObj, "hh:mm a") 
              : format(dateObj, "dd MMM", { locale: es });

            return (
              <div key={evt.id} className="flex gap-3">
                <div className="w-16 shrink-0 text-right">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    {timeLabel}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div 
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" 
                    style={{ backgroundColor: evt.color }}
                  ></div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{evt.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{evt.projectName}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
        <Link href="/calendario" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors flex items-center gap-1 group">
          Ver calendario completo
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
};
