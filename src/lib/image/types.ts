export type ImageSize = "1024x1024" | "1024x1792" | "1792x1024";

export interface ImageGenerateOptions {
  size?: ImageSize;
}

export interface ImageGenerateResult {
  url: string; // HTTP URL or base64 data URL
}

export interface ImageProvider {
  generate(prompt: string, options?: ImageGenerateOptions): Promise<ImageGenerateResult>;
}
