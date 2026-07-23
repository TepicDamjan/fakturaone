import { NextResponse } from "next/server";
import {
  fetchFreemiusLicense,
  fetchFreemiusUserEmail,
  freemiusServerReady,
  isFreemiusRedirectSignatureValid,
  parseCheckoutRedirect,
} from "@/lib/freemius";
import { syncPretplataFromFreemius } from "@/lib/freemius.sync";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  const redirectBase = new URL("/dashboard/nadogradi", request.url);

  if (!freemiusServerReady()) {
    redirectBase.searchParams.set("greska", "placanje_nije_podeseno");
    return NextResponse.redirect(redirectBase);
  }

  const currentUrl = request.url;
  const url = new URL(currentUrl);
  const redirect = parseCheckoutRedirect(url.searchParams);
  const signatureOk = isFreemiusRedirectSignatureValid(currentUrl);

  if (!signatureOk) {
    console.warn("[freemius checkout] Nevalidan potpis redirect-a, sync odbijen:", redirect.license_id);
    redirectBase.searchParams.set("greska", "nevalidan_potpis");
    return NextResponse.redirect(redirectBase);
  }

  if (!redirect.license_id) {
    redirectBase.searchParams.set("greska", "nedostaju_podataci");
    return NextResponse.redirect(redirectBase);
  }

  try {
    const supabase = createAdminClient();
    const license = await fetchFreemiusLicense(redirect.license_id);

    if (!license) {
      redirectBase.searchParams.set("greska", "sync");
      return NextResponse.redirect(redirectBase);
    }

    // Email primarno iz Freemius API-ja; query parametar samo kao fallback
    // (potpis je već verifikovan, pa je parametar zaštićen od izmene).
    let email: string | undefined;
    if (license.user_id != null) {
      email = (await fetchFreemiusUserEmail(license.user_id)) ?? undefined;
    }
    if (!email) {
      email = redirect.email?.trim() || undefined;
    }

    if (!email) {
      redirectBase.searchParams.set("greska", "nedostaju_podataci");
      return NextResponse.redirect(redirectBase);
    }

    const result = await syncPretplataFromFreemius(supabase, {
      email,
      license,
      subscriptionId: redirect.subscription_id ?? null,
    });

    if (!result.ok) {
      redirectBase.searchParams.set("greska", "sync");
      return NextResponse.redirect(redirectBase);
    }

    redirectBase.searchParams.set("uspesno", "1");
    return NextResponse.redirect(redirectBase);
  } catch (err) {
    console.error("[freemius checkout]", err);
    redirectBase.searchParams.set("greska", "server");
    return NextResponse.redirect(redirectBase);
  }
}
