"use client";

import React, { useState } from "react";
import { Tag, Plus, Webhook } from "lucide-react";
import { CreateVersionModal } from "@/components/dashboard/CreateVersionModal";
import { WebhookInfoModal } from "@/components/dashboard/WebhookInfoModal";

export function VersionesHeader({ projects }: { projects: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tag className="h-5 w-5 text-indigo-400" /> Control de Versiones SemVer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Historial de releases (SemVer 2.0.0), changelogs automáticos y commits vinculados por proyecto.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <button 
            onClick={() => setIsWebhookModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all"
          >
            <Webhook className="h-4 w-4 text-indigo-500" />
            <span>Automatizar CI/CD</span>
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Crear Nueva Versión</span>
          </button>
        </div>
      </div>

      <CreateVersionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        projects={projects} 
      />

      <WebhookInfoModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        projects={projects}
      />
    </>
  );
}
