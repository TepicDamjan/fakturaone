"use server";

import {
  buildFreemiusCheckoutUrl,
  createFreemiusUpgradeCheckoutUrl,
  freemiusConfigured,
} from "@/lib/freemius";
import type { PlanTier } from "@/lib/plans";
import { fetchOrCreatePretplata } from "@/lib/pretplata.server";
import { createClient } from "@/utils/supabase/server";

export async function pokreniFreemiusPlacanje(
  planTier: PlanTier
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (planTier === "starter" || planTier === "enterprise") {
    return { ok: false, error: "Ovaj plan nije dostupan za online plaćanje." };
  }

  if (!freemiusConfigured()) {
    return {
      ok: false,
      error: "Online plaćanje još nije aktivirano. Pokušajte ponovo uskoro.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { ok: false, error: "Morate biti ulogovani." };
  }

  const pretplata = await fetchOrCreatePretplata(supabase, user.id);

  if (pretplata.freemius_license_id) {
    const upgradeUrl = await createFreemiusUpgradeCheckoutUrl(
      pretplata.freemius_license_id,
      planTier
    );
    if (upgradeUrl) {
      return { ok: true, url: upgradeUrl };
    }
  }

  const checkoutUrl = buildFreemiusCheckoutUrl(planTier, user.email);
  if (!checkoutUrl) {
    return {
      ok: false,
      error: "Checkout link nije konfigurisan za izabrani plan.",
    };
  }

  return { ok: true, url: checkoutUrl };
}
