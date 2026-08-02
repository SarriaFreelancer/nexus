import { IAiProvider, AiProviderResponse } from "@/core/domain/aiAuditTypes";

export function createGeminiProvider(apiKey: string): IAiProvider {
  const model = "gemini-2.5-flash";
  
  return {
    name: "Gemini",
    async analyze(systemPrompt: string, userPrompt: string): Promise<AiProviderResponse> {
      console.log(`[AI Provider] Analyzing with Gemini (${model})...`);
      
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: [
              {
                role: "user",
                parts: [{ text: userPrompt }]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const tokensInput = data.usageMetadata?.promptTokenCount || 0;
        const tokensOutput = data.usageMetadata?.candidatesTokenCount || 0;
        
        return {
          content,
          tokensInput,
          tokensOutput,
          model
        };
      } catch (error) {
        console.error("[Gemini Provider] Error:", error);
        throw error;
      }
    }
  };
}
