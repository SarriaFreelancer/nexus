"use client";

import React from "react";
import { FileText, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export default function CotizacionesPage() {
  const quotes = [
    { code: "COT-101", client: "Logística Global S.A.", project: "Inventario Pro Módulo 2", amount: 6500, date: "26 Mayo 2025", status: "Aprobada" },
    { code: "COT-102", client: "Grupo Inmobiliario Alfa", project: "CRM Inmobiliaria Enterprise", amount: 22000, date: "22 Mayo 2025", status: "En Revisión" },
    { code: "COT-103", client: "Constructora Horizon", project: "Landing Page & WebGL 3D", amount: 4800, date: "18 Mayo 2025", status: "Aprobada" },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" /> Cotizaciones & Contratos
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Generación de propuestas comerciales, estimaciones de horas e hitos de pago.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all">
          <Plus className="h-4 w-4" /> Nueva Cotización
        </button>
      </div>

      <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 space-y-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Código</th>
                <th className="pb-3 font-semibold">Cliente</th>
                <th className="pb-3 font-semibold">Proyecto</th>
                <th className="pb-3 font-semibold">Fecha</th>
                <th className="pb-3 font-semibold text-right">Monto</th>
                <th className="pb-3 font-semibold text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {quotes.map((q, i) => (
                <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 font-bold text-indigo-400">{q.code}</td>
                  <td className="py-3 font-semibold text-slate-200">{q.client}</td>
                  <td className="py-3 text-slate-400">{q.project}</td>
                  <td className="py-3 text-slate-400">{q.date}</td>
                  <td className="py-3 text-right font-extrabold text-emerald-400">{formatCurrency(q.amount)}</td>
                  <td className="py-3 text-right">
                    <Badge variant={q.status === "Aprobada" ? "emerald" : "amber"}>{q.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
