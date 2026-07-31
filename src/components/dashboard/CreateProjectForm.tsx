import React, { useState, useEffect } from "react";
import { createProject } from "@/core/application/actions/projectActions";
import { getWorkspaceTaskStatuses } from "@/core/application/actions/taskStatusActions";

export function CreateProjectForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedBanner, setSelectedBanner] = useState("");
  const [customBanner, setCustomBanner] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [initialTasks, setInitialTasks] = useState<Array<{ title: string; status: string }>>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("TODO");
  const [taskStatuses, setTaskStatuses] = useState<any[]>([]);

  useEffect(() => {
    getWorkspaceTaskStatuses().then((res) => {
      if (res.success && res.data) {
        setTaskStatuses(res.data);
      }
    });
  }, []);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      setInitialTasks([...initialTasks, { title: newTaskTitle.trim(), status: newTaskStatus }]);
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
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const rawTechs = formData.get("technologies") as string;
    const estimatedHours = Number(formData.get("estimatedHours"));
    const status = formData.get("status") as string;
    const startDate = formData.get("startDate") ? new Date(formData.get("startDate") as string) : undefined;
    const endDate = formData.get("endDate") ? new Date(formData.get("endDate") as string) : undefined;

    const bannerToSave = customBanner || selectedBanner;

    let technologiesArr: string[] = [];
    if (rawTechs) {
      technologiesArr = rawTechs.split(",").map((t) => t.trim()).filter(Boolean);
    }

    try {
      const res = await createProject({
        name,
        code,
        category,
        description,
        technologies: JSON.stringify(technologiesArr),
        estimatedHours: estimatedHours || 0,
        bannerUrl: bannerToSave || undefined,
        status: status || "DISCOVERY",
        initialTasks: initialTasks.map(t => JSON.stringify(t)),
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Error al crear el proyecto");
      }
    } catch (err: any) {
      setError(err.message || "Error al crear proyecto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Nombre del Proyecto *</label>
          <input
            required
            name="name"
            type="text"
            placeholder="Ej. E-Commerce Redesign"
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Código (Máx 4 letras) *</label>
          <input
            required
            name="code"
            type="text"
            maxLength={4}
            placeholder="Ej. ECM"
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none uppercase"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Descripción</label>
        <textarea
          name="description"
          rows={2}
          placeholder="Breve descripción del alcance del proyecto..."
          className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
        ></textarea>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Categoría</label>
          <select
            name="category"
            defaultValue="Web App"
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="Web App">Web App</option>
            <option value="Mobile App">Mobile App</option>
            <option value="SaaS">SaaS</option>
            <option value="E-Commerce">E-Commerce</option>
            <option value="Infraestructura">Infraestructura</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Estado Inicial</label>
          <select
            name="status"
            defaultValue="DEVELOPMENT"
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="DISCOVERY">Descubrimiento</option>
            <option value="DESIGN">En Diseño</option>
            <option value="DEVELOPMENT">En Desarrollo</option>
            <option value="TESTING">En Pruebas</option>
            <option value="DEPLOYED">En Producción</option>
            <option value="PAUSED">En Pausa</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Fecha de Inicio</label>
          <input
            name="startDate"
            type="date"
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Fecha de Finalización</label>
          <input
            name="endDate"
            type="date"
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Tecnologías (separadas por coma)</label>
          <input
            name="technologies"
            type="text"
            placeholder="Next.js, TypeScript, Tailwind, Prisma"
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Horas Estimadas</label>
          <input
            name="estimatedHours"
            type="number"
            min="0"
            placeholder="Ej. 120"
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Imagen / Portada del Proyecto</label>
        <div className="grid grid-cols-5 gap-2 mb-2">
          {PRESET_BANNERS.map((url, idx) => (
            <div 
              key={idx} 
              onClick={() => { setSelectedBanner(url); setCustomBanner(""); }}
              className={`h-12 rounded-lg cursor-pointer overflow-hidden border-2 transition-all ${selectedBanner === url ? "border-indigo-500 scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
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
          <select
            value={newTaskStatus}
            onChange={(e) => setNewTaskStatus(e.target.value)}
            className="w-[140px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            {taskStatuses.length > 0 ? (
              taskStatuses.map((s) => (
                <option key={s.id} value={s.key}>{s.name}</option>
              ))
            ) : (
              <>
                <option value="TODO">En Desarrollo</option>
                <option value="IN_PROGRESS">En Ejecución</option>
                <option value="TESTING">En Pruebas</option>
                <option value="PAUSED">En Pausa</option>
                <option value="COMPLETED">Completado</option>
              </>
            )}
          </select>
          <button
            type="button"
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shrink-0 cursor-pointer"
          >
            Añadir
          </button>
        </div>
        {initialTasks.length > 0 && (
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {initialTasks.map((t, idx) => {
              const matchedStatus = taskStatuses.find(s => s.key === t.status)?.name || (t.status === "TODO" ? "En Desarrollo" : t.status === "IN_PROGRESS" ? "En Ejecución" : t.status);
              return (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-700 dark:text-slate-300 truncate">{t.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {matchedStatus}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:text-slate-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? "Creando..." : "Crear Proyecto"}
        </button>
      </div>
    </form>
  );
}
