import React, { useState } from "react";
import { createClient } from "@/core/application/actions/clientActions";

export function CreateClientForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      company: formData.get("company") as string,
      contactName: formData.get("contactName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      stage: formData.get("stage") as string,
    };

    try {
      const res = await createClient(data as any);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Error al crear cliente");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      {error && <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl">{error}</div>}
      
      <div className="space-y-1.5">
        <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Empresa</label>
        <input required name="company" type="text" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" placeholder="Ej: Acme Corp" />
      </div>

      <div className="space-y-1.5">
        <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Nombre de Contacto</label>
        <input required name="contactName" type="text" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" placeholder="Ej: John Doe" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Email</label>
          <input required name="email" type="email" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" placeholder="john@acme.com" />
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Teléfono</label>
          <input name="phone" type="text" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" placeholder="+1 234 567" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Etapa Comercial</label>
        <select name="stage" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none">
          <option value="Lead">Lead</option>
          <option value="Contactado">Contactado</option>
          <option value="Propuesta">Propuesta</option>
          <option value="Negociación">Negociación</option>
          <option value="Ganado">Ganado</option>
        </select>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50">
          {loading ? "Guardando..." : "Crear Lead"}
        </button>
      </div>
    </form>
  );
}
