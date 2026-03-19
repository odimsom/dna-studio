import type {
  VideoProvider,
  VideoAvatar,
  VideoGenerateOptions,
  VideoGenerateResult,
} from "../types";

const DID_API = "https://api.d-id.com";

export class DIDProvider implements VideoProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DID_API_KEY || "";
  }

  private headers() {
    return {
      Authorization: `Basic ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async listAvatars(): Promise<VideoAvatar[]> {
    // D-ID uses "presenters" — fetch the list of available ones
    const res = await fetch(`${DID_API}/clips/presenters`, {
      headers: this.headers(),
    });

    if (!res.ok) {
      throw new Error(`D-ID presenters error: ${res.status}`);
    }

    const data = await res.json();
    const presenters = data.presenters || [];

    return presenters.slice(0, 24).map(
      (p: { presenter_id: string; name: string; thumbnail_url: string; gender: string }) => ({
        id: p.presenter_id,
        name: p.name || "Presenter",
        thumbnailUrl: p.thumbnail_url,
        gender: (p.gender || "female") as "male" | "female",
        style: "professional",
      })
    );
  }

  async generate(options: VideoGenerateOptions): Promise<VideoGenerateResult> {
    const body: Record<string, unknown> = {
      presenter_id: options.avatarId,
      script: {
        type: "text",
        input: options.script,
        provider: {
          type: "microsoft",
          voice_id: "en-US-JennyNeural",
        },
      },
      config: {
        result_format: "mp4",
      },
    };

    // If product image provided, use it as background
    if (options.productImageUrl) {
      body.background = { source_url: options.productImageUrl };
    }

    const res = await fetch(`${DID_API}/clips`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `D-ID generation error: ${(err as { description?: string }).description || res.status}`
      );
    }

    const data = await res.json();

    return {
      videoId: data.id,
      status: "queued",
    };
  }

  async getStatus(videoId: string): Promise<VideoGenerateResult> {
    const res = await fetch(`${DID_API}/clips/${videoId}`, {
      headers: this.headers(),
    });

    if (!res.ok) {
      throw new Error(`D-ID status error: ${res.status}`);
    }

    const data = await res.json();

    const mappedStatus: VideoGenerateResult["status"] =
      data.status === "done"
        ? "completed"
        : data.status === "error"
          ? "failed"
          : data.status === "started" || data.status === "created"
            ? "processing"
            : "queued";

    return {
      videoId,
      status: mappedStatus,
      videoUrl: data.result_url || undefined,
      thumbnailUrl: data.thumbnail_url || undefined,
      duration: data.duration ? Math.round(data.duration) : undefined,
      error: mappedStatus === "failed" ? "Video generation failed" : undefined,
    };
  }
}
