import type { ImageProvider, ImageGenerateOptions, ImageGenerateResult } from "../types";

const ASPECT_RATIO: Record<string, string> = {
  "1024x1024": "1:1",
  "1024x1792": "9:16",
  "1792x1024": "16:9",
};

export class StabilityProvider implements ImageProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.STABILITY_API_KEY || "";
    if (!this.apiKey) throw new Error("STABILITY_API_KEY is not set");
  }

  async generate(prompt: string, options?: ImageGenerateOptions): Promise<ImageGenerateResult> {
    const aspectRatio = ASPECT_RATIO[options?.size ?? "1024x1024"] ?? "1:1";

    const form = new FormData();
    form.append("prompt", prompt);
    form.append("aspect_ratio", aspectRatio);
    form.append("output_format", "jpeg");

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: form,
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Stability AI error ${response.status}: ${err}`);
    }

    const data = await response.json() as { image: string };
    if (!data.image) throw new Error("No image returned from Stability AI");

    // Return as base64 data URL
    return { url: `data:image/jpeg;base64,${data.image}` };
  }
}
