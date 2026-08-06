"use client";

import React, { useState } from "react";
import { GitCompare, ArrowRight, ExternalLink } from "lucide-react";

interface VersionCompareTabProps {
  projectId: string;
  versions: any[];
  gitRepoUrl?: string;
}

export function VersionCompareTab({ projectId, versions, gitRepoUrl }: VersionCompareTabProps) {
  const [baseTag, setBaseTag] = useState(versions[1]?.version ? `v${versions[1].version}` : "main");
  const [headTag, setHeadTag] = useState(versions[0]?.version ? `v${versions[0].version}` : "main");

  const repoPath = gitRepoUrl
    ? gitRepoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "").replace(/\.git$/i, "").replace(/\/$/, "")
    : "";

  const compareUrl = repoPath ? `https://github.com/${repoPath}/compare/${baseTag}...${headTag}` : "#";

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in-50 duration-200">
      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <GitCompare className="w-4 h-4 text-indigo-400" />
        Comparar Versiones y Releases en GitHub
      </h3>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Versión Base (Anterior)</label>
            <input
              type="text"
              value={baseTag}
              onChange={(e) => setBaseTag(e.target.value)}
              placeholder="v1.0.0 o main"
              className="w-full bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-mono"
            />
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block mt-4" />

          <div className="flex-1 w-full">
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Versión Head (Actual / Nueva)</label>
            <input
              type="text"
              value={headTag}
              onChange={(e) => setHeadTag(e.target.value)}
              placeholder="v1.0.4"
              className="w-full bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <a
            href={compareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            <GitCompare className="w-4 h-4" />
            <span>Abrir Comparativa en GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
