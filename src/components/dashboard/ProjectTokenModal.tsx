import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";

interface ProjectTokenModalProps {
  projectId: string;
  onClose: () => void;
  onSaved?: (token: string, repoUrl: string) => void;
  currentToken?: string | null;
  currentRepoUrl?: string | null;
}

export default function ProjectTokenModal({ projectId, onClose, onSaved, currentToken, currentRepoUrl }: ProjectTokenModalProps) {
  const [token, setToken] = useState<string>(currentToken || "");
  const [repoUrl, setRepoUrl] = useState<string>(currentRepoUrl || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveToken = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/project-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, gitToken: token, gitRepoUrl: repoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error saving token");
      // After successful save, trigger onSaved if provided
      if (onSaved) {
        onSaved(token, repoUrl);
      } else {
        onClose();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="GitHub Token del Proyecto">
      <div className="space-y-4 text-sm">
        {error && <p className="text-red-600">{error}</p>}
        <label className="font-medium text-slate-700 dark:text-slate-300">Token</label>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-2 focus:outline-none mb-3"
        />
        <label className="font-medium text-slate-700 dark:text-slate-300">URL del repositorio Git</label>
        <input
          type="text"
          placeholder="https://github.com/owner/repo.git"
          value={repoUrl}
          onChange={e => setRepoUrl(e.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-2 focus:outline-none"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 transition">
            Cancelar
          </button>
          <button
            onClick={saveToken}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
