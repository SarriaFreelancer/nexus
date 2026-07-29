import React, { useState } from "react";
import { createProject } from "@/core/application/actions/projectActions";

export function CreateProjectForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedBanner, setSelectedBanner] = useState("");
  const [customBanner, setCustomBanner] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [initialTasks, setInitialTasks] = useState<string[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      setInitialTasks([...initialTasks, newTaskTitle.trim()]);
      setNewTaskTitle("");
    }
  };
  const handleRemoveTask = (idx: number) => {
    setInitialTasks(initialTasks.filter((_, i) => i !== idx));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setCustomBanner("");
      setSelectedBanner("");
    }
  };

  const PRESET_BANNERS = [
    "https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    let bannerToSave = customBanner || selectedBanner;
    
    if (file) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          bannerToSave = uploadData.url;
        } else {
          setError(uploadData.error || "Error al subir imagen");
          setLoading(false);
          return;
        }
      } catch (err) {
        setError("Error de conexión al subir imagen");
        setLoading(false);
        return;
      }
    }
    
    const data = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      technologies: JSON.stringify((formData.get("technologies") as string).split(",").map(t => t.trim())),
      estimatedHours: Number(formData.get("estimatedHours")),
      status: formData.get("status") as string,
      bannerUrl: bannerToSave || undefined,
      startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string).toISOString() : undefined,
      endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string).toISOString() : undefined,
      initialTasks,
    };

    try {
      const res = await createProject(data as any);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Error al crear proyecto");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
      {error && <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl">{error}</div>}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Nombre del Proyecto</label>
          <input required name="name" type="text" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" placeholder="Ej: Nexus CRM" />
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Código (Máx 4 letras)</label>
          <input required name="code" type="text" maxLength={4} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none uppercase" placeholder="NEX" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Descripción</label>
        <textarea name="description" rows={3} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none resize-none" placeholder="Breve descripción del proyecto..."></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Categoría</label>
          <select name="category" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none">
            <option value="Web App">Web App</option>
            <option value="Mobile App">Mobile App</option>
            <option value="SaaS">SaaS</option>
            <option value="E-Commerce">E-Commerce</option>
            <option value="Infraestructura">Infraestructura</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Estado Inicial</label>
          <select name="status" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none">
            <option value="DISCOVERY">Descubrimiento</option>
            <option value="DESIGN">En Diseño</option>
            <option value="DEVELOPMENT">En Desarrollo</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Imagen / Portada del Proyecto</label>
        
        <div className="flex gap-4 items-end mb-2">
          <div className="flex-1">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-500/20 dark:file:text-indigo-400" 
            />
          </div>
          {file && (
            <div className="h-10 w-16 shrink-0 rounded-lg overflow-hidden border-2 border-indigo-500">
              <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2 mb-2 mt-2">
          {PRESET_BANNERS.map((url, idx) => (
            <div 
              key={idx} 
              onClick={() => { setSelectedBanner(url); setCustomBanner(""); setFile(null); }}
              className={`h-16 rounded-lg cursor-pointer overflow-hidden border-2 transition-all ${selectedBanner === url ? "border-indigo-500 scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              <img src={url} className="w-full h-full object-cover" alt="Preset" />
            </div>
          ))}
        </div>
        <input 
          type="text" 
          placeholder="O pega una URL personalizada de imagen..." 
          value={customBanner}
          onChange={(e) => { setCustomBanner(e.target.value); setSelectedBanner(""); setFile(null); }}
          className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none text-xs" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Tecnologías (separadas por coma)</label>
          <input name="technologies" type="text" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" placeholder="React, Node.js, MySQL" />
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Horas Estimadas</label>
          <input name="estimatedHours" type="number" min="0" defaultValue={100} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Fecha Inicio (Opcional)</label>
          <input name="startDate" type="date" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Fecha Finalización (Opcional)</label>
          <input name="endDate" type="date" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none" />
        </div>
        </div>

      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
        <label className="text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5">
          Tareas Iniciales (Checklist)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Añadir una tarea para el proyecto..."
            className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTask();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shrink-0"
          >
            Añadir
          </button>
        </div>
        {initialTasks.length > 0 && (
          <div className="space-y-1.5 mt-2">
            {initialTasks.map((title, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 text-xs">
                <span className="text-slate-700 dark:text-slate-200 flex-1">{title}</span>
                <button type="button" onClick={() => handleRemoveTask(idx)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50">
          {loading ? "Creando..." : "Crear Proyecto"}
        </button>
      </div>
    </form>
  );
}
