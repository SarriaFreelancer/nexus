import { IAiProvider, AiProviderResponse } from "@/core/domain/aiAuditTypes";

export function createClaudeProvider(apiKey: string): IAiProvider {
  const model = "claude-sonnet-4-20250514";
  
  return {
    name: "Claude",
    async analyze(systemPrompt: string, userPrompt: string): Promise<AiProviderResponse> {
      console.log(`[AI Provider] Analyzing with Claude (${model})...`);
      
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model,
            system: systemPrompt,
            messages: [
              { role: "user", content: userPrompt }
            ],
            temperature: 0.1,
            max_tokens: 8192,
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Claude API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const content = data.content.find((block: any) => block.type === 'text')?.text || "{}";
        
        return {
          content,
          tokensInput: data.usage?.input_tokens || 0,
          tokensOutput: data.usage?.output_tokens || 0,
          model
        };
      } catch (error) {
        console.error("[Claude Provider] Error:", error);
        throw error;
      }
    }
  };
}
