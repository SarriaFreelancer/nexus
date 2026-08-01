"use client";

import React, { useEffect, useState } from "react";

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: { date: string };
  };
  author?: { login: string };
  html_url?: string;
}

interface CommitListModalProps {
  projectId: string;
  onClose: () => void;
}

export default function CommitListModal({ projectId, onClose }: CommitListModalProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const res = await fetch(`/api/commits?projectId=${projectId}&count=20`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Error fetching commits");
        }
        setCommits(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCommits();
  }, [projectId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Últimos commits</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
            ✕
          </button>
        </div>
        {loading && <p className="text-gray-600 dark:text-gray-300">Cargando...</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
        {!loading && !error && (
          <ul className="space-y-3">
            {commits.map((c) => (
              <li key={c.sha} className="border-b pb-2">
                <a
                  href={c.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  {c.sha.substring(0, 7)}
                </a>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {c.commit.message.split("\n")[0]}
                </p>
                <div className="text-xs text-gray-500 flex space-x-2">
                  <span>{c.author?.login ?? "Autor desconocido"}</span>
                  <span>{new Date(c.commit.author.date).toLocaleDateString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
