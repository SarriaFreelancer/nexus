"use client";

import React, { useState } from "react";
import { DollarSign, ArrowUpRight, ArrowDownRight, Plus, Edit2, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { FinanceRecordForm } from "@/components/dashboard/FinanceRecordForm";
import { deleteFinancialRecord } from "@/core/application/actions/financialActions";

export function FinanzasClient({ records }: { records: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [defaultType, setDefaultType] = useState<"INCOME" | "EXPENSE">("INCOME");

  const income = records.filter(r => r.type === "INCOME").reduce((acc, curr) => acc + curr.amount, 0);
  const expenses = records.filter(r => r.type === "EXPENSE").reduce((acc, curr) => acc + curr.amount, 0);
  const net = income - expenses;

  const handleCreate = (type: "INCOME" | "EXPENSE") => {
    setDefaultType(type);
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
      await deleteFinancialRecord(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" /> Finanzas & Rentabilidad
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Control de ingresos, costos operativos, horas facturadas y utilidad por proyecto.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleCreate("INCOME")} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm rounded-xl transition-colors border border-emerald-500/20">
            <Plus className="h-4 w-4" /> Nuevo Ingreso
          </button>
          <button onClick={() => handleCreate("EXPENSE")} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-sm rounded-xl transition-colors border border-rose-500/20">
            <Plus className="h-4 w-4" /> Nuevo Gasto
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-lg">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ingresos Totales</span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-emerald-400">{formatCurrency(income)}</h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-800">
              <ArrowUpRight className="h-3 w-3" /> +0%
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-lg">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Costos Operativos</span>
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
                <th className="pb-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-100 dark:hover:bg-slate-900/40 transition-colors group">
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{rec.description || 'N/A'}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{rec.category}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{new Date(rec.date).toLocaleDateString()}</td>
                  <td className={`py-3 text-right font-bold ${rec.type === "INCOME" ? "text-emerald-400" : "text-rose-400"}`}>
                    {rec.type === "INCOME" ? "+" : "-"} {formatCurrency(rec.amount)}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(rec)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(rec.id)} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 dark:text-slate-500 font-medium">
                    No hay transacciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f1424] w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                {editingRecord ? "Editar Registro" : defaultType === "INCOME" ? "Nuevo Ingreso" : "Nuevo Gasto"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">&times;</button>
            </div>
            <FinanceRecordForm 
              initialData={editingRecord}
              defaultType={defaultType}
              onSuccess={closeModal}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </>
  );
}
