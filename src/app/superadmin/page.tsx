"use client";

import React, { useState, useEffect } from "react";
import { getAllGlobalUsersAndWorkspaces, updateWorkspaceSubscription } from "@/core/application/actions/superadminActions";
import { Modal } from "@/components/ui/Modal";
import { 
  Crown, Users, Building, FolderKanban, ShieldCheck, 
  Sparkles, CheckCircle2, Loader2, Edit3, Settings, ShieldAlert, BadgeCheck
} from "lucide-react";

export default function SuperAdminPage() {
  const [data, setData] = useState<{ users: any[]; workspaces: any[] }>({ users: [], workspaces: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit License Modal
  const [selectedWorkspace, setSelectedWorkspace] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [plan, setPlan] = useState<"FREE" | "BASIC" | "INTERMEDIATE" | "PREMIUM">("FREE");
  const [maxWorkspaces, setMaxWorkspaces] = useState(2);
  const [maxProjects, setMaxProjects] = useState(3);
  const [maxCollaborators, setMaxCollaborators] = useState(5);
  const [savingPlan, setSavingPlan] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await getAllGlobalUsersAndWorkspaces();
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error || "No tienes permisos de SuperAdmin para acceder a esta área.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEditPlan = (ws: any) => {
    setSelectedWorkspace(ws);
    setPlan(ws.subscriptionPlan || "FREE");
    setMaxWorkspaces(ws.maxWorkspaces || 2);
    setMaxProjects(ws.maxProjects || 3);
    setMaxCollaborators(ws.maxCollaborators || 5);
    setIsEditModalOpen(true);
  };

  const handlePlanPresetChange = (newPlan: "FREE" | "BASIC" | "INTERMEDIATE" | "PREMIUM") => {
    setPlan(newPlan);
    switch (newPlan) {
      case "FREE":
        setMaxWorkspaces(2);
        setMaxProjects(3);
        setMaxCollaborators(5);
        break;
      case "BASIC":
        setMaxWorkspaces(5);
        setMaxProjects(10);
        setMaxCollaborators(15);
        break;
      case "INTERMEDIATE":
        setMaxWorkspaces(15);
        setMaxProjects(30);
        setMaxCollaborators(50);
        break;
      case "PREMIUM":
        setMaxWorkspaces(999);
        setMaxProjects(999);
        setMaxCollaborators(999);
        break;
    }
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace) return;
    setSavingPlan(true);

    const res = await updateWorkspaceSubscription(selectedWorkspace.id, {
      subscriptionPlan: plan,
      maxWorkspaces: Number(maxWorkspaces),
      maxProjects: Number(maxProjects),
      maxCollaborators: Number(maxCollaborators)
    });

    if (res.success) {
      setIsEditModalOpen(false);
      loadData();
    } else {
      alert("Error al actualizar plan de licencia: " + res.error);
    }
    setSavingPlan(false);
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-indigo-400 font-bold">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando datos globales del sistema...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen">
        <div className="max-w-md p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-200">Acceso Denegado</h2>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  const totalUsers = data.users.length;
  const totalWorkspaces = data.workspaces.length;
  const totalProjects = data.workspaces.reduce((acc, ws) => acc + (ws._count?.projects || 0), 0);
  const freePlans = data.workspaces.filter(w => w.subscriptionPlan === "FREE").length;

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto custom-scrollbar">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-8 border border-indigo-500/20 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" /> SUPER ADMIN GLOBAL
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Gestión Global de Usuarios & Licencias
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Panel de administración centralizada de la plataforma NEXUS. Visualiza usuarios registrados, espacios creados y administra los planes de licencias.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-[11px] font-medium text-slate-400">Total Usuarios</p>
              <p className="text-2xl font-black text-white">{totalUsers}</p>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-[11px] font-medium text-slate-400">Espacios Creados</p>
              <p className="text-2xl font-black text-indigo-400">{totalWorkspaces}</p>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-[11px] font-medium text-slate-400">Proyectos Totales</p>
              <p className="text-2xl font-black text-emerald-400">{totalProjects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla Global de Espacios y Licencias */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-500" />
            Espacios de Trabajo y Planes de Licencia ({data.workspaces.length})
          </h2>
        </div>

        <div className="bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#151b2e] text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Espacio de Trabajo</th>
                  <th className="p-4">Propietario / Admin</th>
                  <th className="p-4 text-center">Proyectos / Máx</th>
                  <th className="p-4 text-center">Colaboradores / Máx</th>
                  <th className="p-4 text-center">Plan de Licencia</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {data.workspaces.map((ws) => {
                  const ownerMember = ws.members.find((m: any) => m.role === "ADMIN") || ws.members[0];
                  const ownerUser = ownerMember?.user;

                  const planBadgeClass = 
                    ws.subscriptionPlan === "PREMIUM" ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
                    ws.subscriptionPlan === "INTERMEDIATE" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" :
                    ws.subscriptionPlan === "BASIC" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" :
                    "bg-slate-500/10 text-slate-400 border-slate-500/30";

                  const planName = 
                    ws.subscriptionPlan === "PREMIUM" ? "👑 PREMIUM" :
                    ws.subscriptionPlan === "INTERMEDIATE" ? "⚡ INTERMEDIO" :
                    ws.subscriptionPlan === "BASIC" ? "🚀 BÁSICO" :
                    "🌱 FREE";

                  return (
                    <tr key={ws.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black shrink-0">
                            {ws.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{ws.name}</p>
                            <p className="text-[10px] text-slate-500">ID: {ws.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        {ownerUser ? (
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{ownerUser.name}</p>
                            <p className="text-[10px] text-slate-500">{ownerUser.email}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Sin propietario</span>
                        )}
                      </td>

                      <td className="p-4 text-center font-bold">
                        <span className="text-slate-800 dark:text-slate-200">{ws._count?.projects || 0}</span>
                        <span className="text-slate-500"> / {ws.maxProjects >= 999 ? "∞" : ws.maxProjects}</span>
                      </td>

                      <td className="p-4 text-center font-bold">
                        <span className="text-slate-800 dark:text-slate-200">{ws.members.length}</span>
                        <span className="text-slate-500"> / {ws.maxCollaborators >= 999 ? "∞" : ws.maxCollaborators}</span>
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${planBadgeClass}`}>
                          {planName}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditPlan(ws)}
                          className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Editar Plan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabla Global de Todos los Usuarios Registrados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Usuarios Registrados Globales ({data.users.length})
          </h2>
        </div>

        <div className="bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#151b2e] text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-center">Rol Global</th>
                  <th className="p-4 text-center">Espacios Pertenecientes</th>
                  <th className="p-4 text-right">Fecha Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {data.users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-black text-indigo-400">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {u.email}
                    </td>

                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${u.globalRole === "SUPER_ADMIN" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-slate-500/10 text-slate-400 border-slate-500/30"}`}>
                        {u.globalRole === "SUPER_ADMIN" ? "👑 SUPER_ADMIN" : "👤 USER"}
                      </span>
                    </td>

                    <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {u.memberships?.length || 0} Espacio(s)
                    </td>

                    <td className="p-4 text-right text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para Editar Licencia / Plan de Espacio */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Editar Plan de Licencia: ${selectedWorkspace?.name}`}>
        <form onSubmit={handleSaveSubscription} className="space-y-5 text-xs">
          <div className="space-y-2">
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs">Seleccionar Plan de Licencia</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePlanPresetChange("FREE")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${plan === "FREE" ? "border-slate-500 bg-slate-500/10" : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 opacity-70"}`}
              >
                <p className="font-extrabold text-slate-800 dark:text-slate-200">🌱 FREE (Gratis)</p>
                <p className="text-[10px] text-slate-500">2 Espacios | 3 Proyectos | 5 Colaboradores</p>
              </button>

              <button
                type="button"
                onClick={() => handlePlanPresetChange("BASIC")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${plan === "BASIC" ? "border-cyan-500 bg-cyan-500/10" : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 opacity-70"}`}
              >
                <p className="font-extrabold text-cyan-400">🚀 BÁSICO</p>
                <p className="text-[10px] text-slate-500">5 Espacios | 10 Proyectos | 15 Colaboradores</p>
              </button>

              <button
                type="button"
                onClick={() => handlePlanPresetChange("INTERMEDIATE")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${plan === "INTERMEDIATE" ? "border-indigo-500 bg-indigo-500/10" : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 opacity-70"}`}
              >
                <p className="font-extrabold text-indigo-400">⚡ INTERMEDIO</p>
                <p className="text-[10px] text-slate-500">15 Espacios | 30 Proyectos | 50 Colaboradores</p>
              </button>

              <button
                type="button"
                onClick={() => handlePlanPresetChange("PREMIUM")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${plan === "PREMIUM" ? "border-purple-500 bg-purple-500/10" : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 opacity-70"}`}
              >
                <p className="font-extrabold text-purple-400">👑 PREMIUM</p>
                <p className="text-[10px] text-slate-500">Ilimitados Espacios, Proyectos y Miembros</p>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
            <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">Parámetros Personalizados de Límites</p>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium">Máx. Espacios</label>
                <input
                  type="number"
                  min="1"
                  value={maxWorkspaces}
                  onChange={(e) => setMaxWorkspaces(Number(e.target.value))}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium">Máx. Proyectos</label>
                <input
                  type="number"
                  min="1"
                  value={maxProjects}
                  onChange={(e) => setMaxProjects(Number(e.target.value))}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium">Máx. Colaboradores</label>
                <input
                  type="number"
                  min="1"
                  value={maxCollaborators}
                  onChange={(e) => setMaxCollaborators(Number(e.target.value))}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:text-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingPlan}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {savingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Guardar Cambios de Licencia
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
