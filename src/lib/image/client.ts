import type { ImageProvider } from "./types";

export type ImageProviderType = "openai" | "stability" | "replicate";

let cached: ImageProvider | null = null;
let cachedType: string | null = null;

export async function getImageProvider(): Promise<ImageProvider> {
  const providerType = process.env.IMAGE_PROVIDER || "openai";

  if (cached && cachedType === providerType) return cached;

  switch (providerType) {
    case "openai": {
      const { OpenAIImageProvider } = await import("./providers/openai");
      cached = new OpenAIImageProvider();
      break;
    }
    case "stability": {
      const { StabilityProvider } = await import("./providers/stability");
      cached = new StabilityProvider();
      break;
    }
    case "replicate": {
      const { ReplicateProvider } = await import("./providers/replicate");
      cached = new ReplicateProvider();
      break;
    }
    default:
      throw new Error(`Unknown image provider: ${providerType}`);
  }

  cachedType = providerType;
  return cached!;
}
