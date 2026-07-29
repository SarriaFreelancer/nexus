"use client";

import React from "react";
import { Bell, CheckCircle2, Tag, Server, Check } from "lucide-react";

export default function NotificacionesPage() {
  const notifs = [
    { title: "Nueva versión v2.8.1 publicada", desc: "David Sarria publicó la versión de GNS en Producción", time: "Hace 12 min", unread: true },
    { title: "Tarea completada: Diseño de Dashboard", desc: "María Gómez completó la tarea en GNS", time: "Hace 45 min", unread: true },
    { title: "Alerta de Servidor Principal", desc: "Uso de CPU alcanzó 85% momentáneamente", time: "Hace 2 horas", unread: false },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-400" /> Centro de Notificaciones (12 sin leer)
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Alertas en tiempo real, asignaciones de tareas y publicaciones de versiones.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100">
          <Check className="h-4 w-4" /> Marcar todas como leídas
        </button>
      </div>

      <div className="p-5 rounded-2xl bg-[#0f1424] border border-slate-800/80 space-y-3 shadow-xl">
        {notifs.map((n, idx) => (
          <div key={idx} className={`p-4 rounded-xl border transition-all flex items-start justify-between ${n.unread ? "bg-slate-900 border-indigo-500/40" : "bg-slate-900/40 border-slate-800"}`}>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-100 text-xs flex items-center gap-2">
                {n.unread && <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />}
                {n.title}
              </h4>
              <p className="text-xs text-slate-400">{n.desc}</p>
            </div>
            <span className="text-[10px] text-slate-500">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
