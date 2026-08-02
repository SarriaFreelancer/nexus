import React from "react";
import { FullCalendar } from "@/components/calendar/FullCalendar";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  let auth;
  try {
    auth = await getCurrentWorkspace();
  } catch (e) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Calendario de Entregas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Visualiza todas tus tareas, entregas de proyectos y reuniones pendientes.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <FullCalendar />
      </div>
    </div>
  );
}
