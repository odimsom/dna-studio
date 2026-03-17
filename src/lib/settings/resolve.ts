import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export interface ResolvedSettings {
  llmProvider: string;
  llmApiKey: string;
  llmModel: string;
  ollamaUrl: string;
  imageProvider: string;
  imageApiKey: string;
}

interface UserSettings {
  llmProvider?: string;
  llmApiKey?: string;
  llmModel?: string;
  ollamaUrl?: string;
  imageProvider?: string;
  imageApiKey?: string;
}

/**
 * Resolve effective settings: user DB settings take priority, then env vars.
 */
export async function resolveSettings(): Promise<ResolvedSettings> {
  let userSettings: UserSettings = {};

  try {
    const session = await getSession();
    if (session?.user) {
      const user = await prisma.user.findUnique({
        where: { id: (session.user as { id: string }).id },
        select: { settings: true },
      });
      if (user?.settings) {
        userSettings = user.settings as unknown as UserSettings;
      }
    }
  } catch {
    // Fall through to env vars
  }

  const llmProvider = userSettings.llmProvider || process.env.LLM_PROVIDER || "openai";

  // Resolve the correct API key based on provider
  let llmApiKey = userSettings.llmApiKey || "";
  if (!llmApiKey) {
    switch (llmProvider) {
      case "openai":
        llmApiKey = process.env.OPENAI_API_KEY || "";
        break;
      case "anthropic":
        llmApiKey = process.env.ANTHROPIC_API_KEY || "";
        break;
      case "gemini":
        llmApiKey = process.env.GOOGLE_API_KEY || "";
        break;
    }
  }

  // Resolve model
  let llmModel = userSettings.llmModel || "";
  if (!llmModel) {
    switch (llmProvider) {
      case "openai":
        llmModel = process.env.OPENAI_MODEL || "gpt-4o";
        break;
      case "anthropic":
        llmModel = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
        break;
      case "gemini":
        llmModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
        break;
      case "ollama":
        llmModel = process.env.OLLAMA_MODEL || "llama3.1";
        break;
    }
  }

  const imageProvider = userSettings.imageProvider || process.env.IMAGE_PROVIDER || "openai";

  let imageApiKey = userSettings.imageApiKey || "";
  if (!imageApiKey) {
    switch (imageProvider) {
      case "openai":
        imageApiKey = process.env.OPENAI_API_KEY || "";
        break;
      case "stability":
        imageApiKey = process.env.STABILITY_API_KEY || "";
        break;
      case "replicate":
        imageApiKey = process.env.REPLICATE_API_TOKEN || "";
        break;
    }
  }

  return {
    llmProvider,
    llmApiKey,
    llmModel,
    ollamaUrl: userSettings.ollamaUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    imageProvider,
    imageApiKey,
  };
}
