"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileText, FileDown, Plus, MessageSquare, Loader2, File, Paperclip, Send, Layers, Database, Server, Shield, Code2, LayoutTemplate } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface Document {
  id: string;
  title: string;
  category: string;
  type: string;
  createdAt: string;
  content?: string;
  fileUrl?: string;
}

export function ProjectDocuments({ projectId }: { projectId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Arquitectura");
  const [type, setType] = useState("INTERNAL");
  const [content, setContent] = useState("");

  const categories = [
    "Cotización", "Contrato", "Requerimientos", "Diseño UI/UX",
    "Arquitectura", "Diagrama ERD", "Guía de Despliegue", 
    "Manual de Usuario", "Documentación API", "Seguridad"
  ];

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/documents?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchDocuments();
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const newMessage = { role: "user", content: chatInput };
    const updatedMessages = [...chatMessages, newMessage];
    setChatMessages(updatedMessages);
    setChatInput("");
    setIsGenerating(true);

    try {
      const res = await fetch("/api/documents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, projectId }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: "assistant", content: data.content }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQuote = async () => {
    if (chatMessages.length === 0) return;
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (lastMsg.role !== "assistant") return;

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: "Cotización Generada por IA",
          type: "QUOTE",
          content: lastMsg.content,
          category: "QUOTE"
        }),
      });
      if (res.ok) {
        setIsChatOpen(false);
        fetchDocuments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, type, content, projectId })
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setTitle(""); setContent("");
        fetchDocuments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    if (cat.includes("Arquitectura")) return <Layers className="text-indigo-500 w-6 h-6" />;
    if (cat.includes("ERD") || cat.includes("Datos")) return <Database className="text-indigo-500 w-6 h-6" />;
    if (cat.includes("Despliegue")) return <Server className="text-indigo-500 w-6 h-6" />;
    if (cat.includes("Seguridad")) return <Shield className="text-indigo-500 w-6 h-6" />;
    if (cat.includes("API") || cat.includes("Requerimientos")) return <Code2 className="text-indigo-500 w-6 h-6" />;
    if (cat.includes("Diseño")) return <LayoutTemplate className="text-indigo-500 w-6 h-6" />;
    if (cat === "QUOTE" || cat === "Cotización") return <FileText className="text-amber-500 w-6 h-6" />;
    if (cat === "CONTRACT" || cat === "Contrato") return <FileDown className="text-emerald-500 w-6 h-6" />;
    return <FileText className="text-indigo-500 w-6 h-6" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Documentos del Proyecto</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Crear Manualmente
          </button>
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md transition-all"
          >
            <MessageSquare className="w-4 h-4" /> Generar Cotización (IA)
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-[#0f1424] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No hay documentos en este proyecto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {getCategoryIcon(doc.category)}
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-1" title={doc.title}>{doc.title}</h4>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{doc.category === "QUOTE" ? "Cotización" : doc.category}</p>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button className="text-xs font-bold text-indigo-500 hover:text-indigo-400">Ver Detalles</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* IA Chat Modal */}
      <Modal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} title="Asistente de Cotizaciones (IA)">
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto space-y-4 p-2 mb-4 text-sm">
            {chatMessages.length === 0 && (
              <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>Hola, soy tu asistente. Cuéntame sobre el proyecto para armar la cotización.</p>
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 ${
                  msg.role === "user" 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none whitespace-pre-wrap"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === "assistant" && (
            <div className="mb-4 text-center">
              <button 
                onClick={handleSaveQuote}
                className="text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-xl transition-all shadow-md"
              >
                Guardar última respuesta como Cotización
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 mt-auto">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Escribe los detalles del proyecto..."
              className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={isGenerating || !chatInput.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Modal>

      {/* Manual Creation Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Crear Documento">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Categoría</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Título</label>
            <input 
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Diagrama de Base de Datos v1"
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contenido o Notas</label>
            <textarea 
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el contenido del documento o pega un enlace a tu archivo..."
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md disabled:opacity-50 transition-colors"
            >
              {isCreating ? "Guardando..." : "Crear Documento"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
