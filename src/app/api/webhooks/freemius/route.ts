import { NextResponse } from "next/server";
import {
  freemiusServerReady,
  verifyFreemiusWebhookSignature,
  type FreemiusWebhookEvent,
} from "@/lib/freemius";
import { syncPretplataFromFreemius } from "@/lib/freemius.sync";
import { createAdminClient } from "@/utils/supabase/admin";

const LICENSE_EVENTS = new Set([
  "license.created",
  "license.updated",
  "license.extended",
  "license.shortened",
  "license.cancelled",
  "license.expired",
  "license.plan.changed",
]);

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!freemiusServerReady()) {
    console.error("[freemius webhook] Freemius env promenljive nisu podešene.");
    return NextResponse.json({ error: "nije_podeseno" }, { status: 503 });
  }

  const signature = request.headers.get("x-signature");
  if (!verifyFreemiusWebhookSignature(rawBody, signature)) {
    console.warn("[freemius webhook] Nevalidan potpis webhook zahteva.");
    return NextResponse.json({ error: "nevalidan_potpis" }, { status: 401 });
  }

  let event: FreemiusWebhookEvent;
  try {
    event = JSON.parse(rawBody) as FreemiusWebhookEvent;
  } catch {
    return NextResponse.json({ error: "nevalidan_json" }, { status: 400 });
  }

  if (!LICENSE_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const fsUser = event.objects?.user;
  const fsLicense = event.objects?.license;

  if (!fsUser?.email || !fsLicense?.id) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    const supabase = createAdminClient();
    const subscriptionId =
      event.objects?.subscription?.id != null
        ? String(event.objects.subscription.id)
        : null;

    await syncPretplataFromFreemius(supabase, {
      email: fsUser.email,
      license: fsLicense,
      subscriptionId,
    });
  } catch (err) {
    // Sync je idempotentan (upsert po user_id), pa je Freemius retry bezbedan.
    console.error("[freemius webhook]", event.type, err);
    return NextResponse.json({ error: "sync" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
