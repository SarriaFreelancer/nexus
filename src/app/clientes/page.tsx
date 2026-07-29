"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, DollarSign, Phone, Mail, Building, MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { getClients, moveClientStage } from "@/core/application/actions/clientActions";
import { Modal } from "@/components/ui/Modal";
import { CreateClientForm } from "@/components/dashboard/CreateClientForm";
import { EditClientForm } from "@/components/dashboard/EditClientForm";
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';

function DraggableClient({ client, children }: { client: any, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: client.id,
    data: client
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.8 : 1,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
      {children}
    </div>
  );
}

function DroppableColumn({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div ref={setNodeRef} className={`${className} ${isOver ? 'ring-2 ring-indigo-500 bg-indigo-500/10' : ''} transition-all`}>
      {children}
    </div>
  );
}

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<any | null>(null);
  const stages = ["Lead", "Contactado", "Propuesta", "Negociación", "Ganado"];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const fetchClients = () => {
    getClients().then(res => {
      if (res.success && res.data) setClients(res.data);
    });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const clientId = active.id;
    const newStage = over.id; // column id
    const client = clients.find(c => c.id === clientId);

    if (client && client.stage !== newStage) {
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, stage: newStage } : c));
      const res = await moveClientStage(clientId, newStage);
      if (!res.success) fetchClients();
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Lead Comercial">
        <CreateClientForm 
          onCancel={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchClients();
          }} 
        />
      </Modal>

      <Modal isOpen={!!editClient} onClose={() => setEditClient(null)} title="Editar Lead Comercial">
        {editClient && (
          <EditClientForm 
            client={editClient}
            onCancel={() => setEditClient(null)} 
            onSuccess={() => {
              setEditClient(null);
              fetchClients();
            }} 
          />
        )}
      </Modal>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" /> CRM Enterprise & Clientes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Pipeline comercial visual, oportunidades de venta, contratos y seguimiento de clientes.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Cliente / Lead</span>
        </button>
      </div>

      {/* CRM Pipeline Columns */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-h-[550px]">
          {stages.map((stg) => {
            const colClients = clients.filter((c: any) => c.stage === stg);
            const totalVal = colClients.reduce((acc: any, curr: any) => acc + (curr.value || 0), 0);

            return (
              <DroppableColumn
                key={stg}
                id={stg}
                className="bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 flex flex-col h-full shadow-lg"
              >
                <div className="space-y-3 mb-3 shrink-0">
                  {/* Column Header */}
                  <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{stg}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                        {colClients.length}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-emerald-400 mt-1">
                      {formatCurrency(totalVal)}
                    </p>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1 min-h-[350px]">
                  {colClients.map((client) => (
                    <DraggableClient key={client.id} client={client}>
                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all space-y-2 shadow-md group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Building className="h-3.5 w-3.5 text-indigo-400" />
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs group-hover:text-indigo-300 transition-colors">
                              {client.company}
                            </h4>
                          </div>
                          <button onClick={() => setEditClient(client)} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Contacto: {client.contactName}
                        </p>

                        <div className="space-y-1 pt-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                            <span>{client.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/60 text-xs">
                          <span className="font-extrabold text-emerald-400">
                            {formatCurrency(client.value || 0)}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{client.lastInteraction || "Sin contacto reciente"}</span>
                        </div>
                      </div>
                    </DraggableClient>
                  ))}
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full mt-3 shrink-0 py-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> Agregar Lead
                </button>
              </DroppableColumn>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
