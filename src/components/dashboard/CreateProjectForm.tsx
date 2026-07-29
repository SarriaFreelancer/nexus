import React, { useState } from "react";
import { createProject } from "@/core/application/actions/projectActions";

export function CreateProjectForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedBanner, setSelectedBanner] = useState("");
  const [customBanner, setCustomBanner] = useState("");

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
    const bannerToSave = customBanner || selectedBanner;
    
    const data = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      technologies: JSON.stringify((formData.get("technologies") as string).split(",").map(t => t.trim())),
      estimatedHours: Number(formData.get("estimatedHours")),
      status: formData.get("status") as string,
      bannerUrl: bannerToSave || undefined,
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
        <div className="grid grid-cols-5 gap-2 mb-2">
          {PRESET_BANNERS.map((url, idx) => (
            <div 
              key={idx} 
              onClick={() => { setSelectedBanner(url); setCustomBanner(""); }}
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
          onChange={(e) => { setCustomBanner(e.target.value); setSelectedBanner(""); }}
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
