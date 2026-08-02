"use client";

import React, { useState } from "react";
import { Settings, ShieldCheck, Users, Lock, Key, Server, Database, Trash2, DatabaseBackup, Loader2, Compass } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { seedTestData, clearTestData } from "@/core/application/actions/seedActions";

export default function ConfiguracionPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setMessage(null);
    const result = await seedTestData();
    setMessage({ type: result.success ? "success" : "error", text: result.message || result.error || "Semilla ejecutada" });
    setIsSeeding(false);
  };

  const handleClear = async () => {
    if (!window.confirm("¿Estás seguro de eliminar todos los datos? Esta acción es irreversible.")) return;
    setIsClearing(true);
    setMessage(null);
    const result = await clearTestData();
    setMessage({ type: result.success ? "success" : "error", text: result.error || "Datos limpiados correctamente" });
    setIsClearing(false);
  };

  const roles = [
    { role: "Super Administrador", count: 1, access: "Acceso Total Global" },
    { role: "Administrador Workspace", count: 2, access: "Gestión de Usuarios, CRM e Infra" },
    { role: "Manager / Lead", count: 4, access: "Creación de Proyectos y Tareas" },
    { role: "Desarrollador", count: 12, access: "Kanban, Git Repos y Deploys" },
    { role: "Diseñador UX/UI", count: 5, access: "Kanban y Figma Specs" },
    { role: "QA Engineer", count: 4, access: "Testing y Reporte de Bugs" },
    { role: "Comercial", count: 3, access: "CRM Pipeline y Cotizaciones" },
    { role: "Cliente Invitado", count: 8, access: "Vista de Progreso en Solo Lectura" },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-400" /> Configuración & Matriz RBAC / ABAC
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Administración de roles dinámicos, aislamiento multi-tenant y claves API del Workspace.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-xl md:col-span-2">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-400" /> Matriz de Permisos por Rol
          </h3>

          <div className="space-y-2.5 pt-2">
            {roles.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{r.role}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{r.access}</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  {r.count} usuarios
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-400" /> Multi-Tenant Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Workspace Tenant ID</span>
                <p className="font-mono font-bold text-indigo-400 truncate">ws_sarriatech_prod_9981</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Base de Datos ORM</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Prisma (MySQL / Postgres ready)</p>
              </div>
            </div>
          </div>

          {/* Super Admin Actions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-red-900/30 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2 text-red-400">
              <Lock className="h-4 w-4" /> Zona Peligrosa (Super Admin)
            </h3>
            
            {message && (
              <div className={`p-3 rounded-lg text-xs font-medium border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {message.text}
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={() => {
                  localStorage.removeItem("hasSeenTour");
                  Object.keys(localStorage).forEach(k => {
                    if (k.startsWith("hasSeenTour")) localStorage.removeItem(k);
                  });
                  window.dispatchEvent(new Event("relaunch-tour"));
                  setMessage({ type: "success", text: "¡Tour Guiado relanzado con éxito! Se iniciará en unos segundos." });
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-600/20 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                Relanzar Tour Guiado
              </button>

              <button 
                onClick={handleSeed}
                disabled={isSeeding || isClearing}
                className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium py-2 px-4 rounded-xl transition-all border border-slate-300 dark:border-slate-700 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <DatabaseBackup className="w-4 h-4" />}
                Poblar con Datos de Prueba
              </button>
              
              <button 
                onClick={handleClear}
                disabled={isSeeding || isClearing}
                className="w-full bg-red-950/40 hover:bg-red-900/60 text-red-400 font-medium py-2 px-4 rounded-xl transition-all border border-red-900/50 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Limpiar Sistema por Completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
