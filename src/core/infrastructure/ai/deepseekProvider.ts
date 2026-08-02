import { IAiProvider, AiProviderResponse } from "@/core/domain/aiAuditTypes";

export function createDeepSeekProvider(apiKey: string): IAiProvider {
  const model = "deepseek-chat";
  
  return {
    name: "DeepSeek",
    async analyze(systemPrompt: string, userPrompt: string): Promise<AiProviderResponse> {
      console.log(`[AI Provider] Analyzing with DeepSeek (${model})...`);
      
      try {
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
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
            temperature: 0.1,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        
        return {
          content: data.choices[0].message.content,
          tokensInput: data.usage?.prompt_tokens || 0,
          tokensOutput: data.usage?.completion_tokens || 0,
          model
        };
      } catch (error) {
        console.error("[DeepSeek Provider] Error:", error);
        throw error;
      }
    }
  };
}
