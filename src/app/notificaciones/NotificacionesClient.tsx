"use client";

import React, { useState } from "react";
import { Bell, CheckCircle2, Tag, Server, Check, AlertTriangle, Clock, Filter, AlertCircle } from "lucide-react";
import { markAllAsRead, markAsRead } from "@/core/application/actions/notificationActions";
import { useRouter } from "next/navigation";

export default function NotificacionesClient({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifs, setNotifs] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "OVERDUE" | "DUE_SOON" | "UNREAD">("ALL");
  const router = useRouter();

  const handleMarkAllRead = async () => {
    const res = await markAllAsRead();
    if (res.success) {
      setNotifs(notifs.map(n => ({ ...n, isRead: true })));
      router.refresh();
    }
  };

  const handleMarkRead = async (id: string, link?: string) => {
    const res = await markAsRead(id);
    if (res.success) {
      setNotifs(notifs.map(n => n.id === id ? { ...n, isRead: true } : n));
      if (link) router.push(link);
      else router.refresh();
    }
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;

  const filteredNotifs = notifs.filter((n) => {
    if (activeFilter === "UNREAD") return !n.isRead;
    if (activeFilter === "OVERDUE") return n.type === "ERROR" || n.title.includes("Vencida");
    if (activeFilter === "DUE_SOON") return n.type === "WARNING" || n.title.includes("Próxima");
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-500" /> Centro de Notificaciones ({unreadCount} sin leer)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Alertas automáticas de tareas vencidas, próximas a vencer y eventos en tiempo real.
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <Check className="h-4 w-4" /> Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeFilter === "ALL"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30"
              : "bg-white dark:bg-[#0f1424] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          Todas ({notifs.length})
        </button>
        <button
          onClick={() => setActiveFilter("OVERDUE")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeFilter === "OVERDUE"
              ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30"
              : "bg-white dark:bg-[#0f1424] text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" /> 🚨 Vencidas ({notifs.filter(n => n.type === "ERROR" || n.title.includes("Vencida")).length})
        </button>
        <button
          onClick={() => setActiveFilter("DUE_SOON")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeFilter === "DUE_SOON"
              ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/30"
              : "bg-white dark:bg-[#0f1424] text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> ⏳ Próximas ({notifs.filter(n => n.type === "WARNING" || n.title.includes("Próxima")).length})
        </button>
        <button
          onClick={() => setActiveFilter("UNREAD")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeFilter === "UNREAD"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
              : "bg-white dark:bg-[#0f1424] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          Sin Leer ({unreadCount})
        </button>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-xl">
        {filteredNotifs.map((n) => {
          const isOverdue = n.type === "ERROR" || n.title.includes("Vencida");
          const isDueSoon = n.type === "WARNING" || n.title.includes("Próxima");

          return (
            <div 
              key={n.id} 
              onClick={() => handleMarkRead(n.id, n.link)}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between cursor-pointer ${
                isOverdue
                  ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-400 dark:border-rose-800/80 hover:border-rose-500 shadow-sm"
                  : isDueSoon
                  ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-800/80 hover:border-amber-500 shadow-sm"
                  : !n.isRead
                  ? "bg-slate-100 dark:bg-slate-900 border-indigo-500/40"
                  : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                  {isOverdue ? (
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  ) : isDueSoon ? (
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : !n.isRead ? (
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  ) : null}
                  <span>{n.title}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</p>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0 ml-4">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>
          );
        })}
        {filteredNotifs.length === 0 && (
          <p className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-8">
            No tienes notificaciones en este filtro.
          </p>
        )}
      </div>
    </div>
  );
}
