import React from "react";
import { MetricsHeader } from "@/components/dashboard/MetricsHeader";
import { ProjectDistributionWidget } from "@/components/dashboard/ProjectDistributionWidget";
import { RecentActivityWidget } from "@/components/dashboard/RecentActivityWidget";
import { MiniCalendarWidget } from "@/components/dashboard/MiniCalendarWidget";
import { RecentProjectsWidget } from "@/components/dashboard/RecentProjectsWidget";
import { UpcomingTasksWidget } from "@/components/dashboard/UpcomingTasksWidget";
import { ServerStatusWidget } from "@/components/dashboard/ServerStatusWidget";
import { ProductivityChartWidget } from "@/components/dashboard/ProductivityChartWidget";
import { SystemAlertsWidget } from "@/components/dashboard/SystemAlertsWidget";
import { getDashboardMetrics, getDashboardData, getWeeklyProductivity } from "@/core/application/actions/dashboardActions";

export default async function DashboardPage() {
  const [metricsResult, dataResult, productivityResult] = await Promise.all([
    getDashboardMetrics(),
    getDashboardData(),
    getWeeklyProductivity()
  ]);
  
  const metrics = metricsResult.data;
  const dashboardData = dataResult.data;
  const productivityData = productivityResult.data;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Greeting Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          ¡Bienvenido de vuelta, David! 👋
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          Aquí tienes un resumen de lo que está sucediendo en Nexus hoy.
        </p>
      </div>

      {/* Top 5 Metric Cards */}
      {metrics && <MetricsHeader metrics={metrics} />}

      {/* Analytics & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <ProjectDistributionWidget data={dashboardData?.projectDistribution} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivityWidget activities={dashboardData?.recentActivity} />
        </div>
        <div className="lg:col-span-1">
          <MiniCalendarWidget />
        </div>
      </div>

      {/* Active Projects Grid & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 flex flex-col">
          <RecentProjectsWidget projects={dashboardData?.recentProjects} />
          <ProductivityChartWidget data={productivityData} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <UpcomingTasksWidget tasks={dashboardData?.upcomingTasks} />
          <SystemAlertsWidget alerts={dashboardData?.alerts} />
        </div>
      </div>

      {/* Server Status Telemetry Row */}
      <ServerStatusWidget servers={dashboardData?.servers} />
    </div>
  );
}
