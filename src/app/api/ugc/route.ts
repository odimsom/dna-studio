import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

// List all UGC videos
export async function GET() {
  try {
    const session = await requireSession();
    const videos = await prisma.uGCVideo.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productDescription: true,
        avatarName: true,
        avatarThumbnail: true,
        script: true,
        videoUrl: true,
        thumbnailUrl: true,
        provider: true,
        aspectRatio: true,
        status: true,
        duration: true,
        createdAt: true,
      },
    });
    return NextResponse.json(videos);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create a new UGC video record
export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();

    const video = await prisma.uGCVideo.create({
      data: {
        userId: session.user.id,
        productImage: body.productImage || null,
        productDescription: body.productDescription || null,
        avatarId: body.avatarId,
        avatarName: body.avatarName || null,
        avatarThumbnail: body.avatarThumbnail || null,
        script: body.script,
        scriptSource: body.scriptSource || "custom",
        provider: body.provider || "heygen",
        aspectRatio: body.aspectRatio || "9:16",
        status: "generating",
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
