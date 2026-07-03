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
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const signature = request.headers.get("x-signature");
  if (!verifyFreemiusWebhookSignature(rawBody, signature)) {
    return new NextResponse(null, { status: 200 });
  }

  let event: FreemiusWebhookEvent;
  try {
    event = JSON.parse(rawBody) as FreemiusWebhookEvent;
  } catch {
    return new NextResponse(null, { status: 200 });
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
    console.error("[freemius webhook]", event.type, err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
