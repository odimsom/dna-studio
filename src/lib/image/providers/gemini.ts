import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ImageProvider, ImageGenerateOptions, ImageGenerateResult } from "../types";

export class GeminiImageProvider implements ImageProvider {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.genAI = new GoogleGenerativeAI(apiKey || process.env.GOOGLE_API_KEY || "");
    this.model = model || process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image-preview";
  }

  async generate(prompt: string, options?: ImageGenerateOptions): Promise<ImageGenerateResult> {
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      generationConfig: {
        // @ts-expect-error — responseModalities is supported but not yet in type defs
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const aspectHint = this.getAspectHint(options?.size);
    const fullPrompt = `Generate an image: ${prompt}${aspectHint ? `. Aspect ratio: ${aspectHint}` : ""}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;

    // Find the image part in the response
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
          const base64 = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          return { url: `data:${mimeType};base64,${base64}` };
        }
      }
    }

    throw new Error("Gemini did not return an image. The model may not support image generation.");
  }

  private getAspectHint(size?: string): string {
    switch (size) {
      case "1024x1792": return "9:16 portrait";
      case "1792x1024": return "16:9 landscape";
      default: return "1:1 square";
    }
  }
}
