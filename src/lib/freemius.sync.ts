import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { PlanTier } from "@/lib/plans";
import {
  tierFromFreemiusPlanId,
  type FreemiusLicensePayload,
} from "@/lib/freemius";

type AdminSupabase = SupabaseClient<Database>;

type SyncInput = {
  email: string;
  license: FreemiusLicensePayload;
  subscriptionId?: string | null;
};

function licenseCanceled(license: FreemiusLicensePayload): boolean {
  return Boolean(license.is_canceled ?? license.is_cancelled);
}

function licenseExpired(expiration: string | null | undefined): boolean {
  if (!expiration) return false;
  return new Date(expiration).getTime() <= Date.now();
}

function resolveStatus(
  license: FreemiusLicensePayload
): Database["public"]["Enums"]["subscription_status"] {
  if (licenseCanceled(license)) return "canceled";
  if (licenseExpired(license.expiration)) return "expired";
  return "active";
}

export async function findUserIdByEmail(
  supabase: AdminSupabase,
  email: string
): Promise<string | null> {
  const { data, error } = await supabase.rpc("user_id_by_email", {
    p_email: email,
  });

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function syncPretplataFromFreemius(
  supabase: AdminSupabase,
  input: SyncInput
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "Email korisnika nije prosleđen." };
  }

  const userId = await findUserIdByEmail(supabase, email);
  if (!userId) {
    return {
      ok: false,
      error: `Korisnik sa emailom ${email} nije pronađen u aplikaciji.`,
    };
  }

  const fsPlanId = String(input.license.plan_id);
  const mappedPlan: PlanTier = tierFromFreemiusPlanId(fsPlanId) ?? "professional";
  const status = resolveStatus(input.license);

  const row = {
    user_id: userId,
    plan: mappedPlan,
    status,
    trial_ends_at: null,
    current_period_end: input.license.expiration ?? null,
    freemius_license_id: String(input.license.id),
    freemius_user_id: input.license.user_id != null ? String(input.license.user_id) : null,
    freemius_plan_id: fsPlanId,
    freemius_subscription_id: input.subscriptionId ?? null,
  };

  const { error } = await supabase.from("pretplate").upsert(row, {
    onConflict: "user_id",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, userId };
}
