"use client";

import React, { useState, useEffect } from "react";
import { 
  getWorkspaceMembers, inviteWorkspaceMember, updateMemberRole, removeWorkspaceMember 
} from "@/core/application/actions/workspaceActions";
import { Users as UsersIcon, UserPlus, Shield, Mail, Trash2, Loader2, CheckCircle2, Building } from "lucide-react";
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

export default function UsuariosClient() {
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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UsersIcon className="w-6 h-6 text-indigo-500" />
              Gestión de Equipo y Colaboradores
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
            <Building className="w-3.5 h-3.5 text-purple-400" />
            Espacio de Trabajo Activo: <strong className="text-slate-800 dark:text-slate-200">{workspace?.name || "Cargando..."}</strong>
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Invitar Colaborador</span>
        </button>
      </div>

      {/* Invite Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invitar Colaborador al Espacio de Trabajo">
        <form onSubmit={handleInvite} className="space-y-4 text-sm">
          {feedback && (
            <div className={`p-3 rounded-xl text-xs border ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              {feedback.text}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Correo Electrónico o Usuario</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                required
                type="text"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                placeholder="colaborador@empresa.com o usuario"
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Rol en este Espacio de Trabajo</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-0.5">
              {ROLE_OPTIONS.find(r => r.value === selectedRole)?.description}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !inviteInput.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Enviar Invitación
            </button>
          </div>
        </form>
      </Modal>

      {/* Members Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Usuario / Colaborador</th>
                  <th className="py-3.5 px-4">Correo</th>
                  <th className="py-3.5 px-4">Rol en Workspace</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.user?.avatarUrl || `https://i.pravatar.cc/150?u=${encodeURIComponent(m.user?.name || "user")}`}
                          alt={m.user?.name}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{m.user?.name || "Sin Nombre"}</p>
                          <p className="text-[10px] text-slate-400">@{m.user?.username || "usuario"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      {m.user?.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-indigo-400 focus:outline-none cursor-pointer"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="indigo" size="sm" className="gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Activo
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRemove(m.id, m.user?.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Quitar acceso de este Workspace"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
