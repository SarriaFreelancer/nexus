"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getProjects } from "@/core/application/actions/projectActions";
import { getUserPreferences, updateUserPreference } from "@/core/application/actions/userActions";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { FolderKanban, Plus, Search, Filter, GitBranch, ExternalLink, Globe, Layers, Loader2, Edit3, Grid, List as ListIcon, Calendar, SortDesc } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CreateProjectForm } from "@/components/dashboard/CreateProjectForm";
import { EditProjectForm } from "@/components/dashboard/EditProjectForm";
import { translateProjectStatus } from "@/lib/utils";

export default function ProyectosPage() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("TODOS");
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<any | null>(null);
  
  // Preferences State
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchProjectsAndPrefs = async () => {
    setIsLoading(true);
    const [projRes, prefRes] = await Promise.all([
      getProjects(),
      getUserPreferences()
    ]);
    
    if (projRes.success && projRes.data) {
      setDbProjects(projRes.data);
    }
    
    if (prefRes.success && prefRes.data) {
      const prefs: any = prefRes.data;
      if (prefs.projectsViewMode) setViewMode(prefs.projectsViewMode);
      if (prefs.projectsSortBy) setSortBy(prefs.projectsSortBy);
      if (prefs.projectsPerPage) setItemsPerPage(prefs.projectsPerPage);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjectsAndPrefs();
  }, []);

  const handleViewModeChange = (mode: "GRID" | "LIST") => {
    setViewMode(mode);
    updateUserPreference("projectsViewMode", mode);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateUserPreference("projectsSortBy", sort);
  };

  const handleItemsPerPageChange = (num: number) => {
    setItemsPerPage(num);
    setCurrentPage(1); // reset to first page
    updateUserPreference("projectsPerPage", num);
  };

  const filtered = dbProjects.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const translatedStatus = translateProjectStatus(p.status);
    const matchesStatus = selectedStatus === "TODOS" || translatedStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedAndFiltered = [...filtered].sort((a, b) => {
    if (sortBy === "NEWEST") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "OLDEST") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === "NAME") return a.name.localeCompare(b.name);
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedAndFiltered.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  
  const paginatedProjects = sortedAndFiltered.slice(
    (validCurrentPage - 1) * itemsPerPage,
    validCurrentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Proyecto">
        <CreateProjectForm 
          onCancel={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProjectsAndPrefs();
          }} 
        />
      </Modal>

      <Modal isOpen={!!editProject} onClose={() => setEditProject(null)} title="Editar Proyecto" width="max-w-[1000px]">
        {editProject && (
          <EditProjectForm 
            project={editProject}
            onSuccess={async (shouldClose = true) => {
              if (shouldClose) {
                setEditProject(null);
                await fetchProjectsAndPrefs();
              } else {
                // If not closing, fetch fresh data and update both dbProjects and editProject
                const [projRes] = await Promise.all([
                  getProjects()
                ]);
                if (projRes.success && projRes.data) {
                  setDbProjects(projRes.data);
                  const updatedProject = projRes.data.find((p: any) => p.id === editProject.id);
                  if (updatedProject) {
                    setEditProject(updatedProject);
                  }
                }
              }
            }}
            onCancel={() => setEditProject(null)} 
          />
        )}
      </Modal>

      {/* Header & Controls */}
      <div className="flex flex-col gap-6 mb-2">
        {/* Top Header: Title and Primary Action */}
        <div className="flex justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Proyectos
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gestiona todos tus proyectos en un solo lugar
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </button>
        </div>

        {/* Bottom Header: Filters and Toggles */}
        <div className="flex flex-col gap-4 mt-4">
          {/* Left: Status Filters */}
          <div className="flex overflow-x-auto pb-2 gap-2 flex-nowrap custom-scrollbar shrink-0 w-full">
            {["Todos", "Descubrimiento", "En Diseño", "En Desarrollo", "En Pruebas", "En Producción", "Mantenimiento", "En Pausa", "Completado", "Finalizado"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st === "Todos" ? "TODOS" : st)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all ${
                  (selectedStatus === "TODOS" && st === "Todos") || selectedStatus === st
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-slate-100 dark:bg-[#161b2c] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Right: View Toggles & Dropdowns & Actions */}
          <div className="flex items-center gap-4 w-full justify-start md:justify-end">
          <div className="flex items-center gap-4 rounded-xl p-1 bg-[#0f1424] border border-slate-800/80">
            <div className="flex items-center p-1 bg-[#161b2c] rounded-lg">
            <button 
              onClick={() => handleViewModeChange("GRID")}
              className={`p-1.5 rounded-md shadow-sm transition-colors ${viewMode === "GRID" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleViewModeChange("LIST")}
              className={`p-1.5 rounded-md shadow-sm transition-colors ${viewMode === "LIST" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors border-l border-slate-800 pl-4">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          
          <div className="relative flex items-center border-l border-slate-800 pl-4 pr-2">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-transparent text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer outline-none w-full pr-6"
            >
              <option value="NEWEST" className="bg-[#161b2c] text-slate-200">Más recientes</option>
              <option value="OLDEST" className="bg-[#161b2c] text-slate-200">Más antiguos</option>
              <option value="NAME" className="bg-[#161b2c] text-slate-200">Por Nombre</option>
            </select>
            <SortDesc className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
          </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20 text-indigo-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
      <>
        {viewMode === "GRID" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {paginatedProjects.map((proj: any) => {
              const translatedStatus = translateProjectStatus(proj.status);
              
              let progress = 0;
              if (proj.tasks && proj.tasks.length > 0) {
                const completed = proj.tasks.filter((t: any) => t.status === "DEPLOYING" || t.status === "PRODUCTION").length;
                progress = Math.round((completed / proj.tasks.length) * 100);
              }

              // Safe parsing for technologies JSON
              let techList = [];
              try {
                techList = Array.isArray(proj.technologies) ? proj.technologies : typeof proj.technologies === "string" ? JSON.parse(proj.technologies) : [];
              } catch (e) {
                techList = [];
              }

              const totalTasks = proj.tasks ? proj.tasks.length : 0;
              const completedTasks = proj.tasks ? proj.tasks.filter((t: any) => t.status === "DEPLOYING" || t.status === "PRODUCTION" || t.status === "MAINTENANCE").length : 0;
              const startDateStr = new Date(proj.startDate || proj.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
              const endDateStr = proj.endDate ? new Date(proj.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : "--";
              
              const currentVersion = proj.versions && proj.versions.length > 0 ? proj.versions[0].version : null;
              
              return (
              <div
                key={proj.id}
                className="flex flex-col bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xl hover:border-indigo-500/40 transition-all group"
              >
                {/* Top Image Banner */}
                <div className="relative h-44 w-full bg-slate-900 group-hover:opacity-95 transition-opacity">
                  {proj.bannerUrl ? (
                    <img src={proj.bannerUrl} alt={proj.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-slate-900/80" />
                  )}
                  {/* Gradient Overlay for bottom text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1424] via-transparent to-black/30" />
                  
                  {/* Top left badge */}
                  {proj.priority === "HIGH" || proj.priority === "URGENT" ? (
                    <div className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                      DESTACADO
                    </div>
                  ) : null}

                  {/* Top right actions */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 text-white/70">
                    <button className="h-7 w-7 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); setEditProject(proj); }}
                      className="h-7 w-7 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                  </div>

                  {/* Floating Code Badge */}
                  <div className="absolute -bottom-4 left-5 h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 border-4 border-[#0f1424] flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-[11px] text-center leading-tight tracking-wider">
                      {proj.code}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 pt-6 flex-1 flex flex-col">
                  {/* Header Info */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link href={`/proyectos/${proj.id}`} className="hover:text-indigo-400 transition-colors">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base line-clamp-1">
                        {proj.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      {currentVersion && (
                        <Badge variant="purple" size="md">
                          {currentVersion}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          translatedStatus === "En Desarrollo"
                            ? "indigo"
                            : translatedStatus === "En Diseño"
                            ? "blue"
                            : translatedStatus === "En Pruebas"
                            ? "amber"
                            : "neutral"
                        }
                        size="md"
                      >
                        {translatedStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mb-4">
                    Cliente: {proj.client?.company || "Sin cliente"}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 dark:text-slate-400">Progreso del proyecto</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-5 mt-auto">
                    {techList.slice(0, 4).map((t: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                    {techList.length > 4 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        +{techList.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Footer Row */}
                  <div className="flex items-end justify-between border-t border-slate-200 dark:border-slate-800/60 pt-4">
                    <div className="flex items-center gap-5">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                          Equipo
                        </span>
                        <AvatarGroup users={proj.team || []} limit={3} />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">Tareas</span>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{completedTasks}/{totalTasks}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">Fecha inicio</span>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{startDateStr}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">Fecha fin</span>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{endDateStr}</p>
                      </div>
                    </div>

                    <Link href={`/proyectos/${proj.id}`} className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors border border-indigo-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
                    </Link>
                  </div>
                </div>
              </div>
              )})}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginatedProjects.map((proj: any) => {
              const translatedStatus = translateProjectStatus(proj.status);
              const totalTasks = proj.tasks ? proj.tasks.length : 0;
              const completedTasks = proj.tasks ? proj.tasks.filter((t: any) => t.status === "DEPLOYING" || t.status === "PRODUCTION").length : 0;
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              const startDateStr = new Date(proj.startDate || proj.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
              const endDateStr = proj.endDate ? new Date(proj.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : "--";
              const currentVersion = proj.versions && proj.versions.length > 0 ? proj.versions[0].version : null;
              
              return (
                <div key={proj.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800/80 rounded-xl hover:border-indigo-500/40 transition-colors group">
                  <div className="flex items-center gap-4 w-[35%] shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-xs">{proj.code}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/proyectos/${proj.id}`} className="hover:text-indigo-400 transition-colors truncate">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{proj.name}</h3>
                        </Link>
                        {currentVersion && (
                          <Badge variant="purple" size="sm" className="shrink-0">{currentVersion}</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Cliente: {proj.client?.company || "Sin cliente"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-[35%] shrink-0 pl-4 border-l border-slate-200 dark:border-slate-800/80">
                    <div className="w-[110px] shrink-0">
                      <Badge
                        variant={
                          translatedStatus === "En Desarrollo" ? "indigo" :
                          translatedStatus === "En Diseño" ? "blue" :
                          translatedStatus === "En Pruebas" ? "amber" : "neutral"
                        }
                        size="sm"
                        className="w-full justify-center"
                      >
                        {translatedStatus.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 max-w-[150px]">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-slate-500">Progreso</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-6 w-[30%] shrink-0">
                    <AvatarGroup users={proj.team || []} limit={3} />
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-slate-400">Inicio</p>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{startDateStr}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-slate-400">Fin</p>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{endDateStr}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={(e) => { e.preventDefault(); setEditProject(proj); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <Link href={`/proyectos/${proj.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-4 mt-8 gap-4">
            <span className="text-[13px] text-slate-500 dark:text-slate-400">
              Mostrando {(validCurrentPage - 1) * itemsPerPage + (sortedAndFiltered.length > 0 ? 1 : 0)} a {Math.min(validCurrentPage * itemsPerPage, sortedAndFiltered.length)} de {sortedAndFiltered.length} proyectos
            </span>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={validCurrentPage === 1}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161b2c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`h-8 w-8 flex items-center justify-center rounded-lg font-medium text-[13px] shadow-sm transition-colors ${
                      validCurrentPage === i + 1 
                        ? "bg-indigo-600 text-white" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161b2c]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161b2c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
              Mostrar
              <select 
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="bg-white dark:bg-[#161b2c] border border-slate-200 dark:border-slate-800/80 px-2.5 py-1.5 rounded-md text-slate-700 dark:text-slate-300 transition-colors outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
              por página
            </div>
          </div>
        )}
      </>
      )}
    </div>
  );
}
