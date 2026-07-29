"use client";

import React, { useState } from "react";
import { Zap, Plus, Loader2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { createProjectAutomation, toggleAutomation, deleteAutomation } from "@/core/application/actions/automationActions";

export function ProjectAutomationsTab({ projectId, automations, onUpdate }: { projectId: string, automations: any[], onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const trigger = formData.get("trigger") as string;
    const action = formData.get("action") as string;
    const conditionValue = formData.get("conditionValue") as string;

    let condition = null;
    if (trigger === "TASK_STATUS_CHANGED" && conditionValue) {
      condition = { to: conditionValue };
    }

    try {
      const res = await createProjectAutomation({
        projectId,
        name: formData.get("name"),
        trigger,
        condition,
        action,
        actionData: {}, // Expandible en el futuro
      });

      if (res.success) {
        setIsCreating(false);
        onUpdate();
      } else {
        setError(res.error || "Error al crear automatización");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    const res = await toggleAutomation(id, !current);
    if (res.success) onUpdate();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Seguro que deseas eliminar esta regla?")) {
      const res = await deleteAutomation(id);
      if (res.success) onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" /> Reglas de Automatización
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configura acciones automáticas basadas en eventos del proyecto.</p>
        </div>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20">
            <Plus className="w-4 h-4" /> Nueva Regla
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {isCreating && (
        <form onSubmit={handleCreate} className="p-5 rounded-2xl bg-slate-50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/80 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nombre de la Regla</label>
            <input required name="name" type="text" placeholder="Ej: Auto-Completar Proyecto" className="w-full mt-1.5 bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">CUANDO (Disparador)</label>
              <select required name="trigger" className="w-full mt-1.5 bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all">
                <option value="TASK_STATUS_CHANGED">Una tarea cambie de estado a...</option>
                <option value="NEW_PROJECT_VERSION">Se cree una nueva versión</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Condición del Disparador</label>
              <select name="conditionValue" className="w-full mt-1.5 bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all">
                <option value="TESTING">TESTING (En Pruebas)</option>
                <option value="PRODUCTION">PRODUCTION (Producción)</option>
                <option value="DEPLOYING">DEPLOYING (Desplegando)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ENTONCES (Acción)</label>
            <select required name="action" className="w-full mt-1.5 bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-slate-800/60 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all">
              <option value="CHANGE_PROJECT_STATUS_TESTING">Cambiar estado del proyecto a EN PRUEBAS</option>
              <option value="CHANGE_PROJECT_STATUS_DEPLOYED">Cambiar estado del proyecto a EN PRODUCCIÓN</option>
              <option value="SEND_NOTIFICATION">Enviar Notificación al equipo</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50">
              {loading && <Loader2 className="w-3 h-3 animate-spin" />} Guardar Regla
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {automations.length === 0 && !isCreating ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-[#13182b] border border-slate-200 dark:border-slate-800/60 rounded-2xl border-dashed">
            <Zap className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No hay reglas configuradas</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Automatiza el flujo de trabajo añadiendo tu primera regla.</p>
          </div>
        ) : (
          automations.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-slate-800/60 rounded-xl shadow-sm hover:border-indigo-500/30 transition-colors">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  {rule.name}
                  {rule.isActive && <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Activa</span>}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">CUANDO:</span> {rule.trigger} {rule.condition ? `(${JSON.stringify(rule.condition)})` : ""} 
                  <span className="mx-2 text-slate-300 dark:text-slate-700">|</span> 
                  <span className="font-semibold text-slate-600 dark:text-slate-300">ENTONCES:</span> {rule.action}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={rule.isActive} onChange={() => handleToggle(rule.id, rule.isActive)} />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <button onClick={() => handleDelete(rule.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
