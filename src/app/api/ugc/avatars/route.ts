import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireSession();

    // Load characters from the database first
    const characters = await prisma.uGCCharacter.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });

    if (characters.length > 0) {
      return NextResponse.json(
        characters.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          gender: c.gender,
          style: c.style,
          previewVideoUrl: c.previewVideoUrl,
          thumbnailUrl: c.thumbnailUrl,
        }))
      );
    }

    // Fallback: try to load from video provider (HeyGen/D-ID)
    try {
      const { getVideoProvider } = await import("@/lib/video/client");
      const provider = await getVideoProvider();
      const avatars = await provider.listAvatars();
      return NextResponse.json(avatars);
    } catch {
      // Return empty — the placeholder avatars will be used client-side
      return NextResponse.json([]);
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to fetch avatars:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch avatars" },
      { status: 500 }
    );
  }
}
