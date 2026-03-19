export interface VideoGenerateOptions {
  script: string;
  avatarId: string;
  productImageUrl?: string;
  aspectRatio?: "9:16" | "16:9" | "1:1";
}

export interface VideoGenerateResult {
  videoId: string; // provider-side ID for polling
  status: "queued" | "processing" | "completed" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number; // seconds
  error?: string;
}

export interface VideoAvatar {
  id: string;
  name: string;
  thumbnailUrl: string;
  gender: "male" | "female";
  style: string; // e.g. "professional", "casual", "energetic"
}

export interface VideoProvider {
  /** List available AI avatars */
  listAvatars(): Promise<VideoAvatar[]>;

  /** Start video generation — returns immediately with a job ID */
  generate(options: VideoGenerateOptions): Promise<VideoGenerateResult>;

  /** Poll for video generation status */
  getStatus(videoId: string): Promise<VideoGenerateResult>;
}
