import { IAiProvider } from "@/core/domain/aiAuditTypes";
import { createGroqProvider } from "./groqProvider";
import { createOpenAIProvider } from "./openaiProvider";
import { createGeminiProvider } from "./geminiProvider";
import { createDeepSeekProvider } from "./deepseekProvider";
import { createClaudeProvider } from "./claudeProvider";

export function createAiProvider(): IAiProvider | null {
  if (process.env.API_KEY_AI) {
    return createGroqProvider(process.env.API_KEY_AI);
  }
  if (process.env.OPENAI_API_KEY) {
    return createOpenAIProvider(process.env.OPENAI_API_KEY);
  }
  if (process.env.GEMINI_API_KEY) {
    return createGeminiProvider(process.env.GEMINI_API_KEY);
  }
  if (process.env.DEEPSEEK_API_KEY) {
    return createDeepSeekProvider(process.env.DEEPSEEK_API_KEY);
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return createClaudeProvider(process.env.ANTHROPIC_API_KEY);
  }
  
  return null;
}

export function getConfiguredProviderInfo(): { name: string; model: string } | null {
  if (process.env.API_KEY_AI) return { name: "Groq", model: "llama-3.3-70b-versatile" };
  if (process.env.OPENAI_API_KEY) return { name: "OpenAI", model: "gpt-4o-mini" };
  if (process.env.GEMINI_API_KEY) return { name: "Gemini", model: "gemini-2.5-flash" };
  if (process.env.DEEPSEEK_API_KEY) return { name: "DeepSeek", model: "deepseek-chat" };
  if (process.env.ANTHROPIC_API_KEY) return { name: "Claude", model: "claude-sonnet-4-20250514" };
  
  return null;
}
