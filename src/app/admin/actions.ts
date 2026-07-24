"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin.server";
import { PLAN_DEFS, type PlanTier } from "@/lib/plans";
import { createAdminClient } from "@/utils/supabase/admin";

type ActionResult = { ok: true } | { ok: false; error: string };

const DOZVOLJENI_MESECI = [1, 3, 6, 12] as const;

function periodEndFromNow(meseci: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + meseci);
  return d.toISOString();
}

export async function dodeliPlan(
  userId: string,
  plan: PlanTier,
  meseci: number
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) {
    return { ok: false, error: "Nemate pristup admin panelu." };
  }

  if (!userId?.trim()) {
    return { ok: false, error: "Korisnik nije izabran." };
  }

  if (!PLAN_DEFS[plan]) {
    return { ok: false, error: "Nepoznat plan." };
  }

  if (!DOZVOLJENI_MESECI.includes(meseci as (typeof DOZVOLJENI_MESECI)[number])) {
    return { ok: false, error: "Nevalidno trajanje plana." };
  }

  const supabase = createAdminClient();

  // Ručni grant: freemius kolone na null — po tome resolveEffectiveTier zna
  // da istek treba da gleda kroz current_period_end.
  const { error } = await supabase.from("pretplate").upsert(
    {
      user_id: userId,
      plan,
      status: "active",
      trial_ends_at: null,
      current_period_end: periodEndFromNow(meseci),
      freemius_license_id: null,
      freemius_user_id: null,
      freemius_plan_id: null,
      freemius_subscription_id: null,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/korisnici");
  return { ok: true };
}

export async function ukiniPlan(userId: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) {
    return { ok: false, error: "Nemate pristup admin panelu." };
  }

  if (!userId?.trim()) {
    return { ok: false, error: "Korisnik nije izabran." };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("pretplate").upsert(
    {
      user_id: userId,
      plan: "starter",
      status: "expired",
      trial_ends_at: null,
      current_period_end: null,
      freemius_license_id: null,
      freemius_user_id: null,
      freemius_plan_id: null,
      freemius_subscription_id: null,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/korisnici");
  return { ok: true };
}
