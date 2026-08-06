"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/serverAuth";

/**
 * Obtiene las ramas de un repositorio de GitHub asociado a un proyecto.
 * Requiere la variable de entorno GITHUB_TOKEN con permisos de lectura.
 */
export async function getBranches(projectId: string, count = 10) {
  const { workspace } = await getCurrentWorkspace();

  const project = await prisma.project.findUnique({
    where: { id: projectId, workspaceId: workspace.id },
    select: { gitRepoUrl: true, gitToken: true },
  });

  if (!project?.gitRepoUrl) {
    throw new Error("Repositorio Git no configurado para este proyecto");
  }

  const repo = project.gitRepoUrl
    .replace(/^https?:\/\/(www\.)?github\.com\//, "")
    .replace(/^github\.com\//, "")
    .replace(/\.git$/i, "")
    .replace(/\/$/, "");

  const token = project.gitToken || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GitHub token no está configurado para este proyecto ni en el entorno");
  }

  const response = await fetch(`https://api.github.com/repos/${repo}/branches?per_page=${count}`, {
    headers: { Authorization: `token ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Error al consultar GitHub: ${response.status} ${txt}`);
  }

  const branches = await response.json();
  return branches;
}

/**
 * Obtiene los últimos commits de un repositorio de GitHub asociado a un proyecto.
 * Requiere la variable de entorno GITHUB_TOKEN con permisos de lectura.
 */
export async function getRecentCommits(projectId: string, count = 5) {
  const { workspace } = await getCurrentWorkspace();

  const project = await prisma.project.findUnique({
    where: { id: projectId, workspaceId: workspace.id },
    select: { gitRepoUrl: true, gitToken: true },
  });

  if (!project?.gitRepoUrl) {
    throw new Error("Repositorio Git no configurado para este proyecto");
  }

  // Normalizamos la URL del repo (ej: https://github.com/owner/repo.git -> owner/repo)
  const repo = project.gitRepoUrl
    .replace(/^https?:\/\/(www\.)?github\.com\//, "")
    .replace(/^github\.com\//, "")
    .replace(/\.git$/i, "")
    .replace(/\/$/, "");

  const token = project?.gitToken || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GitHub token no está configurado para este proyecto ni en el entorno");
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

/**
 * Obtiene el detalle completo de un commit por su SHA (estadísticas + archivos modificados)
 */
export async function getCommitDetails(projectId: string, sha: string) {
  const { workspace } = await getCurrentWorkspace();

  const project = await prisma.project.findUnique({
    where: { id: projectId, workspaceId: workspace.id },
    select: { gitRepoUrl: true, gitToken: true },
  });

  if (!project?.gitRepoUrl) {
    throw new Error("Repositorio Git no configurado para este proyecto");
  }

  const repo = project.gitRepoUrl
    .replace(/^https?:\/\/(www\.)?github\.com\//, "")
    .replace(/^github\.com\//, "")
    .replace(/\.git$/i, "")
    .replace(/\/$/, "");

  const token = project.gitToken || process.env.GITHUB_TOKEN || process.env.GITHUB_TOCKEN;
  if (!token) {
    throw new Error("GitHub token no configurado");
  }

  const response = await fetch(`https://api.github.com/repos/${repo}/commits/${sha}`, {
    headers: { Authorization: `token ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Error al consultar GitHub: ${response.status} ${txt}`);
  }

  return response.json();
}

/**
 * Compara dos versiones/commits/tags en GitHub
 */
export async function compareVersions(projectId: string, base: string, head: string) {
  const { workspace } = await getCurrentWorkspace();

  const project = await prisma.project.findUnique({
    where: { id: projectId, workspaceId: workspace.id },
    select: { gitRepoUrl: true, gitToken: true },
  });

  if (!project?.gitRepoUrl) {
    throw new Error("Repositorio Git no configurado para este proyecto");
  }

  const repo = project.gitRepoUrl
    .replace(/^https?:\/\/(www\.)?github\.com\//, "")
    .replace(/^github\.com\//, "")
    .replace(/\.git$/i, "")
    .replace(/\/$/, "");

  const token = project.gitToken || process.env.GITHUB_TOKEN || process.env.GITHUB_TOCKEN;
  if (!token) {
    throw new Error("GitHub token no configurado");
  }

  const response = await fetch(`https://api.github.com/repos/${repo}/compare/${base}...${head}`, {
    headers: { Authorization: `token ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Error al consultar GitHub: ${response.status} ${txt}`);
  }

  return response.json();
}

