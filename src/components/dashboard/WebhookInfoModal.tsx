"use client";

import React, { useState, useEffect } from "react";
import { X, Webhook, Copy, Check, Globe } from "lucide-react";

interface WebhookInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
}

export function WebhookInfoModal({ isOpen, onClose, projects }: WebhookInfoModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    if (selectedProjectId) {
      // Intentamos generar la URL base dinámicamente o usamos el origin actual
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://tudominio.com";
      setWebhookUrl(`${baseUrl}/api/webhooks/deploy?projectId=${selectedProjectId}&secret=TU_SECRET_KEY`);
    } else {
      setWebhookUrl("");
    }
    setCopied(false);
  }, [selectedProjectId]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f1424] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Webhook className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Configuración de Webhooks CI/CD</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Automatiza tus despliegues desde Vercel o GitHub.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              1. Selecciona el Proyecto
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="">Selecciona un proyecto...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              2. URL del Webhook
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pega esta URL en la configuración de Webhooks de tu plataforma (Vercel, GitHub, etc.). Recuerda cambiar <span className="font-mono text-indigo-500">TU_SECRET_KEY</span> por la contraseña que configuraste en tu archivo <span className="font-mono text-slate-600 dark:text-slate-300">.env</span> (<span className="font-mono">WEBHOOK_SECRET</span>).
            </p>
            <div className="relative">
              <div className="w-full p-4 pr-12 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-nowrap">
                {webhookUrl || "Selecciona un proyecto para generar la URL..."}
              </div>
              <button
                onClick={handleCopy}
                disabled={!webhookUrl}
                className="absolute right-2 top-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 flex gap-3">
            <Globe className="h-5 w-5 text-blue-500 shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-2">
              <p className="font-bold">¿Cómo funciona?</p>
              <p>
                Cada vez que tu plataforma envíe una petición POST a esta URL (al finalizar un despliegue), Nexus creará automáticamente un nuevo registro en la pestaña de <strong>Versiones y Deploys</strong>, extrayendo si es posible el Hash del Commit y la rama.
              </p>
              <p>
                Asegúrate de configurar el Webhook en Vercel seleccionando el evento <code>deployment.succeeded</code> o en GitHub en formato JSON.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
