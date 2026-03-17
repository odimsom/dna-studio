import type { ImageProvider, ImageGenerateOptions, ImageGenerateResult } from "../types";

const DIMENSIONS: Record<string, { width: number; height: number }> = {
  "1024x1024": { width: 1024, height: 1024 },
  "1024x1792": { width: 1024, height: 1792 },
  "1792x1024": { width: 1792, height: 1024 },
};

interface Prediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string[];
  error?: string;
}

export class ReplicateProvider implements ImageProvider {
  private token: string;
  // Flux Schnell — fast, high quality, permissive license
  private model = process.env.REPLICATE_MODEL || "black-forest-labs/flux-schnell";

  constructor(apiKey?: string) {
    this.token = apiKey || process.env.REPLICATE_API_TOKEN || "";
    if (!this.token) throw new Error("REPLICATE_API_TOKEN is not set");
  }

  async generate(prompt: string, options?: ImageGenerateOptions): Promise<ImageGenerateResult> {
    const { width, height } = DIMENSIONS[options?.size ?? "1024x1024"];

    // Submit prediction
    const createRes = await fetch(
      `https://api.replicate.com/v1/models/${this.model}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: { prompt, width, height } }),
      }
    );

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Replicate error ${createRes.status}: ${err}`);
    }

    const prediction = await createRes.json() as Prediction;

    // Poll until complete (max 60s)
    const pollUrl = `https://api.replicate.com/v1/predictions/${prediction.id}`;
    const deadline = Date.now() + 60_000;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 2000));

      const pollRes = await fetch(pollUrl, {
        headers: { Authorization: `Token ${this.token}` },
      });
      const result = await pollRes.json() as Prediction;

      if (result.status === "succeeded") {
        const url = result.output?.[0];
        if (!url) throw new Error("No output URL from Replicate");
        return { url };
      }
      if (result.status === "failed" || result.status === "canceled") {
        throw new Error(`Replicate prediction ${result.status}: ${result.error ?? ""}`);
      }
    }

    throw new Error("Replicate prediction timed out after 60s");
  }
}
