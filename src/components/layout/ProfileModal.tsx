"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { User, Mail, Shield, Camera, Loader2 } from "lucide-react";
import { mockCurrentUser } from "@/core/infrastructure/mockData";

export function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState({
    name: mockCurrentUser.name,
    email: mockCurrentUser.email,
    role: mockCurrentUser.role,
    avatarUrl: mockCurrentUser.avatarUrl
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");

    // Simulate API call to update profile
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app with next-auth or a db, we would update the user session here
    setSuccessMsg("Perfil actualizado correctamente (Simulado)");
    setLoading(false);
    
    setTimeout(() => {
      onClose();
      setSuccessMsg("");
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil">
      <form onSubmit={handleSubmit} className="space-y-5">
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl text-center">
            {successMsg}
          </div>
        )}

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative group cursor-pointer">
            <img 
              src={formData.avatarUrl} 
              alt="Avatar" 
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-md group-hover:opacity-70 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white drop-shadow-md" />
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Click para cambiar foto</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" /> Nombre Completo
            </label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> Correo Electrónico
            </label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" /> Rol en el Sistema
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="ADMIN">Administrador</option>
              <option value="MANAGER">Project Manager</option>
              <option value="DEVELOPER">Desarrollador</option>
              <option value="COMMERCIAL">Comercial</option>
            </select>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
              * Cambiar el rol afectará tus permisos en el sistema simulado.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center min-w-[120px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Perfil"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
