import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export interface UserSettings {
  llmProvider?: string;
  llmApiKey?: string;
  llmModel?: string;
  ollamaUrl?: string;
  imageProvider?: string;
  imageApiKey?: string;
}

export async function GET() {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true },
    });

    const settings = (user?.settings as unknown as UserSettings) || {};
    // Mask API keys for display
    const masked: UserSettings = {
      ...settings,
      llmApiKey: settings.llmApiKey ? maskKey(settings.llmApiKey) : "",
      imageApiKey: settings.imageApiKey ? maskKey(settings.imageApiKey) : "",
    };

    return NextResponse.json(masked);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as UserSettings;

    // Get current settings to preserve keys that weren't changed
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true },
    });
    const current = (user?.settings as unknown as UserSettings) || {};

    const updated: UserSettings = {
      llmProvider: body.llmProvider ?? current.llmProvider,
      llmModel: body.llmModel ?? current.llmModel,
      ollamaUrl: body.ollamaUrl ?? current.ollamaUrl,
      imageProvider: body.imageProvider ?? current.imageProvider,
      // Only update keys if the value isn't a masked placeholder
      llmApiKey:
        body.llmApiKey && !body.llmApiKey.includes("••••")
          ? body.llmApiKey
          : current.llmApiKey,
      imageApiKey:
        body.imageApiKey && !body.imageApiKey.includes("••••")
          ? body.imageApiKey
          : current.imageApiKey,
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { settings: JSON.parse(JSON.stringify(updated)) },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[Settings] Failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function maskKey(key: string): string {
  if (key.length <= 8) return "••••";
  return key.slice(0, 4) + "••••" + key.slice(-4);
}
