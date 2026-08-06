import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }
  const { workspace } = await getCurrentWorkspace();
  const project = await prisma.project.findUnique({
    where: { id: projectId, workspaceId: workspace.id },
    select: { gitToken: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  return NextResponse.json({ gitToken: project.gitToken || null });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { workspace } = await getCurrentWorkspace();
  const data = await request.json();
  const { projectId, gitToken, gitRepoUrl } = data;
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }
  await prisma.project.update({
    where: { id: projectId, workspaceId: workspace.id },
    data: {
      gitToken,
      ...(gitRepoUrl ? { gitRepoUrl } : {}),
    },
  });
  return NextResponse.json({ success: true });
}
