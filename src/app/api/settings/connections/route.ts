import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireSession();
    const connections = await prisma.socialConnection.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        platform: true,
        accountName: true,
        accountId: true,
        expiresAt: true,
      },
    });
    return NextResponse.json(connections);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
