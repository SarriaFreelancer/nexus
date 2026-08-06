import { getCommitDetails } from "@/core/application/actions/gitActions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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
