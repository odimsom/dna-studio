import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getVideoProvider } from "@/lib/video/client";
import { generateText } from "@/lib/llm/client";
import type { LLMMessage } from "@/lib/llm/client";

// Generate a UGC script via LLM
export async function POST(req: Request) {
  try {
    await requireSession();

    const body = await req.json();
    const { action, productDescription, avatarName, script, avatarId, aspectRatio, productImageUrl } = body;

    if (action === "script") {
      // Generate a UGC-style script using the LLM
      const messages: LLMMessage[] = [
        {
          role: "system",
          content: `You are a professional UGC (User Generated Content) script writer for social media video ads.

Your job is to write authentic, conversational scripts that sound like a real creator filmed themselves talking about a product they love — NOT a polished corporate ad.

IMPORTANT RULES:
- The script MUST be between 60 and 100 words long. Never write fewer than 60 words.
- Structure: Start with an attention-grabbing hook (1-2 sentences), then share 2-3 specific benefits or personal experiences with the product, then end with a clear call to action.
- Write in first person as if you are the creator speaking directly to camera.
- Be enthusiastic but genuine — use natural language, contractions, and casual tone.
- Do NOT include any stage directions, camera notes, brackets, parentheses, or formatting.
- Do NOT include emojis.
- Output ONLY the spoken script text, nothing else.`,
        },
        {
          role: "user",
          content: `Write a UGC-style video script for the following product. The script should be 60-100 words, feel natural and conversational, and make viewers want to try the product.

Product: ${productDescription}

The creator's name is ${avatarName || "the creator"}.

Remember: write at least 60 words. Include a hook, benefits, and a call to action.`,
        },
      ];

      const generatedScript = await generateText(messages, {
        temperature: 0.8,
        maxTokens: 1024,
      });

      return NextResponse.json({ script: generatedScript.trim() });
    }

    if (action === "video") {
      // Actually generate the video via provider
      const provider = await getVideoProvider();

      const result = await provider.generate({
        script: script as string,
        avatarId: avatarId as string,
        productImageUrl: productImageUrl as string | undefined,
        aspectRatio: (aspectRatio as "9:16" | "16:9" | "1:1") || "9:16",
      });

      return NextResponse.json(result);
    }

    if (action === "status") {
      // Poll for video status
      const provider = await getVideoProvider();
      const result = await provider.getStatus(body.videoId as string);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("UGC generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
