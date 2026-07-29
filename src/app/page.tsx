"use client";

import React from "react";
import { MetricsHeader } from "@/components/dashboard/MetricsHeader";
import { ProjectDistributionWidget } from "@/components/dashboard/ProjectDistributionWidget";
import { RecentActivityWidget } from "@/components/dashboard/RecentActivityWidget";
import { MiniCalendarWidget } from "@/components/dashboard/MiniCalendarWidget";
import { RecentProjectsWidget } from "@/components/dashboard/RecentProjectsWidget";
import { UpcomingTasksWidget } from "@/components/dashboard/UpcomingTasksWidget";
import { ServerStatusWidget } from "@/components/dashboard/ServerStatusWidget";
import { SystemAlertsWidget } from "@/components/dashboard/SystemAlertsWidget";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Greeting Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
          ¡Bienvenido de vuelta, David! 👋
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Aquí tienes un resumen de lo que está sucediendo en Nexus hoy.
        </p>
      </div>

      {/* Top 5 Metric Cards */}
      <MetricsHeader />

      {/* Analytics & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <ProjectDistributionWidget />
        </div>
        <div className="lg:col-span-2">
          <RecentActivityWidget />
        </div>
        <div className="lg:col-span-1">
          <MiniCalendarWidget />
        </div>
      </div>

      {/* Active Projects Grid & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <RecentProjectsWidget />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <UpcomingTasksWidget />
          <SystemAlertsWidget />
        </div>
      </div>

      {/* Server Status Telemetry Row */}
      <ServerStatusWidget />
    </div>
  );
}
