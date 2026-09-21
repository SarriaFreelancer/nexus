import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Evitar path traversal
    const safeFilename = path.basename(filename);
    const filepath = path.join(process.cwd(), "public", "uploads", safeFilename);

    const fileBuffer = await readFile(filepath);

    // Determinar Content-Type
    let contentType = "application/octet-stream";
    if (safeFilename.endsWith(".jpg") || safeFilename.endsWith(".jpeg")) {
      contentType = "image/jpeg";
    } else if (safeFilename.endsWith(".png")) {
      contentType = "image/png";
    } else if (safeFilename.endsWith(".webp")) {
      contentType = "image/webp";
    } else if (safeFilename.endsWith(".gif")) {
      contentType = "image/gif";
    } else if (safeFilename.endsWith(".pdf")) {
      contentType = "application/pdf";
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("File not found", { status: 404 });
  }
}
