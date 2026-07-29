import React from "react";
import { BookOpen, Plus, FileText, Code2, Database, Shield, Layers, Search } from "lucide-react";
import { getDocuments } from "@/core/application/actions/documentActions";

export default async function DocumentacionPage() {
  const result = await getDocuments();
  const docsList = result.data || [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" /> Wiki & Documentación Técnica
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Base de conocimiento unificada, diagramas de arquitectura, modelos ERD y guías de despliegue.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start">
          <Plus className="h-4 w-4" />
          <span>Crear Documento</span>
        </button>
      </div>

      {/* Docs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {docsList.map((doc: any, idx: number) => {
          let Icon = FileText;
          if (doc.category?.includes("Arquitectura")) Icon = Layers;
          if (doc.category?.includes("Datos")) Icon = Database;
          if (doc.category?.includes("Seguridad")) Icon = Shield;
          if (doc.category?.includes("API")) Icon = Code2;

          return (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-3 shadow-xl group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-950 border border-indigo-700/60 text-indigo-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      {doc.category}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-indigo-300 transition-colors">
                      {doc.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium bg-slate-100 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 line-clamp-3">
                {doc.content}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                <span>Proyecto: {doc.project?.name || "Global"}</span>
                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
        {docsList.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center text-slate-400 dark:text-slate-500 py-10 font-medium">
            No hay documentos creados aún.
          </div>
        )}
      </div>
    </div>
  );
}
