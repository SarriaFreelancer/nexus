"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Briefcase } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { getFullCalendarEvents } from "@/core/application/actions/dashboardActions";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  projectName: string;
  color: string;
  status: string;
}

export const FullCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load events for the current month
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const res = await getFullCalendarEvents(currentDate.getMonth(), currentDate.getFullYear());
      if (res.success && res.data) {
        setEvents(res.data);
      }
      setLoading(false);
    };
    fetchEvents();
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Generate grid for month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = new Date(monthStart);
  
  // Adjust to start on Monday (0 = Lunes, 6 = Domingo)
  let startDayOfWeek = getDay(startDate) - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  // Add padding days from previous month
  const gridStart = new Date(startDate);
  gridStart.setDate(startDate.getDate() - startDayOfWeek);

  const gridEnd = new Date(monthEnd);
  let endDayOfWeek = getDay(gridEnd) - 1;
  if (endDayOfWeek === -1) endDayOfWeek = 6;
  gridEnd.setDate(gridEnd.getDate() + (6 - endDayOfWeek));

  const daysGrid = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="bg-white dark:bg-[#0f1424] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-full min-h-[700px]">
      {/* Calendar Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
            <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 capitalize">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Gestión de tiempos y entregas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={goToToday}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Hoy
          </button>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button 
              onClick={prevMonth}
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-[#0b0e1a] text-slate-600 dark:text-slate-400 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-[#0b0e1a] text-slate-600 dark:text-slate-400 transition-colors shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] bg-slate-50 dark:bg-[#0b0e1a]">
        {/* Days Header */}
        {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day) => (
          <div key={day} className="py-4 text-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1424]">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{day}</span>
          </div>
        ))}

        {/* Days Cells */}
        {daysGrid.map((day, idx) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, new Date());
          const dayEvents = events.filter(evt => isSameDay(new Date(evt.date), day));

          return (
            <div 
              key={idx} 
              className={`min-h-[120px] p-2 border-b border-r border-slate-100 dark:border-slate-800 transition-colors ${
                !isCurrentMonth ? "bg-slate-50/50 dark:bg-[#0b0e1a]/50" : "bg-white dark:bg-[#0f1424] hover:bg-slate-50 dark:hover:bg-slate-800/30"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                    : isCurrentMonth 
                      ? "text-slate-700 dark:text-slate-300" 
                      : "text-slate-400 dark:text-slate-600"
                }`}>
                  {format(day, "d")}
                </span>
                
                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Events List for this day */}
              <div className="space-y-1.5 overflow-y-auto max-h-[80px] scrollbar-thin">
                {loading ? (
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded w-3/4 mx-auto mt-2"></div>
                ) : (
                  dayEvents.map(evt => (
                    <div 
                      key={evt.id} 
                      className="px-2 py-1.5 rounded-md text-[10px] font-bold border flex flex-col gap-0.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer truncate"
                      style={{ 
                        backgroundColor: `${evt.color}15`, 
                        borderColor: `${evt.color}30`,
                        color: evt.color
                      }}
                      title={`${evt.title} - ${evt.projectName}`}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 opacity-70 shrink-0" />
                        <span className="truncate">{format(new Date(evt.date), "HH:mm")}</span>
                      </div>
                      <span className="truncate text-slate-800 dark:text-slate-200">{evt.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
