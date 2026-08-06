import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, gitRepoUrl, gitToken } = body;

    if (!projectId) {
      return NextResponse.json({ error: "El ID del proyecto es requerido" }, { status: 400 });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        gitRepoUrl: gitRepoUrl !== undefined ? gitRepoUrl : undefined,
        gitToken: gitToken !== undefined ? gitToken : undefined,
      },
    });

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error: any) {
    console.error("Error updating GitHub config:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar la configuración de GitHub" },
      { status: 500 }
    );
  }
}
