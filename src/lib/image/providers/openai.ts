import OpenAI from "openai";
import type { ImageProvider, ImageGenerateOptions, ImageGenerateResult } from "../types";

export class OpenAIImageProvider implements ImageProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generate(prompt: string, options?: ImageGenerateOptions): Promise<ImageGenerateResult> {
    const size = (options?.size ?? "1024x1024") as "1024x1024" | "1024x1792" | "1792x1024";

    const response = await this.client.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      quality: "standard",
    });

    const url = response.data?.[0]?.url;
    if (!url) throw new Error("No image URL returned from DALL-E");
    return { url };
  }
}
