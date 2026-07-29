"use client";

import React from "react";
import { mockProjects } from "@/core/infrastructure/mockData";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { MoreVertical } from "lucide-react";
import Link from "next/link";

export const RecentProjectsWidget: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100">Proyectos Recientes</h3>
        <Link href="/proyectos" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Ver todos
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockProjects.map((proj) => (
          <div
            key={proj.id}
            className="p-4 rounded-2xl bg-[#0f1424] border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-lg"
          >
            {/* Header Image / Banner */}
            <div className="relative h-28 w-full rounded-xl overflow-hidden mb-3 bg-slate-900 border border-slate-800">
              <img
                src={proj.bannerUrl}
                alt={proj.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1424] via-transparent to-black/40" />

              {/* Internal Code Badge */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white font-extrabold text-[11px] border border-white/10">
                {proj.code}
              </div>

              {/* Action Menu */}
              <button className="absolute top-2.5 right-2.5 p-1 rounded-lg bg-black/50 text-slate-300 hover:text-white backdrop-blur-md">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Title & Description */}
            <div className="space-y-1 mb-3">
              <h4 className="font-bold text-slate-100 text-sm group-hover:text-indigo-400 transition-colors">
                {proj.name}
              </h4>
              <p className="text-xs text-slate-400 font-medium">{proj.category}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 mb-3">
              <ProgressBar value={proj.progress} showLabel />
            </div>

            {/* Footer Status & Team */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <Badge
                variant={
                  proj.status === "En Desarrollo"
                    ? "indigo"
                    : proj.status === "En Diseño"
                    ? "blue"
                    : proj.status === "En Pruebas"
                    ? "emerald"
                    : "amber"
                }
              >
                {proj.status}
              </Badge>
              <AvatarGroup users={proj.team} limit={3} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
