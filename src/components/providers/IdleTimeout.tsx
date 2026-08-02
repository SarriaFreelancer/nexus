"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function IdleTimeout({ timeoutMinutes = 15 }: { timeoutMinutes?: number }) {
  const { data: session, status } = useSession();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds warning
  
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = 60 * 1000; // 60 seconds before timeout to show warning
  
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const warningTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);
  
  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: "/login?reason=timeout" });
  }, []);

  const resetTimer = useCallback(() => {
    // If the warning is showing, don't reset unless they explicitly click "Continuar"
    if (showWarning) return;
    
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);

    // Set timer for the warning
    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);
      
      // Start the countdown
      countdownTimer.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    }, timeoutMs - warningMs);

    // Set absolute timeout as fallback
    idleTimer.current = setTimeout(handleLogout, timeoutMs);
  }, [handleLogout, timeoutMs, warningMs, showWarning]);

  const stayLoggedIn = () => {
    setShowWarning(false);
    resetTimer();
  };

  useEffect(() => {
    if (status !== "authenticated") return;

    // Reset on mount
    resetTimer();

    // Events that denote activity
    const events = [
      "mousemove",
      "keydown",
      "wheel",
      "DOMMouseScroll",
      "mousewheel",
      "mousedown",
      "touchstart",
      "touchmove",
    ];

    const handleUserActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [resetTimer, status, showWarning]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f1424] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
            <LogOut className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">
              ¿Sigues ahí?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Tu sesión se cerrará automáticamente por inactividad en:
            </p>
            <div className="text-3xl font-black text-red-500 my-4">
              {countdown}s
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cerrar sesión
            </button>
            <button
              onClick={stayLoggedIn}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
