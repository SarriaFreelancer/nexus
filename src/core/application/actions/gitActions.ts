"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/serverAuth";

/**
 * Obtiene los últimos commits de un repositorio de GitHub asociado a un proyecto.
 * Requiere la variable de entorno GITHUB_TOKEN con permisos de lectura.
 */
export async function getRecentCommits(projectId: string, count = 5) {
  const { workspace } = await getCurrentWorkspace();

  const project = await prisma.project.findUnique({
    where: { id: projectId, workspaceId: workspace.id },
    select: { gitRepoUrl: true },
  });

  if (!project?.gitRepoUrl) {
    throw new Error("Repositorio Git no configurado para este proyecto");
  }

  // Normalizamos la URL del repo (ej: github.com/owner/repo o https://github.com/owner/repo.git)
  const repo = project.gitRepoUrl
    .replace(/^https?:\/\//, "")
    .replace(/\.git$/i, "");

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN no está definido en el entorno");
  }

  const response = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=${count}`, {
    headers: { Authorization: `token ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Error al consultar GitHub: ${response.status} ${txt}`);
  }

  const commits = await response.json();
  return commits;
}
