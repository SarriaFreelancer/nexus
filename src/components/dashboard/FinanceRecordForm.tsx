"use client";

import React, { useState } from "react";
import { createFinancialRecord, updateFinancialRecord } from "@/core/application/actions/financialActions";
import { Loader2 } from "lucide-react";

interface FinanceRecordFormProps {
  initialData?: any;
  defaultType?: "INCOME" | "EXPENSE";
  onSuccess: () => void;
  onCancel: () => void;
}

export function FinanceRecordForm({ initialData, defaultType = "INCOME", onSuccess, onCancel }: FinanceRecordFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      type: formData.get("type") as string,
      amount: Number(formData.get("amount")),
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
    };

    try {
      let res;
      if (isEditing) {
        res = await updateFinancialRecord(initialData.id, data);
      } else {
        res = await createFinancialRecord(data);
      }

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Error al guardar el registro");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const defaultDate = initialData?.date 
    ? new Date(initialData.date).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      {error && <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl">{error}</div>}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Tipo de Movimiento</label>
          <select name="type" defaultValue={initialData?.type || defaultType} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none">
            <option value="INCOME">Ingreso (+)</option>
            <option value="EXPENSE">Gasto (-)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Fecha</label>
          <input required name="date" type="date" defaultValue={defaultDate} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Concepto / Descripción</label>
        <input required name="description" type="text" defaultValue={initialData?.description || ""} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" placeholder="Ej: Pago de Hito 1 - Proyecto X" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Categoría</label>
          <select name="category" defaultValue={initialData?.category || "Servicios"} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none">
            <option value="Servicios">Servicios (Desarrollo, Diseño, etc)</option>
            <option value="Licencias">Licencias y Software</option>
            <option value="Infraestructura">Infraestructura (Servidores, Dominio)</option>
            <option value="Nómina">Nómina / Honorarios</option>
            <option value="Impuestos">Impuestos</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Monto (USD)</label>
          <input required name="amount" type="number" step="0.01" min="0" defaultValue={initialData?.amount || ""} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" placeholder="0.00" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? "Guardar Cambios" : "Crear Registro"}
        </button>
      </div>
    </form>
  );
}
