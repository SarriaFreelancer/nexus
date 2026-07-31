"use client";

import React, { useState, useEffect } from "react";
import { 
  getWorkspaceMembers, inviteWorkspaceMember, updateMemberRole, removeWorkspaceMember 
} from "@/core/application/actions/workspaceActions";
import { Users as UsersIcon, UserPlus, Shield, Mail, Trash2, Loader2, CheckCircle2, Building, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "👑 Admin (Control Total)", description: "Puede crear, editar, eliminar y gestionar miembros" },
  { value: "MANAGER", label: "💼 Manager (Líder)", description: "Puede crear/editar proyectos y tareas y gestionar equipos" },
  { value: "DEVELOPER", label: "💻 Developer (Desarrollador)", description: "Puede crear/editar tareas, mover Kanban y adjuntar archivos" },
  { value: "DESIGNER", label: "🎨 Designer (Diseñador)", description: "Edición operativa en diseño y tareas" },
  { value: "QA", label: "🧪 QA (Tester)", description: "Edición operativa en pruebas y reportes" },
  { value: "COMMERCIAL", label: "📈 Commercial (Comercial)", description: "Vista comercial y cotizaciones" },
  { value: "CLIENT", label: "🤝 Cliente", description: "Vista de cliente (Sólo lectura)" },
  { value: "GUEST", label: "👁️ Guest (Invitado)", description: "Sólo lectura sin permisos de modificación" },
];

export default function ColaboradoresClient() {
  const [members, setMembers] = useState<any[]>([]);
  const [workspace, setWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Form states
  const [inviteInput, setInviteInput] = useState("");
  const [selectedRole, setSelectedRole] = useState("DEVELOPER");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchMembers = async () => {
    setIsLoading(true);
    const res = await getWorkspaceMembers();
    if (res.success && res.data) {
      setMembers(res.data);
      setWorkspace(res.workspace);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;
    setSubmitting(true);
    setFeedback(null);

    const res = await inviteWorkspaceMember(inviteInput, selectedRole);
    if (res.success) {
      setFeedback({ type: "success", text: "Colaborador añadido/invitado exitosamente al espacio de trabajo." });
      setInviteInput("");
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setFeedback(null);
      }, 1500);
      fetchMembers();
    } else {
      setFeedback({ type: "error", text: res.error || "Error al invitar colaborador." });
    }
    setSubmitting(false);
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    const res = await updateMemberRole(memberId, newRole);
    if (res.success) {
      fetchMembers();
    } else {
      alert("Error al actualizar rol: " + res.error);
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!confirm(`¿Estás seguro de quitar a "${memberName}" de este Espacio de Trabajo?`)) return;
    const res = await removeWorkspaceMember(memberId);
    if (res.success) {
      fetchMembers();
    } else {
      alert("Error al eliminar miembro: " + res.error);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 flex-1 p-6 lg:p-8">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UsersIcon className="w-6 h-6 text-indigo-500" />
              Colaboradores y Equipo del Espacio
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
            <Building className="w-3.5 h-3.5 text-purple-400" />
            Espacio Activo: <strong className="text-slate-700 dark:text-slate-200 font-bold">{workspace?.name || "Cargando..."}</strong>
            <span className="ml-2 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-[10px]">
              Plan {workspace?.subscriptionPlan || "FREE"}
            </span>
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Añadir / Invitar Colaborador
        </button>
      </div>

      {/* Grid de Tarjetas de Colaboradores */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          Cargando colaboradores del espacio...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((m) => {
            const user = m.user;
            const isOwnerAdmin = m.role === "ADMIN";

            return (
              <div
                key={m.id}
                className="bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/30 shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate flex items-center gap-1.5">
                        {user?.name || "Usuario"}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 pt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {user?.email || "Sin email"}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${isOwnerAdmin ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"}`}>
                    {m.role}
                  </span>
                </div>

                {/* Controles de Asignación de Cargo / Rol */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Cargo en Espacio:</span>
                  </div>

                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>

                  {!isOwnerAdmin && (
                    <button
                      onClick={() => handleRemove(m.id, user?.name || "Colaborador")}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Quitar colaborador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Invitación de Colaborador */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Añadir Colaborador al Espacio">
        <form onSubmit={handleInvite} className="space-y-4 text-xs">
          {feedback && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${feedback.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
              {feedback.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs">
              Correo Electrónico o Usuario registrado *
            </label>
            <input
              required
              type="text"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              placeholder="ejemplo@empresa.com o admin@nexus.com"
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs">
              Cargo / Rol en el Espacio *
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:text-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !inviteInput.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Confirmar e Invitar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
