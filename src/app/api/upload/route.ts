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

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    const isImage = file.type ? file.type.startsWith("image/") : false;
    const isDoc = (file.type && (file.type.includes("pdf") || file.type.includes("document") || file.type.includes("msword") || file.type.includes("presentation") || file.type.includes("spreadsheet") || file.type.includes("text") || file.type.includes("vsdx"))) || 
                  (file.name && (file.name.toLowerCase().endsWith(".vsdx") || file.name.toLowerCase().endsWith(".pdf")));

    if (!isImage && !isDoc) {
      return NextResponse.json({ error: "El archivo no es una imagen ni un documento soportado" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalName = file.name || "documento_adjunto";
    const filename = `${uniqueSuffix}-${originalName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    
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
    console.error("Upload error details:", error);
    return NextResponse.json({ error: `Error interno al subir el archivo: ${error.message || error.toString()}` }, { status: 500 });
  }
}
