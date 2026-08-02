"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { buildAuditContext } from "@/core/application/services/audit/contextBuilder";
import { buildAuditPrompt } from "@/core/application/services/audit/promptBuilder";
import { parseAuditResponse } from "@/core/application/services/audit/responseParser";
import { createAiProvider, getConfiguredProviderInfo } from "@/core/infrastructure/ai/aiProviderInterface";
import type { AuditResult } from "@/core/domain/aiAuditTypes";

/**
 * Ejecuta una auditoría completa de IA sobre un proyecto.
 * Pipeline: Recopilación → Contexto → Análisis IA → Resultados
 */
export async function runAiAudit(projectId: string) {
  const startTime = Date.now();

  try {
    const { workspace, user } = await getCurrentWorkspace();
    const userId = (user as any).id;

    // Verificar que el proyecto existe y pertenece al workspace
    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: workspace.id },
    });

    if (!project) {
      return { success: false, error: "Proyecto no encontrado" };
    }

    // Verificar proveedor de IA configurado
    const providerInfo = getConfiguredProviderInfo();
    if (!providerInfo) {
      return { success: false, error: "No hay ningún proveedor de IA configurado. Añade una API key en .env" };
    }

    // Crear registro de auditoría en estado RUNNING
    const auditRecord = await prisma.aiAudit.create({
      data: {
        projectId,
        userId,
        provider: providerInfo.name,
        model: providerInfo.model,
        status: "RUNNING",
      },
    });

    try {
      // FASE 1: Recopilar contexto
      const context = await buildAuditContext(projectId, workspace.id);

      // FASE 2: Construir prompt
      // Calculate sizes for debugging
      const ctxStr = JSON.stringify(context);
      console.log(`[AI Audit] Total context JSON length: ${ctxStr.length} characters`);
      console.log(`[AI Audit] Project context: ${JSON.stringify(context.project).length} chars`);
      console.log(`[AI Audit] Git context: ${JSON.stringify(context.git).length} chars`);
      console.log(`[AI Audit] Files context: ${JSON.stringify(context.files).length} chars`);
      if (context.files?.sourceFiles) {
        console.log(`[AI Audit] Source files count: ${context.files.sourceFiles.length}`);
        console.log(`[AI Audit] Source files size: ${JSON.stringify(context.files.sourceFiles).length} chars`);
      }
      
      const { systemPrompt, userPrompt } = buildAuditPrompt(context);


      // FASE 3: Enviar a la IA
      const provider = createAiProvider();
      if (!provider) {
        throw new Error("No se pudo inicializar el proveedor de IA");
      }

      const aiResponse = await provider.analyze(systemPrompt, userPrompt);

      // FASE 4: Parsear respuesta
      const result: AuditResult = parseAuditResponse(aiResponse.content);

      const durationMs = Date.now() - startTime;

      // Guardar resultado completo en BD
      await prisma.aiAudit.update({
        where: { id: auditRecord.id },
        data: {
          status: "COMPLETED",
          score: result.summary?.overallScore || result.maintainability?.score || 0,
          summary: {
            totalFindings: result.findings?.length || 0,
            critical: result.findings?.filter(f => f.type === "critical").length || 0,
            warnings: result.findings?.filter(f => f.type === "warning").length || 0,
            positive: result.findings?.filter(f => f.type === "positive").length || 0,
            recommendations: result.recommendations?.length || 0,
            securityIssues: (result.security?.critical || 0) + (result.security?.high || 0) + (result.security?.medium || 0) + (result.security?.low || 0),
            technicalDebtHours: result.technicalDebt?.totalHours || 0,
          },
          result: JSON.stringify(result),
          contextSnapshot: JSON.stringify(context),
          tokensInput: aiResponse.tokensInput,
          tokensOutput: aiResponse.tokensOutput,
          durationMs,
        },
      });

      return { success: true, data: result, auditId: auditRecord.id };

    } catch (innerError: any) {
      // Marcar auditoría como fallida
      await prisma.aiAudit.update({
        where: { id: auditRecord.id },
        data: {
          status: "FAILED",
          error: innerError.message || "Error desconocido durante la auditoría",
          durationMs: Date.now() - startTime,
        },
      });

      return { success: false, error: innerError.message || "Error durante la auditoría IA" };
    }
  } catch (error: any) {
    console.error("Error en runAiAudit:", error);
    return { success: false, error: error.message || "Error inesperado" };
  }
}

/**
 * Obtiene el historial de auditorías de un proyecto
 */
export async function getAuditHistory(projectId: string) {
  try {
    const { workspace } = await getCurrentWorkspace();

    // Verificar acceso al proyecto
    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: workspace.id },
      select: { id: true },
    });

    if (!project) {
      return { success: false, data: [], error: "Proyecto no encontrado" };
    }

    const audits = await prisma.aiAudit.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        provider: true,
        model: true,
        status: true,
        score: true,
        summary: true,
        tokensInput: true,
        tokensOutput: true,
        durationMs: true,
        error: true,
        createdAt: true,
        user: { select: { name: true } },
      },
      take: 20,
    });

    return { success: true, data: audits };
  } catch (error: any) {
    console.error("Error en getAuditHistory:", error);
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Obtiene la última auditoría completada de un proyecto con resultado completo
 */
export async function getLatestAudit(projectId: string) {
  try {
    const { workspace } = await getCurrentWorkspace();

    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: workspace.id },
      select: { id: true },
    });

    if (!project) {
      return { success: false, data: null };
    }

    const audit = await prisma.aiAudit.findFirst({
      where: { projectId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });

    if (!audit) {
      return { success: true, data: null };
    }

    let parsedResult: AuditResult | null = null;
    try {
      if (audit.result) {
        parsedResult = JSON.parse(audit.result as string);
      }
    } catch {
      parsedResult = null;
    }

    return {
      success: true,
      data: {
        ...audit,
        parsedResult,
      },
    };
  } catch (error: any) {
    console.error("Error en getLatestAudit:", error);
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Obtiene el proveedor de IA configurado actualmente
 */
export async function getConfiguredAiProvider() {
  const info = getConfiguredProviderInfo();
  return info;
}

/**
 * Obtiene los proyectos del workspace para el selector
 */
export async function getProjectsForAudit() {
  try {
    const { workspace } = await getCurrentWorkspace();

    const projects = await prisma.project.findMany({
      where: { workspaceId: workspace.id },
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        gitRepoUrl: true,
        technologies: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, data: projects };
  } catch (error: any) {
    console.error("Error en getProjectsForAudit:", error);
    return { success: false, data: [], error: error.message };
  }
}
