"use client";

import React, { useState } from "react";
import { Edit2 } from "lucide-react";
import { EditVersionModal } from "./EditVersionModal";

export function EditVersionButton({ version, projects }: { version: any, projects: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
        title="Editar versión"
      >
        <Edit2 className="w-4 h-4" />
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
