import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const category = searchParams.get("category");

    const whereClause: any = {};
    if (projectId) whereClause.projectId = projectId;
    if (category) whereClause.category = category;

    // Check permissions if needed, here we just return docs
    const documents = await prisma.document.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Error al cargar documentos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const data = await request.json();
    const { projectId, title, type, content, fileUrl, category } = data;

    if (!projectId || !title || !category) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        projectId,
        title,
        type: type || "INTERNAL",
        content,
        fileUrl,
        category
      }
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Error al crear documento" }, { status: 500 });
  }
}
