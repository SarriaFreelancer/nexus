"use client";

import React, { useEffect, useState } from "react";

interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
}

interface BranchListModalProps {
  projectId: string;
  onClose: () => void;
}

export default function BranchListModal({ projectId, onClose }: BranchListModalProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(`/api/branches?projectId=${projectId}&count=20`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Error fetching branches");
        }
        setBranches(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, [projectId]);

  return (
    <div className="mt-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Ramas del repositorio</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-xs font-medium">
          Cerrar
        </button>
      </div>
        {loading && <p className="text-gray-600 dark:text-gray-300">Cargando...</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
        {!loading && !error && branches.length === 0 && (
          <p className="text-gray-600 dark:text-gray-300">No se encontraron ramas.</p>
        )}
        {!loading && !error && branches.length > 0 && (
          <ul className="space-y-3">
            {branches.map((b) => (
              <li key={b.name} className="border-b pb-2 pt-1 flex justify-between items-center">
                <span className="font-medium text-indigo-600">{b.name}</span>
                <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {b.commit.sha.substring(0, 7)}
                </span>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
