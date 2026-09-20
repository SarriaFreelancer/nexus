"use client";

import React, { useEffect, useState } from "react";
import { 
  DatabaseBackup, 
  Play, 
  Download, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Calendar,
  HardDrive,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { 
  createInstantBackup, 
  getBackupHistory, 
  updateBackupSchedule, 
  deleteBackupFile, 
  BackupItem 
} from "@/core/application/actions/backupActions";

export function DatabaseBackupManager() {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [schedule, setSchedule] = useState<"DAILY" | "WEEKLY" | "DISABLED">("DISABLED");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadBackups() {
    setLoading(true);
    try {
      const res = await getBackupHistory();
      if (res.success) {
        setBackups(res.backups);
        if (res.schedule === "DAILY" || res.schedule === "WEEKLY" || res.schedule === "DISABLED") {
          setSchedule(res.schedule);
        }
      } else {
        setMessage({ type: "error", text: res.error || "No se pudieron cargar los respaldos" });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Error al cargar historial" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBackups();
  }, []);

  const handleCreateInstant = async () => {
    setIsCreating(true);
    setMessage(null);
    try {
      const res = await createInstantBackup();
      if (res.success) {
        setMessage({ type: "success", text: res.message || "Backup de base de datos generado con éxito." });
        loadBackups();
      } else {
        setMessage({ type: "error", text: res.error || "Fallo al crear respaldo." });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Error inesperado" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleScheduleChange = async (newSchedule: "DAILY" | "WEEKLY" | "DISABLED") => {
    setIsUpdatingSchedule(true);
    setMessage(null);
    try {
      const res = await updateBackupSchedule(newSchedule);
      if (res.success) {
        setSchedule(newSchedule);
        setMessage({ 
          type: "success", 
          text: newSchedule === "DISABLED" 
            ? "Programación de respaldos desactivada." 
            : `Frecuencia de respaldo automático guardada: ${newSchedule === "DAILY" ? "Diario" : "Semanal"}.`
        });
      } else {
        setMessage({ type: "error", text: res.error || "Error al actualizar programación" });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el archivo de respaldo "${filename}"?`)) return;
    try {
      const res = await deleteBackupFile(filename);
      if (res.success) {
        setMessage({ type: "success", text: "Archivo de respaldo eliminado." });
        loadBackups();
      } else {
        setMessage({ type: "error", text: res.error || "No se pudo eliminar el archivo." });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <DatabaseBackup className="h-4 w-4 text-indigo-500" /> Respaldos de Base de Datos (Backups)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Genera copias de seguridad inmediatas ("Justo ahora"), programa respaldos periódicos y descarga archivos `.json / .sql`.
          </p>
        </div>

        {/* Action Button: Instant Backup Now */}
        <button
          onClick={handleCreateInstant}
          disabled={isCreating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generando Backup...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Ejecutar Backup Ahora (Justo ahora)</span>
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${
          message.type === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" 
            : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Programación Frecuente (Diario, Semanal, Desactivado) */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" /> Programación de Respaldos Automáticos
          </span>
          {isUpdatingSchedule && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleScheduleChange("DAILY")}
            disabled={isUpdatingSchedule}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              schedule === "DAILY"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30"
                : "bg-white dark:bg-[#0f1424] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Diario (24h)</span>
          </button>

          <button
            type="button"
            onClick={() => handleScheduleChange("WEEKLY")}
            disabled={isUpdatingSchedule}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              schedule === "WEEKLY"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30"
                : "bg-white dark:bg-[#0f1424] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Semanal (7d)</span>
          </button>

          <button
            type="button"
            onClick={() => handleScheduleChange("DISABLED")}
            disabled={isUpdatingSchedule}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              schedule === "DISABLED"
                ? "bg-slate-700 text-white border-slate-700 shadow-md"
                : "bg-white dark:bg-[#0f1424] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400"
            }`}
          >
            <span>Desactivado</span>
          </button>
        </div>
      </div>

      {/* Historial de Respaldos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" /> Historial de Respaldos Almacenados
          </h4>
          <button
            onClick={loadBackups}
            className="text-[11px] font-bold text-indigo-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refrescar</span>
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Cargando archivos de respaldo...</span>
          </div>
        ) : backups.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            No hay respaldos generados aún. Haz clic en "Ejecutar Backup Ahora" para crear la primera copia.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {backups.map((b) => (
              <div
                key={b.filename}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 truncate">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                      {b.filename}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(b.createdAt).toLocaleString()} · <strong className="text-indigo-400">{b.sizeFormatted}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={b.downloadUrl}
                    download={b.filename}
                    className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                    title="Descargar respaldo"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(b.filename)}
                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                    title="Eliminar respaldo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
