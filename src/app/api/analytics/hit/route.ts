import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isPublicTrafficPath,
  recordPageView,
} from "@/features/analytics/infrastructure/analytics.repository";

export const runtime = "nodejs";

const hitSchema = z.object({
  path: z.string().min(1).max(500),
  visitorId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = hitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const path = parsed.data.path.startsWith("/")
      ? parsed.data.path
      : `/${parsed.data.path}`;

    if (!isPublicTrafficPath(path)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await recordPageView(path, parsed.data.visitorId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/analytics/hit]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
