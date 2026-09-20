"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, readdir, stat, unlink } from "fs/promises";
import path from "path";

export interface BackupItem {
  filename: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  downloadUrl: string;
}

const BACKUPS_DIR = path.join(process.cwd(), "public", "backups");

async function ensureBackupDir() {
  try {
    await mkdir(BACKUPS_DIR, { recursive: true });
  } catch (e) {
    // Ignore if directory exists
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Genera un backup de base de datos inmediato ("Justo ahora")
 */
export async function createInstantBackup() {
  try {
    const { workspace } = await getCurrentWorkspace();
    await ensureBackupDir();

    // Export key database tables for this workspace
    const [projects, tasks, versions, docs, servers, financials, members] = await Promise.all([
      prisma.project.findMany({ where: { workspaceId: workspace.id } }),
      prisma.task.findMany({ where: { project: { workspaceId: workspace.id } } }),
      prisma.projectVersion.findMany({ where: { project: { workspaceId: workspace.id } } }),
      prisma.document.findMany({ where: { project: { workspaceId: workspace.id } } }),
      prisma.serverInstance.findMany({ where: { project: { workspaceId: workspace.id } } }),
      prisma.financialRecord.findMany({ where: { workspaceId: workspace.id } }),
      prisma.workspaceMember.findMany({ where: { workspaceId: workspace.id }, include: { user: { select: { email: true, name: true } } } }),
    ]);

    const backupData = {
      meta: {
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        timestamp: new Date().toISOString(),
        version: "Nexus v2.0 SemVer Backup",
        dbProvider: "MySQL / Prisma ORM",
        counts: {
          projects: projects.length,
          tasks: tasks.length,
          versions: versions.length,
          docs: docs.length,
          servers: servers.length,
          financials: financials.length,
          members: members.length,
        }
      },
      data: {
        projects,
        tasks,
        versions,
        docs,
        servers,
        financials,
        members,
      }
    };

    const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${workspace.code || "nexus"}-${timestampStr}.json`;
    const filePath = path.join(BACKUPS_DIR, filename);

    const jsonString = JSON.stringify(backupData, null, 2);
    await writeFile(filePath, jsonString, "utf8");

    revalidatePath("/configuracion");

    return {
      success: true,
      message: `Backup generado con éxito: ${filename}`,
      filename,
      sizeFormatted: formatBytes(Buffer.byteLength(jsonString))
    };
  } catch (error: any) {
    console.error("Error creating instant backup:", error);
    return { success: false, error: error.message || "Error al generar respaldo" };
  }
}

/**
 * Obtiene el historial de archivos de backup existentes
 */
export async function getBackupHistory(): Promise<{ success: boolean; backups: BackupItem[]; schedule?: string; error?: string }> {
  try {
    const { workspace } = await getCurrentWorkspace();
    await ensureBackupDir();

    const files = await readdir(BACKUPS_DIR);
    const backupFiles = files.filter(f => f.startsWith("backup-") && f.endsWith(".json"));

    const backups: BackupItem[] = [];

    for (const filename of backupFiles) {
      const filePath = path.join(BACKUPS_DIR, filename);
      const fileStat = await stat(filePath);

      backups.push({
        filename,
        sizeBytes: fileStat.size,
        sizeFormatted: formatBytes(fileStat.size),
        createdAt: fileStat.mtime.toISOString(),
        downloadUrl: `/backups/${filename}`,
      });
    }

    // Sort newest first
    backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Retrieve workspace schedule preference from config file
    let schedule = "DISABLED";
    const configPath = path.join(BACKUPS_DIR, "config.json");
    try {
      const fileStat = await stat(configPath);
      if (fileStat) {
        const { readFile } = await import("fs/promises");
        const configContent = await readFile(configPath, "utf8");
        const parsed = JSON.parse(configContent);
        if (parsed?.schedule) schedule = parsed.schedule;
      }
    } catch (e) {}

    return { success: true, backups, schedule };
  } catch (error: any) {
    console.error("Error getting backup history:", error);
    return { success: false, backups: [], error: error.message };
  }
}

/**
 * Actualiza la programación del respaldo (DAILY, WEEKLY, DISABLED)
 */
export async function updateBackupSchedule(schedule: "DAILY" | "WEEKLY" | "DISABLED") {
  try {
    await getCurrentWorkspace();
    await ensureBackupDir();

    const configPath = path.join(BACKUPS_DIR, "config.json");
    const configData = {
      schedule,
      updatedAt: new Date().toISOString()
    };

    await writeFile(configPath, JSON.stringify(configData, null, 2), "utf8");
    revalidatePath("/configuracion");

    return { success: true, schedule };
  } catch (error: any) {
    console.error("Error updating backup schedule:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina un archivo de respaldo específico
 */
export async function deleteBackupFile(filename: string) {
  try {
    await getCurrentWorkspace();
    
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(BACKUPS_DIR, safeFilename);

    await unlink(filePath);
    revalidatePath("/configuracion");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting backup file:", error);
    return { success: false, error: error.message || "Error al eliminar archivo de respaldo" };
  }
}
