import type { VideoProvider } from "./types";

export type VideoProviderType = "heygen" | "did" | "veo";

let cached: VideoProvider | null = null;
let cachedKey: string | null = null;

export async function getVideoProvider(): Promise<VideoProvider> {
  let providerType: string;
  let apiKey: string | undefined;

  try {
    const { resolveSettings } = await import("@/lib/settings/resolve");
    const settings = await resolveSettings();
    providerType = settings.videoProvider;
    apiKey = settings.videoApiKey || undefined;
  } catch {
    providerType = process.env.VIDEO_PROVIDER || "veo";
    apiKey = process.env.GOOGLE_API_KEY || process.env.HEYGEN_API_KEY || process.env.DID_API_KEY || undefined;
  }

  const cacheKey = `${providerType}:${apiKey || "env"}`;
  if (cached && cachedKey === cacheKey) return cached;

  switch (providerType) {
    case "veo": {
      const { VeoProvider } = await import("./providers/veo");
      cached = new VeoProvider(apiKey);
      break;
    }
    case "heygen": {
      const { HeyGenProvider } = await import("./providers/heygen");
      cached = new HeyGenProvider(apiKey);
      break;
    }
    case "did": {
      const { DIDProvider } = await import("./providers/did");
      cached = new DIDProvider(apiKey);
      break;
    }
    default:
      throw new Error(`Unknown video provider: ${providerType}`);
  }

  cachedKey = cacheKey;
  return cached!;
}
