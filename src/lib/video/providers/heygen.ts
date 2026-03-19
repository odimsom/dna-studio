import type {
  VideoProvider,
  VideoAvatar,
  VideoGenerateOptions,
  VideoGenerateResult,
} from "../types";

const HEYGEN_API = "https://api.heygen.com";

export class HeyGenProvider implements VideoProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.HEYGEN_API_KEY || "";
  }

  private headers() {
    return {
      "X-Api-Key": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  async listAvatars(): Promise<VideoAvatar[]> {
    const res = await fetch(`${HEYGEN_API}/v2/avatars`, {
      headers: this.headers(),
    });

    if (!res.ok) {
      throw new Error(`HeyGen avatars error: ${res.status}`);
    }

    const data = await res.json();
    const avatars = data.data?.avatars || [];

    return avatars.slice(0, 24).map(
      (a: { avatar_id: string; avatar_name: string; preview_image_url: string; gender: string }) => ({
        id: a.avatar_id,
        name: a.avatar_name,
        thumbnailUrl: a.preview_image_url,
        gender: (a.gender || "female") as "male" | "female",
        style: "professional",
      })
    );
  }

  async generate(options: VideoGenerateOptions): Promise<VideoGenerateResult> {
    const dimension =
      options.aspectRatio === "16:9"
        ? { width: 1920, height: 1080 }
        : options.aspectRatio === "1:1"
          ? { width: 1080, height: 1080 }
          : { width: 1080, height: 1920 }; // 9:16 default for UGC

    const body: Record<string, unknown> = {
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: options.avatarId,
            avatar_style: "normal",
          },
          voice: {
            type: "text",
            input_text: options.script,
            voice_id: "", // HeyGen will use default voice for avatar
          },
          ...(options.productImageUrl
            ? {
                background: {
                  type: "image",
                  url: options.productImageUrl,
                },
              }
            : {
                background: {
                  type: "color",
                  value: "#FFFFFF",
                },
              }),
        },
      ],
      dimension,
    };

    const res = await fetch(`${HEYGEN_API}/v2/video/generate`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `HeyGen generation error: ${(err as { message?: string }).message || res.status}`
      );
    }

    const data = await res.json();
    const videoId = data.data?.video_id;

    if (!videoId) {
      throw new Error("HeyGen did not return a video ID");
    }

    return {
      videoId,
      status: "queued",
    };
  }

  async getStatus(videoId: string): Promise<VideoGenerateResult> {
    const res = await fetch(
      `${HEYGEN_API}/v1/video_status.get?video_id=${videoId}`,
      { headers: this.headers() }
    );

    if (!res.ok) {
      throw new Error(`HeyGen status error: ${res.status}`);
    }

    const data = await res.json();
    const status = data.data?.status;
    const videoUrl = data.data?.video_url;
    const thumbnailUrl = data.data?.thumbnail_url;
    const duration = data.data?.duration;

    const mappedStatus: VideoGenerateResult["status"] =
      status === "completed"
        ? "completed"
        : status === "failed"
          ? "failed"
          : status === "processing"
            ? "processing"
            : "queued";

    return {
      videoId,
      status: mappedStatus,
      videoUrl: videoUrl || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      duration: duration ? Math.round(duration) : undefined,
      error: status === "failed" ? data.data?.error || "Generation failed" : undefined,
    };
  }
}
