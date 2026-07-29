import React from "react";
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getFinancials } from "@/core/application/actions/financialActions";

export default async function FinanzasPage() {
  const result = await getFinancials();
  const financialRecords = result.data || [];

  const income = financialRecords.filter((r: any) => r.type === "INCOME").reduce((acc: any, curr: any) => acc + curr.amount, 0);
  const expenses = financialRecords.filter((r: any) => r.type === "EXPENSE").reduce((acc: any, curr: any) => acc + curr.amount, 0);
  const net = income - expenses;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-400" /> Finanzas & Rentabilidad
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Control de ingresos, costos operativos, horas facturadas y utilidad por proyecto.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-lg">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ingresos Totales (Mes)</span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-emerald-400">{formatCurrency(income)}</h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-800">
              <ArrowUpRight className="h-3 w-3" /> +0%
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-lg">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Costos Operativos (Mes)</span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-rose-400">{formatCurrency(expenses)}</h3>
            <span className="text-xs font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-800">
              <ArrowDownRight className="h-3 w-3" /> -0%
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-lg">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Utilidad Neta</span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-indigo-400">{formatCurrency(net)}</h3>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-800">
              <ArrowUpRight className="h-3 w-3" /> +0%
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Transacciones Recientes</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="pb-3 font-semibold">Concepto</th>
                <th className="pb-3 font-semibold">Categoría</th>
                <th className="pb-3 font-semibold">Fecha</th>
                <th className="pb-3 font-semibold text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {financialRecords.map((rec: any) => (
                <tr key={rec.id} className="hover:bg-slate-100 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{rec.description || 'N/A'}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{rec.category}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{new Date(rec.date).toLocaleDateString()}</td>
                  <td
                    className={`py-3 text-right font-bold ${
                      rec.type === "INCOME" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {rec.type === "INCOME" ? "+" : "-"} {formatCurrency(rec.amount)}
                  </td>
                </tr>
              ))}
              {financialRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 dark:text-slate-500 font-medium">
                    No hay transacciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
