"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Search, Filter, Loader2, FileCode2, Eye } from "lucide-react";
import { getAuditLogs } from "@/core/application/actions/auditActions";
import { AuditDetailModal } from "@/components/dashboard/AuditDetailModal";

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 8;
  
  // Modal State
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = (page: number) => {
    setIsLoading(true);
    getAuditLogs(page, itemsPerPage).then(res => {
      if (res.success && res.data) {
        setLogs(res.data.logs);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.totalItems);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  // Filter logs locally by search (Note: In a real app this should be done server-side)
  const filteredLogs = logs.filter(log => 
    log.user.name.toLowerCase().includes(search.toLowerCase()) || 
    log.description.toLowerCase().includes(search.toLowerCase()) ||
    log.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <AuditDetailModal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
        log={selectedLog} 
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-400" /> Registro de Auditoría
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Monitorea los eventos del sistema, cambios en registros y accesos.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por usuario o evento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <Filter className="w-4 h-4" /> Filtros Avanzados
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#0f1424] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-xs font-medium text-slate-500">Cargando eventos...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Usuario</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Evento / Acción</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Registro / Entidad</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Fecha y Hora</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {log.user.avatarUrl ? (
                          <img src={log.user.avatarUrl} alt={log.user.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-800" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs ring-1 ring-slate-200 dark:ring-slate-800 shrink-0">
                            {log.user.name ? log.user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{log.user.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{log.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${log.action.includes('SYSTEM') ? 'bg-slate-400' : 'bg-indigo-500'}`}></span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">{log.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <FileCode2 className="w-3.5 h-3.5 text-indigo-400/70" />
                        {log.entity}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold shadow-md shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-500/40 transition-all group-hover:animate-pulse focus:animate-none"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver Cambios
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400 text-sm">
                      No se encontraron registros que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Mostrando página {currentPage} de {totalPages} ({totalItems} registros totales)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                Anterior
              </button>
              
              <div className="flex gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i + 1;
                  // Si estamos más allá de la página 3, desplazar la ventana
                  if (currentPage > 3 && totalPages > 5) {
                    pageNum = currentPage - 2 + i;
                  }
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-bold transition-colors ${
                        currentPage === pageNum 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
