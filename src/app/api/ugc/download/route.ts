import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta";

/**
 * Proxy endpoint to download Veo-generated videos without exposing the API key.
 * GET /api/ugc/download?fileId=XXXX
 */
export async function GET(req: Request) {
  try {
    await requireSession();

    const url = new URL(req.url);
    const fileId = url.searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
    }

    // Validate fileId format (alphanumeric only)
    if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
      return NextResponse.json({ error: "Invalid fileId" }, { status: 400 });
    }

    // Resolve API key
    let apiKey: string;
    try {
      const { resolveSettings } = await import("@/lib/settings/resolve");
      const settings = await resolveSettings();
      apiKey = settings.videoApiKey || process.env.GOOGLE_API_KEY || "";
    } catch {
      apiKey = process.env.GOOGLE_API_KEY || "";
    }

    if (!apiKey) {
      return NextResponse.json({ error: "No API key configured" }, { status: 500 });
    }

    const downloadUrl = `${GEMINI_API}/files/${fileId}?alt=media`;
    const res = await fetch(downloadUrl, {
      headers: { "x-goog-api-key": apiKey },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Download failed: ${res.status}` },
        { status: res.status }
      );
    }

    const videoBuffer = await res.arrayBuffer();

    return new NextResponse(videoBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `inline; filename="ugc-video.mp4"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
