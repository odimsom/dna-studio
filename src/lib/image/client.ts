import type { ImageProvider } from "./types";

export type ImageProviderType = "openai" | "stability" | "replicate" | "gemini";

let cached: ImageProvider | null = null;
let cachedKey: string | null = null;

export async function getImageProvider(): Promise<ImageProvider> {
  let providerType: string;
  let apiKey: string | undefined;

  try {
    const { resolveSettings } = await import("@/lib/settings/resolve");
    const settings = await resolveSettings();
    providerType = settings.imageProvider;
    apiKey = settings.imageApiKey || undefined;
  } catch {
    providerType = process.env.IMAGE_PROVIDER || "openai";
  }

  const cacheKey = `${providerType}:${apiKey || "env"}`;
  if (cached && cachedKey === cacheKey) return cached;

  switch (providerType) {
    case "openai": {
      const { OpenAIImageProvider } = await import("./providers/openai");
      cached = new OpenAIImageProvider(apiKey);
      break;
    }
    case "stability": {
      const { StabilityProvider } = await import("./providers/stability");
      cached = new StabilityProvider(apiKey);
      break;
    }
    case "replicate": {
      const { ReplicateProvider } = await import("./providers/replicate");
      cached = new ReplicateProvider(apiKey);
      break;
    }
    case "gemini": {
      const { GeminiImageProvider } = await import("./providers/gemini");
      cached = new GeminiImageProvider(apiKey);
      break;
    }
    default:
      throw new Error(`Unknown image provider: ${providerType}`);
  }

  cachedKey = cacheKey;
  return cached!;
}
