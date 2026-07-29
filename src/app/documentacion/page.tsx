"use client";

import React from "react";
import { BookOpen, Plus, FileText, Code2, Database, Shield, Layers, Search } from "lucide-react";

export default function DocumentacionPage() {
  const docsList = [
    {
      title: "Manual de Arquitectura Clean Architecture",
      category: "Arquitectura",
      icon: Layers,
      updated: "Hace 2 días",
      author: "David Sarria",
      snippet: "Especificación de las 4 capas desacopladas, Repository Pattern y DTOs...",
    },
    {
      title: "Especificación de Modelo ERD & Prisma Schemas",
      category: "Base de Datos",
      icon: Database,
      updated: "Ayer",
      author: "David Sarria",
      snippet: "Modelado de datos multi-tenant, índices en MySQL y PostgreSQL...",
    },
    {
      title: "Guía de Seguridad JWT, OAuth & RBAC Policies",
      category: "Seguridad",
      icon: Shield,
      updated: "Hace 5 días",
      author: "Elena Torres",
      snippet: "Roles por Workspace, validación Zod y auditoría de eventos de usuario...",
    },
    {
      title: "API REST & Swagger Endpoint Specifications",
      category: "API Reference",
      icon: Code2,
      updated: "Hace 1 semana",
      author: "María Gómez",
      snippet: "Documentación OpenAPI 3.0 para consumo de clientes móviles e integraciones...",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" /> Wiki & Documentación Técnica
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
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
        {docsList.map((doc, idx) => {
          const Icon = doc.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-3 shadow-xl group cursor-pointer"
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
                    <h3 className="font-bold text-slate-100 text-sm group-hover:text-indigo-300 transition-colors">
                      {doc.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-medium bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                {doc.snippet}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Por {doc.author}</span>
                <span>{doc.updated}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
