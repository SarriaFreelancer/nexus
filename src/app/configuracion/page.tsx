"use client";

import React from "react";
import { Settings, ShieldCheck, Users, Lock, Key, Server, Database } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function ConfiguracionPage() {
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
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-400" /> Configuración & Matriz RBAC / ABAC
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Administración de roles dinámicos, aislamiento multi-tenant y claves API del Workspace.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 space-y-3 shadow-xl md:col-span-2">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-400" /> Matriz de Permisos por Rol
          </h3>

          <div className="space-y-2.5 pt-2">
            {roles.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">{r.role}</h4>
                  <p className="text-[10px] text-slate-400">{r.access}</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  {r.count} usuarios
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 space-y-4 shadow-xl">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Database className="h-4 w-4 text-indigo-400" /> Multi-Tenant Status
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400">Workspace Tenant ID</span>
              <p className="font-mono font-bold text-indigo-400 truncate">ws_sarriatech_prod_9981</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400">Base de Datos ORM</span>
              <p className="font-semibold text-slate-200">Prisma (MySQL / Postgres ready)</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400">Almacenamiento Aislado</span>
              <p className="font-semibold text-slate-200">Cloudflare R2 / S3 Storage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
