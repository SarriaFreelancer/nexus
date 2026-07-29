"use client";

import React from "react";
import { BarChart3, Download, FileSpreadsheet, FileText } from "lucide-react";

export default function ReportesPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" /> Reportes & Analítica Enterprise
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Exportación de informes ejecutivos en PDF, Excel y CSV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> Excel
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
            <FileText className="h-4 w-4 text-rose-400" /> PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-xl">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Rendimiento por Desarrollador</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Horas completadas vs estimadas en el sprint actual.</p>
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs"><span>David Sarria</span><span className="font-bold text-indigo-400">142h (104%)</span></div>
            <div className="flex justify-between text-xs"><span>María Gómez</span><span className="font-bold text-indigo-400">118h (98%)</span></div>
            <div className="flex justify-between text-xs"><span>Carlos Ruiz</span><span className="font-bold text-indigo-400">82h (92%)</span></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-xl">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Rentabilidad por Proyecto</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Valor cobrado vs costo de horas invertidas.</p>
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs"><span>GNS SaaS</span><span className="font-bold text-emerald-400">84% Margen</span></div>
            <div className="flex justify-between text-xs"><span>Inventario Pro</span><span className="font-bold text-emerald-400">76% Margen</span></div>
            <div className="flex justify-between text-xs"><span>Landing Constructora</span><span className="font-bold text-emerald-400">88% Margen</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
