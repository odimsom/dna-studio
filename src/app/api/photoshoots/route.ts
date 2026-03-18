import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

// List all photoshoots
export async function GET() {
  try {
    const session = await requireSession();
    const photoshoots = await prisma.photoshoot.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productDescription: true,
        templates: true,
        status: true,
        results: true,
        createdAt: true,
      },
    });
    return NextResponse.json(photoshoots);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create a new photoshoot
export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const { productImage, productDescription, templates, results } = body;

    const photoshoot = await prisma.photoshoot.create({
      data: {
        userId: session.user.id,
        productImage: productImage || null,
        productDescription: productDescription || null,
        templates,
        results: JSON.parse(JSON.stringify(results)),
        status: "generating",
      },
    });

    return NextResponse.json(photoshoot, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
