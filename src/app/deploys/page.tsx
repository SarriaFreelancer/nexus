"use client";

import React from "react";
import { Rocket, CheckCircle2, GitBranch, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

import { getVersions } from "@/core/application/actions/versionActions";

export default function DeploysPage() {
  const [deploys, setDeploys] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getVersions().then(res => {
      if (res.success && res.data) {
        setDeploys(res.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Rocket className="h-5 w-5 text-indigo-400" /> Pipeline de Deploys & Releases
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Historial de despliegues automatizados (CI/CD), builds en Vercel/Docker y logs de compilación.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-xl">
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center p-10"><span className="text-slate-500">Cargando...</span></div>
          ) : deploys.length === 0 ? (
            <div className="flex justify-center p-10"><span className="text-slate-500">No hay despliegues recientes.</span></div>
          ) : deploys.map((dep, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`h-5 w-5 shrink-0 ${dep.isCurrent ? "text-emerald-400" : "text-blue-400"}`} />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{dep.project?.name} (Producción)</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="font-mono text-indigo-400">{dep.versionNumber}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono"><GitBranch className="h-3 w-3" /> {dep.id.substring(0, 7)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>{new Date(dep.releaseDate || Date.now()).toLocaleDateString()}</span>
                <Badge variant={dep.isCurrent ? "emerald" : "blue"}>{dep.isCurrent ? "DEPLOYED" : "RELEASED"}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
