"use client";

import React, { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, ChevronDown } from "lucide-react";

export function DashboardDateSelector({ selectedDate }: { selectedDate?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Default to today if not provided or parse provided date
  const parseDate = (dStr?: string) => {
    if (!dStr) return new Date();
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const currentDate = parseDate(selectedDate);
  const isToday = new Date().toDateString() === currentDate.toDateString();

  // Format date text for display e.g. "Hoy, 2 de Agosto" or "2 de Agosto"
  const formattedDateStr = currentDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });

  const displayText = isToday ? `Hoy, ${formattedDateStr}` : formattedDateStr;
  const isoDateValue = currentDate.toISOString().split("T")[0];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set("date", val);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.click()}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all"
      >
        <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span className="capitalize">{displayText}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
      </button>

      {/* Hidden date input for native picker */}
      <input
        ref={dateInputRef}
        type="date"
        value={isoDateValue}
        onChange={handleDateChange}
        className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
      />
    </div>
  );
}
