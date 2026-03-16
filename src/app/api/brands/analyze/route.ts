import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { crawlBrandDNA } from "@/lib/brand-dna/crawler";
import { prisma } from "@/lib/db";

const analyzeSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const { url } = analyzeSchema.parse(body);

    // Stream progress via SSE-style response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const dna = await crawlBrandDNA(url, (progress) => {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "progress", ...progress })}\n\n`
              )
            );
          });

          // Save to database
          const brand = await prisma.brand.create({
            data: {
              userId: session.user.id,
              name: dna.name,
              url: dna.url,
              dna: JSON.parse(JSON.stringify(dna)),
              logoUrl: dna.logoUrl,
              colors: dna.colors.map((c) => c.hex),
              fonts: dna.fonts.map((f) => f.family),
              tone: dna.tone.primary,
              industry: dna.industry,
              audience: dna.audience.primary,
            },
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "complete", brand: { ...brand, dna } })}\n\n`
            )
          );
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message:
                  error instanceof Error ? error.message : "Analysis failed",
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid URL", details: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
