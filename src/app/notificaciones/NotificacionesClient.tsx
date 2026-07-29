"use client";

import React, { useState } from "react";
import { Bell, CheckCircle2, Tag, Server, Check } from "lucide-react";
import { markAllAsRead, markAsRead } from "@/core/application/actions/notificationActions";
import { useRouter } from "next/navigation";

export default function NotificacionesClient({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifs, setNotifs] = useState(initialNotifications);
  const router = useRouter();

  const handleMarkAllRead = async () => {
    const res = await markAllAsRead();
    if (res.success) {
      setNotifs(notifs.map(n => ({ ...n, isRead: true })));
      router.refresh();
    }
  };

  const handleMarkRead = async (id: string) => {
    const res = await markAsRead(id);
    if (res.success) {
      setNotifs(notifs.map(n => n.id === id ? { ...n, isRead: true } : n));
      router.refresh();
    }
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-400" /> Centro de Notificaciones ({unreadCount} sin leer)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Alertas en tiempo real, asignaciones de tareas y publicaciones de versiones.
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <Check className="h-4 w-4" /> Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-xl">
        {notifs.map((n) => (
          <div 
            key={n.id} 
            onClick={() => !n.isRead && handleMarkRead(n.id)}
            className={`p-4 rounded-xl border transition-all flex items-start justify-between cursor-pointer ${!n.isRead ? "bg-slate-100 dark:bg-slate-900 border-indigo-500/40" : "bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"}`}
          >
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                {!n.isRead && <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />}
                {n.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(n.createdAt).toLocaleString()}</span>
          </div>
        ))}
        {notifs.length === 0 && (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
            No tienes notificaciones
          </p>
        )}
      </div>
    </div>
  );
}
