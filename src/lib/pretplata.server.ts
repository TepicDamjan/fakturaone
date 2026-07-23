import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  planLabel,
  planLimits,
  PRO_TRIAL_DAYS,
  type PlanTier,
} from "@/lib/plans";
import type { PretplataPregled } from "@/lib/pretplata.types";

export type { PretplataPregled } from "@/lib/pretplata.types";

type Supabase = SupabaseClient<Database>;

export type PretplataRow = Database["public"]["Tables"]["pretplate"]["Row"];

function startOfCurrentMonthIso(): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function resolveEffectiveTier(row: PretplataRow): {
  tier: PlanTier;
  isTrial: boolean;
  trialDaysLeft: number | null;
} {
  const now = Date.now();
  const trialActive =
    row.status === "trialing" &&
    row.trial_ends_at != null &&
    new Date(row.trial_ends_at).getTime() > now;

  if (trialActive) {
    return {
      tier: row.plan,
      isTrial: true,
      trialDaysLeft: daysUntil(row.trial_ends_at!),
    };
  }

  if (row.status === "active" || row.status === "past_due") {
    return { tier: row.plan, isTrial: false, trialDaysLeft: null };
  }

  return { tier: "starter", isTrial: false, trialDaysLeft: null };
}

async function countDokumentiMesecno(
  supabase: Supabase,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("fakture")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfCurrentMonthIso());

  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function countKlijenti(supabase: Supabase, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("klijenti")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function countFirme(supabase: Supabase, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("firma")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

function trialEndsAtFromNow(): string {
  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + PRO_TRIAL_DAYS);
  return trialEnds.toISOString();
}

function hasPaidSubscription(row: PretplataRow): boolean {
  return (
    row.status === "active" ||
    row.status === "past_due" ||
    Boolean(row.freemius_license_id)
  );
}

function isTrialActive(row: PretplataRow): boolean {
  return (
    row.status === "trialing" &&
    row.trial_ends_at != null &&
    new Date(row.trial_ends_at).getTime() > Date.now()
  );
}

/** Aktivira 14 dana Professional — pri registraciji ili prvom ulasku */
export async function ensureProTrialForUser(
  supabase: Supabase,
  userId: string
): Promise<PretplataRow> {
  const { data: existing, error } = await supabase
    .from("pretplate")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (existing) {
    if (hasPaidSubscription(existing) || isTrialActive(existing)) {
      return existing;
    }
    return existing;
  }

  const { data: created, error: insertErr } = await supabase
    .from("pretplate")
    .insert({
      user_id: userId,
      plan: "professional",
      status: "trialing",
      trial_ends_at: trialEndsAtFromNow(),
    })
    .select("*")
    .single();

  if (insertErr || !created) {
    throw new Error(insertErr?.message ?? "Greška pri kreiranju pretplate.");
  }

  return created;
}

export async function fetchOrCreatePretplata(
  supabase: Supabase,
  userId: string
): Promise<PretplataRow> {
  const { data: existing, error } = await supabase
    .from("pretplate")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (existing) return existing;

  return ensureProTrialForUser(supabase, userId);
}

export async function fetchPretplataPregled(
  supabase: Supabase,
  userId: string
): Promise<PretplataPregled> {
  const row = await fetchOrCreatePretplata(supabase, userId);
  const effective = resolveEffectiveTier(row);
  const limits = planLimits(effective.tier);

  const [dokumentiMesecno, klijenti, firme] = await Promise.all([
    countDokumentiMesecno(supabase, userId),
    countKlijenti(supabase, userId),
    countFirme(supabase, userId),
  ]);

  return {
    tier: effective.tier,
    tierLabel: planLabel(effective.tier),
    subscribedPlan: row.plan,
    status: row.status,
    isTrial: effective.isTrial,
    trialDaysLeft: effective.trialDaysLeft,
    trialEndsAt: row.trial_ends_at,
    currentPeriodEnd: row.current_period_end,
    limits,
    usage: { dokumentiMesecno, klijenti, firme },
  };
}

function limitExceeded(current: number, max: number): boolean {
  return Number.isFinite(max) && current >= max;
}

export async function proveriLimitDokumenta(
  supabase: Supabase,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const pregled = await fetchPretplataPregled(supabase, userId);
  const { dokumentiMesecno } = pregled.limits;

  if (limitExceeded(pregled.usage.dokumentiMesecno, dokumentiMesecno)) {
    return {
      ok: false,
      error: `Dostigli ste mesečni limit od ${dokumentiMesecno} dokumenata na ${pregled.tierLabel} planu. Nadogradite plan za neograničene dokumente.`,
    };
  }

  return { ok: true };
}

export async function proveriLimitKlijenata(
  supabase: Supabase,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const pregled = await fetchPretplataPregled(supabase, userId);
  const { klijenti } = pregled.limits;

  if (limitExceeded(pregled.usage.klijenti, klijenti)) {
    return {
      ok: false,
      error: `Dostigli ste limit od ${klijenti} klijenata na ${pregled.tierLabel} planu. Nadogradite plan za više klijenata.`,
    };
  }

  return { ok: true };
}

export async function proveriLimitFirme(
  supabase: Supabase,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const pregled = await fetchPretplataPregled(supabase, userId);
  const { firme } = pregled.limits;

  if (limitExceeded(pregled.usage.firme, firme)) {
    return {
      ok: false,
      error: `Dostigli ste limit od ${firme} preduzeća na ${pregled.tierLabel} planu. Nadogradite plan za više preduzeća.`,
    };
  }

  return { ok: true };
}

export async function proveriEmailSlanje(
  supabase: Supabase,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const pregled = await fetchPretplataPregled(supabase, userId);

  if (!pregled.limits.emailSlanje) {
    return {
      ok: false,
      error: `Slanje dokumenata emailom nije dostupno na ${pregled.tierLabel} planu. Nadogradite na Professional.`,
    };
  }

  return { ok: true };
}

export async function proveriPristupIzvestajima(
  supabase: Supabase,
  userId: string
): Promise<{ ok: true; pregled: PretplataPregled } | { ok: false; pregled: PretplataPregled }> {
  const pregled = await fetchPretplataPregled(supabase, userId);

  if (!pregled.limits.izvestaji) {
    return { ok: false, pregled };
  }

  return { ok: true, pregled };
}

export function defaultPretplataPregled(): PretplataPregled {
  return {
    tier: "starter",
    tierLabel: planLabel("starter"),
    subscribedPlan: "starter",
    status: "expired",
    isTrial: false,
    trialDaysLeft: null,
    trialEndsAt: null,
    currentPeriodEnd: null,
    limits: planLimits("starter"),
    usage: { dokumentiMesecno: 0, klijenti: 0, firme: 0 },
  };
}
