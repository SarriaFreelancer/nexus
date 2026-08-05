import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Webhook para integraciones CI/CD (Vercel, GitHub Actions, GitLab, etc.)
 * URL: /api/webhooks/deploy?projectId={id}&secret={WEBHOOK_SECRET}
 */
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const secret = searchParams.get("secret");

    // 1. Validar Secreto
    const expectedSecret = process.env.WEBHOOK_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized or WEBHOOK_SECRET not configured" }, { status: 401 });
    }

    if (!projectId) {
      return NextResponse.json({ success: false, error: "Missing projectId parameter" }, { status: 400 });
    }

    // 2. Verificar que el proyecto exista
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // 3. Parsear el Body (Soportar Vercel, GitHub, o Genérico)
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Body vacío o inválido es aceptable, generaremos datos por defecto
    }

    // Intentar extraer información de Vercel/GitHub
    let commitHash = null;
    let branch = "main";
    let versionLabel = `v-auto-${Date.now().toString().slice(-6)}`;

    if (body.payload?.deployment?.meta?.githubCommitSha) {
      commitHash = body.payload.deployment.meta.githubCommitSha.substring(0, 7);
    } else if (body.head_commit?.id) { // Formato genérico GitHub
      commitHash = body.head_commit.id.substring(0, 7);
    } else if (body.commitHash) { // Custom genérico
      commitHash = body.commitHash;
    }

    if (body.payload?.deployment?.meta?.githubCommitRef) {
      branch = body.payload.deployment.meta.githubCommitRef;
    } else if (body.ref) {
      branch = body.ref.replace("refs/heads/", "");
    } else if (body.branch) {
      branch = body.branch;
    }

    if (body.version) {
      versionLabel = body.version;
    } else if (commitHash) {
      versionLabel = `deploy-${commitHash}`;
    }

    // 4. Actualizar base de datos
    // Desmarcar todos como actuales
    await prisma.projectVersion.updateMany({
      where: { projectId: project.id },
      data: { isCurrent: false }
    });

    // Crear nueva versión automática
    const newVersion = await prisma.projectVersion.create({
      data: {
        projectId: project.id,
        version: versionLabel,
        title: `Auto-Deploy: ${branch}`,
        changelog: `Despliegue automatizado vía Webhook CI/CD.\nCommit: ${commitHash || "N/A"}\nRama: ${branch}`,
        releaseDate: new Date(),
        isCurrent: true,
        branch: branch,
        commitHash: commitHash
      }
    });

    return NextResponse.json({ success: true, data: newVersion }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook deploy error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
