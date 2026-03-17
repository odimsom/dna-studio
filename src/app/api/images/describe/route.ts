import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { getLLMProvider } from "@/lib/llm/client";

const schema = z.object({
  imageUrl: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await requireSession();
    const body = await request.json();
    const { imageUrl } = schema.parse(body);

    const provider = await getLLMProvider();
    const response = await provider.generate(
      [
        {
          role: "system",
          content:
            "You are a product photography expert. Analyze the product image and provide a detailed visual description that can be used to generate new product photography. Focus on: the product type, shape, colors, materials, textures, branding elements, and any distinctive features. Be specific and concise.",
        },
        {
          role: "user",
          content: `Describe this product in detail for generating professional product photography. Image: ${imageUrl}`,
        },
      ],
      { maxTokens: 500, temperature: 0.3 }
    );

    return NextResponse.json({ description: response.content });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[Image Describe] Failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to describe image" },
      { status: 500 }
    );
  }
}
