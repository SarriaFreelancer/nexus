import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getCurrentWorkspace } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const { member } = await getCurrentWorkspace();
    if (!member) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const filenameParam = url.searchParams.get("filename");
    if (!filenameParam) {
      return NextResponse.json({ error: "No se proporcionó el nombre del archivo" }, { status: 400 });
    }

    const bytes = await req.arrayBuffer();
    if (bytes.byteLength === 0) {
      return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 });
    }

    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${filenameParam.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (e) {
      // Ignore if directory exists
    }

    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Upload document error details:", error);
    return NextResponse.json({ error: `Error interno al subir el documento: ${error.message || error.toString()}` }, { status: 500 });
  }
}
