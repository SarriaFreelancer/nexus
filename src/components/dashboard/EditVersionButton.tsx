"use client";

import React, { useState } from "react";
import { Tag } from "lucide-react";
import { EditVersionModal } from "./EditVersionModal";

export function EditVersionButton({ version, projects, label }: { version: any, projects: any[], label?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className={label 
          ? "w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-2"
          : "p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
        }
        title="Editar versión"
      >
        <Tag className="w-3.5 h-3.5 text-indigo-500" />
        {label && <span>{label}</span>}
      </button>

      <EditVersionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        projects={projects}
        initialData={version}
      />
    </>
  );
}
