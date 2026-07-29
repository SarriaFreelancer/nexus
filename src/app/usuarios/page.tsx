"use client";

import React, { useState, useEffect } from "react";
import { getWorkspaceUsers } from "@/core/application/actions/userActions";
import { Users as UsersIcon, ShieldAlert, Mail, Calendar, Shield, Loader2 } from "lucide-react";
import { mockCurrentUser } from "@/core/infrastructure/mockData";
import { Badge } from "@/components/ui/Badge";

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Basic client-side check just to show the UI error quickly
    if (mockCurrentUser.role !== "ADMIN" && mockCurrentUser.role !== "SUPER_ADMIN") {
      setError("UNAUTHORIZED");
      setIsLoading(false);
      return;
    }

    getWorkspaceUsers().then(res => {
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        setError(res.error || "Error al cargar usuarios");
      }
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-slate-500 font-medium">Cargando módulo de usuarios...</p>
      </div>
    );
  }

  if (error === "UNAUTHORIZED") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4 max-w-md mx-auto text-center">
        <div className="h-20 w-20 rounded-full bg-rose-500/10 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">Acceso Restringido</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Este módulo es exclusivo para Super Administradores. No tienes los permisos necesarios para ver o gestionar los colaboradores del sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-indigo-400" /> Gestión de Colaboradores
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Administra los accesos, roles y usuarios de tu espacio de trabajo.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f1424] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">Contacto</th>
                <th className="px-6 py-4 font-semibold">Fecha Ingreso</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-800" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === "ACTIVE" ? "emerald" : "amber"} size="sm">
                      {user.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
