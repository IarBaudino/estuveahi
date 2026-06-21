import { NextResponse } from "next/server";
import { auth } from "@/infrastructure/auth";
import { getProfileById } from "@/features/profile/infrastructure/profile.repository";
import { getPhotographerApplicationStatus } from "@/features/auth/infrastructure/auth.repository";
import { getPhotographerEvents } from "@/features/events/infrastructure/event.repository";
import { getPendingRequestCount } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { getPhotographerPhotoCount } from "@/features/photos/infrastructure/photo.repository";

/** Diagnóstico del panel fotógrafo — requiere sesión activa. */
export async function GET() {
  const steps: Record<string, { ok: boolean; detail?: string }> = {};

  try {
    const session = await auth();
    steps.auth = {
      ok: Boolean(session?.user),
      detail: session?.user
        ? `role=${session.user.role}, id=${session.user.id ? "yes" : "missing"}`
        : "no session",
    };

    const userId = session?.user?.id?.trim();
    if (!userId) {
      return NextResponse.json({ ok: false, steps });
    }

    try {
      const profile = await getProfileById(userId);
      steps.profile = {
        ok: Boolean(profile),
        detail: profile ? `role=${profile.role}` : "not found",
      };
    } catch (error) {
      steps.profile = {
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    try {
      const status = await getPhotographerApplicationStatus(userId);
      steps.application = { ok: true, detail: status ?? "none" };
    } catch (error) {
      steps.application = {
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    try {
      const [events, pending, photos] = await Promise.all([
        getPhotographerEvents(userId),
        getPendingRequestCount(userId),
        getPhotographerPhotoCount(userId),
      ]);
      steps.dashboard = {
        ok: true,
        detail: `events=${events.length}, pending=${pending}, photos=${photos}`,
      };
    } catch (error) {
      steps.dashboard = {
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    const ok = Object.values(steps).every((step) => step.ok);
    return NextResponse.json({ ok, steps });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        steps,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
