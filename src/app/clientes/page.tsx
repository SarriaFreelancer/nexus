"use client";

import React from "react";
import { Users, Plus, DollarSign, Phone, Mail, Building, MoreHorizontal } from "lucide-react";
import { mockClients } from "@/core/infrastructure/mockData";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export default function ClientesPage() {
  const stages = ["Lead", "Contactado", "Propuesta", "Negociación", "Ganado"];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" /> CRM Enterprise & Clientes
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Pipeline comercial visual, oportunidades de venta, contratos y seguimiento de clientes.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start">
          <Plus className="h-4 w-4" />
          <span>Nuevo Cliente / Lead</span>
        </button>
      </div>

      {/* CRM Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-h-[550px]">
        {stages.map((stg) => {
          const colClients = mockClients.filter((c) => c.stage === stg);
          const totalVal = colClients.reduce((acc, curr) => acc + curr.value, 0);

          return (
            <div
              key={stg}
              className="bg-[#0f1424] border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between h-full shadow-lg"
            >
              <div className="space-y-3 mb-3">
                {/* Column Header */}
                <div className="pb-2 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{stg}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] font-bold text-slate-400 border border-slate-800">
                      {colClients.length}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-400 mt-1">
                    {formatCurrency(totalVal)}
                  </p>
                </div>

                {/* Cards */}
                <div className="space-y-3 min-h-[350px]">
                  {colClients.map((client) => (
                    <div
                      key={client.id}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-2 shadow-md group cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="h-3.5 w-3.5 text-indigo-400" />
                          <h4 className="font-bold text-slate-100 text-xs group-hover:text-indigo-300 transition-colors">
                            {client.company}
                          </h4>
                        </div>
                        <button className="text-slate-500 hover:text-slate-300">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 font-medium">
                        Contacto: {client.contactName}
                      </p>

                      <div className="space-y-1 pt-1 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-slate-500" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-slate-500" />
                          <span>{client.phone}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                        <span className="font-extrabold text-emerald-400">
                          {formatCurrency(client.value)}
                        </span>
                        <span className="text-[10px] text-slate-500">{client.lastInteraction}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full py-2 rounded-xl border border-dashed border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
                <Plus className="h-3.5 w-3.5" /> Agregar Lead
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
