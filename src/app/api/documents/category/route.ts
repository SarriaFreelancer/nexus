import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { oldCategory, newCategory, projectId } = body;

    if (!oldCategory || !newCategory || !projectId) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    // Actualizamos todos los documentos que estén en oldCategory a newCategory
    const result = await prisma.document.updateMany({
      where: {
        projectId,
        category: oldCategory
      },
      data: {
        category: newCategory
      }
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("Error renaming category:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al renombrar categoría" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const projectId = searchParams.get("projectId");

    if (!category || !projectId) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    let result = { count: 0 };
    try {
      result = await prisma.document.deleteMany({
        where: {
          projectId,
          category
        }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        console.log(`Documents in category ${category} already deleted or not found.`);
      } else {
        throw error;
      }
    }

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al eliminar categoría" }, { status: 500 });
  }
}
