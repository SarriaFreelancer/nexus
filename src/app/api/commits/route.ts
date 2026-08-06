import { getRecentCommits } from "@/core/application/actions/gitActions";
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
  const countParam = url.searchParams.get("count");
  const count = countParam ? parseInt(countParam, 10) : 20; // default 20 commits

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    const commits = await getRecentCommits(projectId, count);
    return NextResponse.json(commits);
  } catch (error: any) {
    console.error("Error fetching commits:", error);
    return NextResponse.json({ error: error.message || "Error fetching commits" }, { status: 500 });
  }
}
