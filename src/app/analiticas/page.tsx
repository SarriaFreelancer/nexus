import React from "react";
import { getAnalyticsMetrics } from "@/core/application/actions/analyticsActions";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  DollarSign,
  Users,
  Lock,
  ArrowUpRight,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnaliticasPage() {
  const result = await getAnalyticsMetrics();
  const data = result.data;

  const totalIncome = data?.totalIncome || 0;
  const successCount = data?.totalSuccessCount || 0;
  const failedCount = data?.totalFailedCount || 0;
  const successRate = data?.successRate || 100;
  const dailyLoginData = data?.dailyLoginData || [];
  const recentLogins = data?.recentLogins || [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-500" /> Módulo de Analíticas & Accesos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Monitoreo en tiempo real de ingresos financieros, inicios de sesión exitosos y fallidos.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Ingresos Totales */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <DollarSign className="w-5.5 h-5.5" />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ingresos Totales</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                {formatCurrency(totalIncome)}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-500">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Facturación directa</span>
          </div>
        </div>

        {/* Card 2: Logins Exitosos */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Logins Exitosos</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                {successCount}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-500">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Accesos permitidos</span>
          </div>
        </div>

        {/* Card 3: Logins Fallidos */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Logins Fallidos</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                {failedCount}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-rose-500">
            <XCircle className="w-3.5 h-3.5" />
            <span>Intentos bloqueados</span>
          </div>
        </div>

        {/* Card 4: Tasa de Éxito */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5.5 h-5.5" />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tasa de Éxito</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                {successRate}%
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-500">
            <Lock className="w-3.5 h-3.5" />
            <span>Seguridad del sistema</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Login Activity Chart + Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Login Activity Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-indigo-500" /> Intentos de Inicio de Sesión (Últimos 7 días)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comparativa entre autenticaciones exitosas y fallidas por día.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-500"></span>
                <span className="text-slate-600 dark:text-slate-300">Exitosos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500"></span>
                <span className="text-slate-600 dark:text-slate-300">Fallidos</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visual */}
          <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
            {dailyLoginData.map((item, idx) => {
              const maxVal = 10;
              const hSuccess = Math.min((item.exitosos / maxVal) * 100, 100);
              const hFailed = Math.min((item.fallidos / maxVal) * 100, 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Exitoso bar */}
                    <div
                      className="w-1/2 max-w-[20px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md transition-all group-hover:brightness-110"
                      style={{ height: `${Math.max(hSuccess, 8)}%` }}
                    />
                    {/* Fallido bar */}
                    <div
                      className="w-1/2 max-w-[20px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all group-hover:brightness-110"
                      style={{ height: `${Math.max(hFailed, 4)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Summary Card (1 Col) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <DollarSign className="w-4.5 h-4.5 text-emerald-500" /> Resumen de Ingresos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Balance general de facturación y cobros de clientes.
            </p>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Ingresos Totales Registrados</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(totalIncome)}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Proyección de Cierre de Mes</p>
                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{formatCurrency(totalIncome * 1.25)}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Estado financiero</span>
            <span className="font-bold text-emerald-500">● 100% Auditado</span>
          </div>
        </div>
      </div>

      {/* Access Audit Logs Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-indigo-500" /> Registro de Accesos Recientes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Auditoría detallada de los últimos inicios de sesión (exitosos y fallidos).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Estado</th>
                <th className="p-3">Usuario / Correo</th>
                <th className="p-3">Detalle</th>
                <th className="p-3">IP origen</th>
                <th className="p-3 text-right">Fecha / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentLogins.length > 0 ? (
                recentLogins.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-3">
                      {log.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Exitoso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                          <XCircle className="w-3 h-3" /> Fallido
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{log.user}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">{log.message}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">{log.ip}</td>
                    <td className="p-3 text-right font-medium text-slate-400">
                      {new Date(log.timestamp).toLocaleString("es-ES")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400">
                    No hay registros de accesos aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
