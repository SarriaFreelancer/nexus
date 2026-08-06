import { IAiProvider, AiProviderResponse } from "@/core/domain/aiAuditTypes";

export function createGroqProvider(apiKey: string): IAiProvider {
  const model = "llama-3.3-70b-versatile";
  
  return {
    name: "Groq",
    async analyze(systemPrompt: string, userPrompt: string): Promise<AiProviderResponse> {
      console.log(`[AI Provider] Analyzing with Groq (${model})...`);
      
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.0,
            max_tokens: 4000,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Groq API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        
        return {
          content: data.choices[0].message.content,
          tokensInput: data.usage?.prompt_tokens || 0,
          tokensOutput: data.usage?.completion_tokens || 0,
          model
        };
      } catch (error: any) {
        console.error("[Groq Provider] Error:", error);
        if (error?.cause?.code === 'ENOTFOUND' || error?.message?.includes('ENOTFOUND') || error?.message?.includes('fetch failed')) {
          throw new Error("Error de red: No se pudo conectar a los servidores de Groq (api.groq.com). Revisa tu conexión a internet o firewall.");
        }
        throw error;
      }
    }
  };
}
