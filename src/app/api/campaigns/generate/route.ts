import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { streamCampaign } from "@/lib/campaigns/generator";
import type { BrandDNA } from "@/lib/brand-dna/types";

const generateSchema = z.object({
  brandId: z.string(),
  goal: z.string().min(1),
  platforms: z.array(z.enum(["instagram", "linkedin", "facebook", "twitter"])),
  language: z.string().default("English"),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const { brandId, goal, platforms, language } = generateSchema.parse(body);

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: session.user.id },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const dna = brand.dna as unknown as BrandDNA;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = "";

        try {
          for await (const chunk of streamCampaign(
            dna,
            goal,
            platforms,
            language
          )) {
            fullContent += chunk;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`
              )
            );
          }

          // Parse the completed content and save
          const cleaned = fullContent
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
          const generated = JSON.parse(cleaned);

          const campaign = await prisma.campaign.create({
            data: {
              brandId,
              userId: session.user.id,
              goal,
              concepts: generated.concepts,
              assets: {
                create: generated.concepts.flatMap(
                  (concept: { assets: Array<{ platform: string; caption: string; hashtags: string[]; imagePrompt?: string }> }) =>
                    concept.assets.map(
                      (asset: { platform: string; caption: string; hashtags: string[]; imagePrompt?: string }) => ({
                        platform: asset.platform,
                        caption: asset.caption,
                        hashtags: asset.hashtags,
                        imagePrompt: asset.imagePrompt || null,
                        status: "draft",
                      })
                    )
                ),
              },
            },
            include: { assets: true },
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "complete", campaign })}\n\n`
            )
          );
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message:
                  error instanceof Error
                    ? error.message
                    : "Generation failed",
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
        { error: "Invalid input", details: error.issues },
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
