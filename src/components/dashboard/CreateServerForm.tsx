import React, { useState, useEffect } from "react";
import { createServer } from "@/core/application/actions/serverActions";
import { getProjects } from "@/core/application/actions/projectActions";

export function CreateServerForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    getProjects().then(res => {
      if (res.success && res.data) setProjects(res.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      projectId: formData.get("projectId") as string || undefined,
      name: formData.get("name") as string,
      ipAddress: formData.get("ipAddress") as string,
      provider: formData.get("provider") as string,
      status: formData.get("status") as string,
    };

    try {
      const res = await createServer(data as any);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Error al registrar servidor");
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
        <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Nombre del Servidor</label>
        <input required name="name" type="text" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" placeholder="Ej: Prod-DB-01" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Dirección IP / Host</label>
          <input required name="ipAddress" type="text" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" placeholder="192.168.1.1" />
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Proveedor</label>
          <select name="provider" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none">
            <option value="AWS">AWS</option>
            <option value="Azure">Azure</option>
            <option value="GCP">GCP</option>
            <option value="DigitalOcean">DigitalOcean</option>
            <option value="Vercel">Vercel</option>
            <option value="On-Premise">On-Premise</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Asignar a Proyecto (Opcional)</label>
        <select name="projectId" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none">
          <option value="">Ninguno / Global</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Estado Inicial</label>
        <select name="status" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none">
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
          <option value="MAINTENANCE">En Mantenimiento</option>
          <option value="WARNING">Warning</option>
        </select>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50">
          {loading ? "Guardando..." : "Registrar Servidor"}
        </button>
      </div>
    </form>
  );
}
