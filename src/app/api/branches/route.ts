"use server";

import { getBranches } from "@/core/application/actions/gitActions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  const countParam = url.searchParams.get("count");
  const count = countParam ? parseInt(countParam, 10) : 20;

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    const branches = await getBranches(projectId, count);
    return NextResponse.json(branches);
  } catch (error: any) {
    console.error("Error fetching branches:", error);
    return NextResponse.json({ error: error.message || "Error fetching branches" }, { status: 500 });
  }
}
