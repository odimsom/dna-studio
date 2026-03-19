import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

// Get a single UGC video
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const video = await prisma.uGCVideo.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!video) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Update UGC video (status, videoUrl, etc.)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.uGCVideo.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const video = await prisma.uGCVideo.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.videoUrl && { videoUrl: body.videoUrl }),
        ...(body.thumbnailUrl && { thumbnailUrl: body.thumbnailUrl }),
        ...(body.providerVideoId && { providerVideoId: body.providerVideoId }),
        ...(body.duration !== undefined && { duration: body.duration }),
        ...(body.errorMessage && { errorMessage: body.errorMessage }),
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete a UGC video
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const existing = await prisma.uGCVideo.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.uGCVideo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
