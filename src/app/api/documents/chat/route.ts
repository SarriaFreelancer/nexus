import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { messages, projectId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Mensajes inválidos" }, { status: 400 });
    }

    const apiKey = process.env.API_KEY_AI || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No hay clave de API configurada" }, { status: 500 });
    }

    const model = "llama-3.3-70b-versatile";
    const systemPrompt = `Eres un asistente experto en creación de cotizaciones y documentos para proyectos de software. 
Tu objetivo es interactuar con el usuario para recopilar información clave del proyecto (alcance, requerimientos, tiempo, costos).
Cuando tengas suficiente información, puedes proponer una estructura de cotización o generar el documento final en formato Markdown.
Si te piden generar la cotización, utiliza un formato claro y profesional, incluyendo tablas si es necesario para los costos o hitos.`;

    // Ensure the system prompt is always at the start
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 2000,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({
      content: data.choices[0].message.content,
      role: "assistant"
    });

  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json({ error: "Error al comunicarse con la IA" }, { status: 500 });
  }
}
