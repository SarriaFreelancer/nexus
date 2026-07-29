"use client";

import React from "react";
import { Rocket, CheckCircle2, GitBranch, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function DeploysPage() {
  const deploys = [
    { project: "GNS SaaS", env: "Producción", version: "v2.8.1", commit: "a8f1e9c", time: "Hace 12 min", duration: "42s", status: "SUCCESS" },
    { project: "Inventario Pro", env: "Staging", version: "v1.2.0", commit: "b4c2d8a", time: "Hace 2 horas", duration: "58s", status: "SUCCESS" },
    { project: "Landing Constructora", env: "Producción", version: "v1.0.0-rc2", commit: "c9e3f1b", time: "Hace 1 día", duration: "35s", status: "SUCCESS" },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div>
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <Rocket className="h-5 w-5 text-indigo-400" /> Pipeline de Deploys & Releases
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Historial de despliegues automatizados (CI/CD), builds en Vercel/Docker y logs de compilación.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 space-y-4 shadow-xl">
        <div className="space-y-3">
          {deploys.map((dep, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{dep.project} ({dep.env})</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="font-mono text-indigo-400">{dep.version}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono"><GitBranch className="h-3 w-3" /> {dep.commit}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>Duración: {dep.duration}</span>
                <span>{dep.time}</span>
                <Badge variant="emerald">Completado</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
