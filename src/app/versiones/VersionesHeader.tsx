"use client";

import React, { useState } from "react";
import { Tag, Plus } from "lucide-react";
import { CreateVersionModal } from "@/components/dashboard/CreateVersionModal";

export function VersionesHeader({ projects }: { projects: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Crear Nueva Versión</span>
        </button>
      </div>

      <CreateVersionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        projects={projects} 
      />
    </>
  );
}
