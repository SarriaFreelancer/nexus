"use client";

import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { getNotifications } from "@/core/application/actions/notificationActions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifs = async () => {
      const res = await getNotifications();
      if (res.success && res.data) {
        setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
      }
    };
    fetchNotifs();

    // Poll every 30 seconds
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link 
      href="/notificaciones"
      className="relative h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#090c15]">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
