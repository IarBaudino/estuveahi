import { NextResponse } from "next/server";
import { searchPublicEvents } from "@/features/events/infrastructure/event.repository";

export const runtime = "nodejs";

/** Prueba de render server-side con la misma lógica que /eventos */
export async function GET() {
  try {
    const { events, total } = await searchPublicEvents({ page: 1, limit: 6 });
    return NextResponse.json({ ok: true, events: events.length, total });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
