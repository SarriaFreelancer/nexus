import { getCommitDetails } from "@/core/application/actions/gitActions";
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
  const sha = url.searchParams.get("sha");

  if (!projectId || !sha) {
    return NextResponse.json({ error: "projectId y sha son requeridos" }, { status: 400 });
  }

  try {
    const details = await getCommitDetails(projectId, sha);
    return NextResponse.json(details);
  } catch (error: any) {
    console.error("Error fetching commit details:", error);
    return NextResponse.json({ error: error.message || "Error al obtener detalle del commit" }, { status: 500 });
  }
}
