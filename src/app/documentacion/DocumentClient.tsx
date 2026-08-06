"use client";

import React, { useState, useMemo } from "react";
import { 
  Folder, FileText, Plus, Search, Star, Download, X, 
  MoreHorizontal, Code2, Database, Server, Shield, Layers, 
  LayoutTemplate, FileDown, ChevronRight, File, BookOpen,
  ZoomIn, ZoomOut, Printer, Maximize, Filter, ArrowLeft, FolderPlus
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal, ConfirmVariant } from "@/components/ui/ConfirmModal";
import { useRouter } from "next/navigation";

export function DocumentClient({ initialDocs, projects }: { initialDocs: any[], projects: any[] }) {
  const router = useRouter();
  const [docs, setDocs] = useState(initialDocs);
  
  // UI State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [explorerTab, setExplorerTab] = useState("explorador");
  const [projectSearch, setProjectSearch] = useState("");
  const [docSearch, setDocSearch] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Arquitectura");
  const [type, setType] = useState("INTERNAL");
  const [modalProjectId, setModalProjectId] = useState(projects[0]?.id || "");
  
  const [uploadMode, setUploadMode] = useState<"text" | "link" | "file">("text");
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  
  // Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    itemName?: string;
    description?: React.ReactNode;
    warningText?: React.ReactNode;
    confirmText: string;
    variant: ConfirmVariant;
    icon: "file" | "folder" | "alert" | "trash" | "restore";
    onConfirm: () => void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: "",
    confirmText: "",
    variant: "danger",
    icon: "alert",
    onConfirm: () => {},
  });

  const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

  const allCategories = [
    "Cotización", "Contrato", "Requerimientos", "Diseño UI/UX",
    "Arquitectura", "Diagrama ERD", "Guía de Despliegue", 
    "Manual de Usuario", "Documentación API", "Seguridad"
  ];

  // Derived Data
  const filteredProjects = useMemo(() => {
    return projects.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase()));
  }, [projects, projectSearch]);

  const activeProject = projects.find(p => p.id === selectedProjectId);

  const filteredDocs = useMemo(() => {
    let filtered = docs;
    if (selectedProjectId) {
      filtered = filtered.filter(d => d.projectId === selectedProjectId);
    }
    if (docSearch) {
      filtered = filtered.filter(d => d.title.toLowerCase().includes(docSearch.toLowerCase()));
    }
    return filtered;
  }, [docs, selectedProjectId, docSearch]);

  const docsInCurrentView = useMemo(() => {
    if (selectedCategory && !docSearch) {
      return filteredDocs.filter(d => d.category === selectedCategory);
    }
    return filteredDocs;
  }, [filteredDocs, selectedCategory, docSearch]);

  const selectedDoc = docs.find(d => d.id === selectedDocId);

  // Group by category for folders (only show folders that have documents OR all categories if we want to allow uploading to empty folders)
  // Let's show folders that have docs, but maybe we should allow adding to any.
  // We will list folders based on docs that exist in the project, plus maybe a few defaults so it's not empty.
  const categoriesInProject = useMemo(() => {
    const cats = new Set([...filteredDocs.map(d => d.category), ...customFolders]);
    // Add default core categories even if empty, so user can click them to upload
    ["Arquitectura", "Requerimientos", "Diseño UI/UX", "Cotización"].forEach(c => cats.add(c));
    return Array.from(cats).sort();
  }, [filteredDocs, customFolders]);

  // Folder Actions
  const handleCreateFolder = () => {
    const name = window.prompt("Nombre de la nueva carpeta:");
    if (name && name.trim()) {
      setCustomFolders(prev => Array.from(new Set([...prev, name.trim()])));
    }
  };

  const handleRenameFolder = async (e: React.MouseEvent, oldName: string) => {
    e.stopPropagation();
    if (!selectedProjectId) {
      alert("Selecciona un proyecto primero.");
      return;
    }
    const newName = window.prompt(`Renombrar carpeta "${oldName}" a:`, oldName);
    if (!newName || newName.trim() === "" || newName === oldName) return;

    try {
      const res = await fetch("/api/documents/category", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldCategory: oldName, newCategory: newName.trim(), projectId: selectedProjectId })
      });
      if (!res.ok) throw new Error("Error al renombrar");
      
      // Update local state docs
      setDocs(prev => prev.map(d => d.category === oldName && d.projectId === selectedProjectId ? { ...d, category: newName.trim() } : d));
      // Update custom folders
      setCustomFolders(prev => prev.map(f => f === oldName ? newName.trim() : f));
      if (selectedCategory === oldName) setSelectedCategory(newName.trim());
    } catch (err) {
      console.error(err);
      alert("No se pudo renombrar la carpeta.");
    }
  };

  const handleDeleteFolder = (e: React.MouseEvent, categoryName: string) => {
    e.stopPropagation();
    if (!selectedProjectId) {
      alert("Selecciona un proyecto primero.");
      return;
    }
    
    const docsInFolder = docs.filter(d => d.category === categoryName && d.projectId === selectedProjectId).length;
    
    setConfirmConfig({
      isOpen: true,
      title: "Eliminar carpeta",
      itemName: categoryName,
      description: docsInFolder > 0 ? `Contiene ${docsInFolder} documento(s). Se eliminará todo permanentemente.` : "La carpeta está vacía.",
      warningText: "Esta acción no se puede deshacer.",
      confirmText: "Eliminar permanentemente",
      variant: "danger",
      icon: "folder",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isLoading: true }));
        try {
          const res = await fetch(`/api/documents/category?category=${encodeURIComponent(categoryName)}&projectId=${selectedProjectId}`, {
            method: "DELETE"
          });
          
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Error al eliminar");
          }

          setDocs(prev => prev.filter(d => !(d.category === categoryName && d.projectId === selectedProjectId)));
          setCustomFolders(prev => prev.filter(f => f !== categoryName));
          if (selectedCategory === categoryName) setSelectedCategory(null);
          closeConfirm();
        } catch (err: any) {
          console.error(err);
          alert("No se pudo eliminar la carpeta: " + err.message);
          setConfirmConfig(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  // Document Actions
  const handleRenameDoc = async (id: string, oldTitle: string) => {
    const newTitle = window.prompt("Renombrar documento a:", oldTitle);
    if (!newTitle || newTitle.trim() === "" || newTitle === oldTitle) return;

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() })
      });
      if (!res.ok) throw new Error("Error al renombrar");
      
      setDocs(prev => prev.map(d => d.id === id ? { ...d, title: newTitle.trim() } : d));
    } catch (err) {
      console.error(err);
      alert("No se pudo renombrar el documento.");
    }
  };

  const handleDeleteDoc = (id: string) => {
    const docToDel = docs.find(d => d.id === id);
    if (!docToDel) return;

    setConfirmConfig({
      isOpen: true,
      title: "Eliminar documento",
      itemName: docToDel.title,
      description: "Este documento será eliminado de forma permanente.",
      warningText: "Esta acción no se puede deshacer.",
      confirmText: "Eliminar permanentemente",
      variant: "danger",
      icon: "file",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isLoading: true }));
        try {
          const res = await fetch(`/api/documents/${id}`, {
            method: "DELETE"
          });
          
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Error al eliminar");
          }
          
          setDocs(prev => prev.filter(d => d.id !== id));
          if (selectedDocId === id) setSelectedDocId(null);
          closeConfirm();
        } catch (err: any) {
          console.error(err);
          alert("No se pudo eliminar el documento: " + err.message);
          setConfirmConfig(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  // Handlers
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    let finalFileUrl = uploadMode === "link" ? fileUrl : undefined;
    let finalContent = uploadMode === "text" ? content : undefined;

    try {
      // 1. Upload File if mode is "file"
      if (uploadMode === "file" && selectedFile) {
        const uploadRes = await fetch(`/api/upload/document?filename=${encodeURIComponent(selectedFile.name)}`, {
          method: "POST",
          headers: {
            "Content-Type": selectedFile.type || "application/octet-stream"
          },
          body: selectedFile
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Error al subir el archivo");
        finalFileUrl = uploadData.url;
      }

      // 2. Create Document record
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          category, 
          type: uploadMode === "text" ? "INTERNAL" : "FILE", 
          content: finalContent, 
          fileUrl: finalFileUrl,
          projectId: modalProjectId 
        })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Error al crear el documento");

      const p = projects.find(x => x.id === modalProjectId);
      if (p) resData.project = p;
      setDocs([resData, ...docs]);
      setIsModalOpen(false);
      // Reset form
      setTitle(""); setContent(""); setFileUrl(""); setSelectedFile(null);
      setFileInputKey(prev => prev + 1);
      
      // Select the category folder and the newly created doc automatically
      setSelectedCategory(category);
      setSelectedDocId(resData.id);
      router.refresh();

    } catch (e: any) {
      console.error(e);
      alert(`Ocurrió un error: ${e.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const openUploadModal = (cat?: string) => {
    setModalProjectId(activeProject?.id || "");
    setCategory(cat || selectedCategory || "Arquitectura");
    setIsModalOpen(true);
  };

  const getDocIcon = (cat: string) => {
    if (cat.includes("Arquitectura")) return <Layers className="text-red-500 w-4 h-4" />;
    if (cat.includes("ERD") || cat.includes("Datos")) return <Database className="text-blue-500 w-4 h-4" />;
    if (cat.includes("Despliegue")) return <Server className="text-slate-500 w-4 h-4" />;
    if (cat.includes("Seguridad")) return <Shield className="text-amber-500 w-4 h-4" />;
    if (cat.includes("API") || cat.includes("Requerimientos")) return <Code2 className="text-indigo-500 w-4 h-4" />;
    if (cat.includes("Diseño")) return <LayoutTemplate className="text-pink-500 w-4 h-4" />;
    if (cat === "QUOTE" || cat === "Cotización") return <FileText className="text-amber-500 w-4 h-4" />;
    if (cat === "CONTRACT" || cat === "Contrato") return <FileDown className="text-emerald-500 w-4 h-4" />;
    return <FileText className="text-indigo-500 w-4 h-4" />;
  };

  const getFileType = (doc: any) => {
    if (doc.type === "QUOTE") return "QUOTE";
    if (doc.fileUrl) {
      const url = doc.fileUrl.toLowerCase();
      if (url.endsWith('.pdf')) return 'PDF';
      if (url.endsWith('.vsdx')) return 'VSDX';
      if (url.endsWith('.docx') || url.endsWith('.doc')) return 'DOCX';
      if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'IMG';
      if (url.startsWith('http')) return 'LINK';
      return 'FILE';
    }
    return 'TXT'; // Simulated internal text doc
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] min-h-[600px] bg-slate-50 dark:bg-[#0A0D14] text-slate-800 dark:text-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0A0D14]">
        <div>
          <div className="text-[11px] text-slate-500 font-medium mb-1 flex items-center gap-2">
            <span>Proyectos</span> <ChevronRight className="w-3 h-3" /> 
            <span className={activeProject ? "text-slate-700 dark:text-slate-300 font-bold" : ""}>{activeProject?.name || "Global"}</span> <ChevronRight className="w-3 h-3" /> 
            <span>Documentación</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Documentación del Proyecto</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gestiona todos los documentos relacionados con este proyecto en un solo lugar.</p>
        </div>
        <button 
          onClick={() => openUploadModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Subir Documento</span>
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Column 1: Projects Sidebar */}
        <div className="hidden md:flex w-[220px] lg:w-[280px] flex-shrink-0 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0f1424]/50 flex flex-col">
          <div className="p-4">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-3">PROYECTOS</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar proyectos..." 
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full bg-slate-100 dark:bg-[#1A1F2E] border border-slate-200 dark:border-slate-800/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
            <button
              onClick={() => { setSelectedProjectId(null); setSelectedCategory(null); setSelectedDocId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${!selectedProjectId ? 'bg-slate-100 dark:bg-[#1A1F2E] border border-slate-200 dark:border-slate-700/50 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-[#1A1F2E]/50 border border-transparent'}`}
            >
              <div className={`p-2 rounded-md ${!selectedProjectId ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold truncate ${!selectedProjectId ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>Todos los Proyectos</div>
                <div className="text-[10px] text-slate-500">{docs.length} docs</div>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${!selectedProjectId ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'}`} />
            </button>
            
            {filteredProjects.map((p) => {
              const pDocsCount = docs.filter(d => d.projectId === p.id).length;
              const isSelected = selectedProjectId === p.id;
              
              return (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProjectId(p.id); setSelectedCategory(null); setSelectedDocId(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${isSelected ? 'bg-slate-100 dark:bg-[#1A1F2E] border border-slate-200 dark:border-slate-700/50 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-[#1A1F2E]/50 border border-transparent'}`}
                >
                  <div className={`p-2 rounded-md ${isSelected ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    <Folder className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold truncate ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{p.name}</div>
                    <div className="text-[10px] text-slate-500">{pDocsCount} docs</div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: File Explorer */}
        <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-[#0f1424]/30">
          <div className="flex justify-between items-center px-6 pt-4 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-6">
              {['Explorador', 'Recientes', 'Favoritos'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setExplorerTab(tab.toLowerCase()); setSelectedCategory(null); setSelectedDocId(null); }}
                  className={`pb-3 text-xs font-semibold border-b-2 transition-all ${explorerTab === tab.toLowerCase() ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button 
              onClick={handleCreateFolder}
              className="pb-3 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <FolderPlus className="w-3.5 h-3.5" /> Nueva Carpeta
            </button>
          </div>
          
          <div className="p-4 flex flex-col gap-3">
            {/* Folder Navigation Breadcrumb */}
            {selectedCategory && !docSearch && (
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => { setSelectedCategory(null); setSelectedDocId(null); }}
                  className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> 
                  <span className="flex items-center gap-1.5"><Folder className="w-4 h-4 text-indigo-500 fill-indigo-500/20" /> {selectedCategory}</span>
                </button>
                <button 
                  onClick={() => openUploadModal(selectedCategory)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar a esta carpeta
                </button>
              </div>
            )}
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Buscar documentos..." 
                  value={docSearch}
                  onChange={(e) => { setDocSearch(e.target.value); if(e.target.value) setSelectedCategory(null); }}
                  className="w-full bg-slate-50 dark:bg-[#1A1F2E] border border-slate-200 dark:border-slate-800/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
              <button className="p-2 rounded-lg bg-slate-50 dark:bg-[#1A1F2E] border border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white/95 dark:bg-[#0f1424]/95 backdrop-blur z-10 border-b border-slate-200 dark:border-slate-800/80 shadow-sm">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24">Tipo</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24 hidden lg:table-cell">Tamaño</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-28 hidden sm:table-cell">Actualizado</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800/50">
                {/* 1. Show Categories as Folders (only if no category selected and no search) */}
                {!selectedCategory && !docSearch && categoriesInProject.map((cat, idx) => {
                  const catDocsCount = filteredDocs.filter(d => d.category === cat).length;
                  return (
                    <tr 
                      key={`folder-${cat}`} 
                      onClick={() => setSelectedCategory(cat)}
                      className="hover:bg-slate-50 dark:hover:bg-[#1A1F2E]/50 group cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Folder className="w-5 h-5 text-indigo-500 fill-indigo-500/20 flex-shrink-0" />
                          <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors truncate">
                            {String(idx + 1).padStart(2, '0')}. {cat}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-medium">—</td>
                      <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{catDocsCount} items</td>
                      <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">—</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleRenameFolder(e, cat)}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Renombrar carpeta"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                          <button 
                            onClick={(e) => handleDeleteFolder(e, cat)}
                            className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Eliminar carpeta y su contenido"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {/* 2. Show Documents (either all if searching, or only those in selectedCategory) */}
                {(selectedCategory || docSearch) && docsInCurrentView.map((doc) => {
                  const isSelected = selectedDocId === doc.id;
                  return (
                    <tr 
                      key={doc.id} 
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`group cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-[#1A1F2E]/50'}`}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">{getDocIcon(doc.category)}</div>
                          <span className={`font-semibold truncate transition-colors ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                            {doc.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">{getFileType(doc)}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden lg:table-cell">{doc.content ? `${(doc.content.length / 1024).toFixed(1)} KB` : '1.2 MB'}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell">{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRenameDoc(doc.id, doc.title); }}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Renombrar documento"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id); }}
                            className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Eliminar documento"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {docsInCurrentView.length === 0 && (selectedCategory || docSearch) && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
                <File className="w-12 h-12 mb-3 opacity-50 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Carpeta vacía</p>
                <p className="text-xs mt-1">No se encontraron documentos en esta vista.</p>
                {selectedCategory && (
                   <button 
                     onClick={() => openUploadModal(selectedCategory)}
                     className="mt-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                   >
                     Crear el primero
                   </button>
                )}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-[#0f1424]/80">
            <span>{!selectedCategory && !docSearch ? categoriesInProject.length + " carpetas" : docsInCurrentView.length + " elementos"}</span>
            {selectedDocId && <span>1 seleccionado</span>}
          </div>
        </div>

        {/* Column 3: Preview Panel (ONLY VISIBLE IF A DOCUMENT IS SELECTED) */}
        {selectedDocId && (
          <div className="flex-1 md:flex-none md:w-[320px] lg:w-[400px] xl:w-[500px] flex flex-col bg-slate-50 dark:bg-[#0f1424] relative border-l border-slate-200 dark:border-slate-800/80 shadow-2xl z-20 overflow-hidden">
            {!selectedDoc ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                <p className="text-xs">Cargando documento...</p>
              </div>
            ) : (
              <>
                {/* Preview Toolbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#1A1F2E]">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-slate-100 dark:bg-white/10">{getDocIcon(selectedDoc.category)}</div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[200px]">{selectedDoc.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleRenameDoc(selectedDoc.id, selectedDoc.title)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/5 rounded transition-colors" title="Renombrar"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                    <button onClick={() => handleDeleteDoc(selectedDoc.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white/5 rounded transition-colors" title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                    <button className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded transition-colors"><Star className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded transition-colors"><Download className="w-4 h-4" /></button>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                    <button onClick={() => setSelectedDocId(null)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white/5 rounded transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                </div>
                
                {/* Document Tools */}
                <div className="flex items-center justify-center gap-4 py-2 border-b border-slate-200 dark:border-slate-800/50 bg-slate-100 dark:bg-[#0f1424] text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <span>1 / 1</span>
                  <div className="w-px h-3 bg-slate-300 dark:bg-slate-700"></div>
                  <div className="flex items-center gap-3">
                    <button className="hover:text-indigo-600 dark:hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
                    <span>100%</span>
                    <button className="hover:text-indigo-600 dark:hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="w-px h-3 bg-slate-300 dark:bg-slate-700"></div>
                  <button className="hover:text-indigo-600 dark:hover:text-white"><Printer className="w-3.5 h-3.5" /></button>
                  <button className="hover:text-indigo-600 dark:hover:text-white"><Maximize className="w-3.5 h-3.5" /></button>
                </div>

                {/* Preview Content Area */}
                <div className="flex-1 overflow-auto bg-slate-200 dark:bg-[#0a0d14] p-4 lg:p-6 custom-scrollbar flex justify-center items-start">
                  {/* Paper sheet representation */}
                  <div className="w-full max-w-[800px] bg-white min-h-[600px] rounded-lg shadow-xl p-6 lg:p-10 text-slate-800 text-sm border border-slate-200">
                    <div className="border-b border-slate-200 pb-4 mb-6">
                      <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        {selectedDoc.project?.name || "NEXUS SYSTEM"}
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[8px]">{selectedDoc.category}</span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 mb-1">{selectedDoc.title}</h2>
                    </div>
                    
                    <div className="prose prose-sm max-w-none prose-slate">
                      {selectedDoc.fileUrl ? (
                        selectedDoc.fileUrl.startsWith("http") && !selectedDoc.fileUrl.startsWith(window.location.origin) && !selectedDoc.fileUrl.includes("/uploads/") ? (
                          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <File className="w-12 h-12 mb-4 text-indigo-400" />
                            <p className="font-semibold text-slate-700">Enlace Externo</p>
                            <a href={selectedDoc.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-4 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-500 transition-colors">
                              Abrir Enlace
                            </a>
                          </div>
                        ) : selectedDoc.fileUrl.toLowerCase().endsWith(".pdf") ? (
                           <div className="flex flex-col gap-2">
                             <div className="flex justify-end">
                               <a href={selectedDoc.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
                                 <File className="w-3 h-3" /> Abrir PDF en pestaña nueva
                               </a>
                             </div>
                             <iframe src={selectedDoc.fileUrl} className="w-full h-[600px] border-0 rounded-lg bg-white shadow-inner" title={selectedDoc.title} />
                           </div>
                        ) : selectedDoc.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                           <img src={selectedDoc.fileUrl} alt={selectedDoc.title} className="max-w-full h-auto rounded-lg shadow-sm" />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <File className="w-12 h-12 mb-4 text-slate-300" />
                            <p className="font-semibold text-slate-600">Vista previa no disponible para este formato.</p>
                            <a href={selectedDoc.fileUrl} download className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-100 transition-colors">
                              Descargar Archivo
                            </a>
                          </div>
                        )
                      ) : selectedDoc.content ? (
                        <div className="whitespace-pre-wrap leading-relaxed text-slate-700">{selectedDoc.content}</div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                          <File className="w-12 h-12 mb-4 text-slate-300" />
                          <p className="font-semibold text-slate-600">Documento vacío.</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-20 pt-4 border-t border-slate-100 flex justify-between text-[9px] font-bold text-slate-400">
                      <span>DOCUMENTO CONFIDENCIAL - NEXUS OPS</span>
                      <span>PÁG 1</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Manual Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Documento">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Proyecto</label>
            <select 
              required
              value={modalProjectId} 
              onChange={(e) => setModalProjectId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">Selecciona un proyecto</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ubicación (Categoría)</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nombre del Documento</label>
            <input 
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Diagrama de Base de Datos v1"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Documento</label>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl gap-1">
              <button 
                type="button" 
                onClick={() => setUploadMode("text")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${uploadMode === "text" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Notas / Texto
              </button>
              <button 
                type="button" 
                onClick={() => setUploadMode("link")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${uploadMode === "link" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Enlace Externo
              </button>
              <button 
                type="button" 
                onClick={() => setUploadMode("file")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${uploadMode === "file" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Subir Archivo
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {uploadMode === "text" ? "Contenido" : uploadMode === "link" ? "URL del Enlace" : "Archivo Adjunto"}
            </label>
            
            {uploadMode === "text" && (
              <textarea 
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe el contenido aquí o adjunta notas..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none resize-none"
              />
            )}
            
            {uploadMode === "link" && (
              <input 
                type="url"
                required
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://ejemplo.com/documento"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            )}

            {uploadMode === "file" && (
              <div className="w-full bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <input 
                  key={fileInputKey}
                  type="file"
                  required
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                {selectedFile && <p className="text-[10px] text-emerald-600 font-bold mt-2">Archivo listo: {selectedFile.name}</p>}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md disabled:opacity-50 transition-colors"
            >
              {isCreating ? "Guardando..." : "Crear y Subir"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        {...confirmConfig} 
        onClose={closeConfirm} 
      />
    </div>
  );
}
