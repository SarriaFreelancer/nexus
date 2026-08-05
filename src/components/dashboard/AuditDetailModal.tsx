"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { ArrowRight, Globe, Laptop, MapPin, CheckCircle2 } from "lucide-react";

interface AuditDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any;
}

export function AuditDetailModal({ isOpen, onClose, log }: AuditDetailModalProps) {
  if (!log) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Evento de Auditoría">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          {log.user.avatarUrl ? (
            <img src={log.user.avatarUrl} alt={log.user.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl ring-2 ring-indigo-500/20 shrink-0">
              {log.user.name ? log.user.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{log.user.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{log.user.email}</p>
          </div>
          <div className="ml-auto text-right">
            <span className="inline-block px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-500/20 uppercase">
              {log.action.replace(/_/g, " ")}
            </span>
            <p className="text-xs text-slate-400 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
          </div>
        </div>

        {/* Geo & Network Data */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white dark:bg-[#0b0e1a] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Globe className="w-3.5 h-3.5 text-blue-400" /> Dirección IP
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{log.details?.ip || "N/A"}</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-[#0b0e1a] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-400" /> Ubicación
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={log.details?.city}>{log.details?.city || "N/A"}</span>
          </div>
          <div className="col-span-2 p-3 rounded-xl bg-white dark:bg-[#0b0e1a] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Laptop className="w-3.5 h-3.5 text-emerald-400" /> Dispositivo
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 break-words">{log.details?.browser || "N/A"}</span>
          </div>
        </div>

        {/* Diff Viewer (Antes y Después) */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            Cambios Realizados
          </h4>
          
          <div className="flex flex-col md:flex-row items-stretch gap-4">
            {/* Antes */}
            <div className="flex-1 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 overflow-hidden flex flex-col">
              <div className="px-3 py-2 bg-rose-100/50 dark:bg-rose-900/30 border-b border-rose-100 dark:border-rose-900/30 text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Estado Anterior (Antes)
              </div>
              <div className="p-3 flex-1 overflow-auto">
                <pre className="text-[11px] text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap">
                  {log.details?.before ? JSON.stringify(log.details.before, null, 2) : "Sin datos previos"}
                </pre>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center text-slate-300 dark:text-slate-700">
              <ArrowRight className="w-5 h-5" />
            </div>

            {/* Después */}
            <div className="flex-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 overflow-hidden flex flex-col">
              <div className="px-3 py-2 bg-emerald-100/50 dark:bg-emerald-900/30 border-b border-emerald-100 dark:border-emerald-900/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Estado Nuevo (Después)
              </div>
              <div className="p-3 flex-1 overflow-auto">
                <pre className="text-[11px] text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap">
                  {log.details?.after ? JSON.stringify(log.details.after, null, 2) : "Sin cambios nuevos"}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" /> Entendido
          </button>
        </div>
      </div>
    </Modal>
  );
}
