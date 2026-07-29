"use client";

import React from "react";
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function FinanzasPage() {
  const financialRecords = [
    { date: "28 Mayo 2025", desc: "Pago Proyecto GNS SaaS - Fase 2", type: "INCOME", amount: 12500, client: "SarriaTech" },
    { date: "24 Mayo 2025", desc: "Servidores Hetzner Cloud & AWS S3", type: "EXPENSE", amount: 840, client: "Infraestructura" },
    { date: "20 Mayo 2025", desc: "Pago Inventario Pro - Hito 1", type: "INCOME", amount: 8200, client: "Logística Global S.A." },
    { date: "15 Mayo 2025", desc: "Licencias Figma Enterprise & OpenAI API", type: "EXPENSE", amount: 450, client: "Herramientas" },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-400" /> Finanzas & Rentabilidad
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Control de ingresos, costos operativos, horas facturadas y utilidad por proyecto.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 space-y-2 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Ingresos Totales (Mes)</span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-emerald-400">{formatCurrency(24560)}</h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-800">
              <ArrowUpRight className="h-3 w-3" /> +18%
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 space-y-2 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Costos Operativos (Mes)</span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-rose-400">{formatCurrency(4290)}</h3>
            <span className="text-xs font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-800">
              <ArrowDownRight className="h-3 w-3" /> -4%
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 space-y-2 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Utilidad Neta (Margin 82%)</span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-indigo-400">{formatCurrency(20270)}</h3>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-800">
              <ArrowUpRight className="h-3 w-3" /> +22%
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100">Transacciones Recientes</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Concepto</th>
                <th className="pb-3 font-semibold">Cliente / Categoría</th>
                <th className="pb-3 font-semibold">Fecha</th>
                <th className="pb-3 font-semibold text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {financialRecords.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 font-semibold text-slate-200">{rec.desc}</td>
                  <td className="py-3 text-slate-400">{rec.client}</td>
                  <td className="py-3 text-slate-400">{rec.date}</td>
                  <td
                    className={`py-3 text-right font-bold ${
                      rec.type === "INCOME" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {rec.type === "INCOME" ? "+" : "-"} {formatCurrency(rec.amount)}
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
