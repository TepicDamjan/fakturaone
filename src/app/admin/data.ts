import type { User } from "@supabase/supabase-js";
import { resolveEffectiveTier, type PretplataRow } from "@/lib/pretplata.server";
import { planLabel, type PlanTier } from "@/lib/plans";
import { createAdminClient } from "@/utils/supabase/admin";

export type AdminKorisnik = {
  id: string;
  email: string;
  ime: string | null;
  registrovan: string;
  poslednjaPrijava: string | null;
  /** Plan iz reda pretplate (šta je upisano u bazi) */
  plan: PlanTier;
  status: PretplataRow["status"] | null;
  /** Efektivni plan nakon provere trial-a i isteka */
  efektivniPlan: PlanTier;
  efektivniPlanLabel: string;
  isTrial: boolean;
  /** Datum isteka — trial ili period ručnog granta */
  istice: string | null;
  /** Ručno dodeljen plan (bez Freemius veze) */
  rucniGrant: boolean;
};

async function listSviKorisnici(): Promise<User[]> {
  const supabase = createAdminClient();
  const users: User[] = [];
  const perPage = 1000;
  let page = 1;

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);

    users.push(...data.users);
    if (data.users.length < perPage) break;
    page += 1;
  }

  return users;
}

export async function fetchAdminKorisnici(): Promise<AdminKorisnik[]> {
  const supabase = createAdminClient();

  const [users, pretplateRes] = await Promise.all([
    listSviKorisnici(),
    supabase.from("pretplate").select("*"),
  ]);

  if (pretplateRes.error) throw new Error(pretplateRes.error.message);

  const pretplataPoUseru = new Map<string, PretplataRow>(
    (pretplateRes.data ?? []).map((row) => [row.user_id, row])
  );

  return users
    .map((user) => {
      const row = pretplataPoUseru.get(user.id) ?? null;
      const effective = row
        ? resolveEffectiveTier(row)
        : { tier: "starter" as PlanTier, isTrial: false, trialDaysLeft: null };

      const rucniGrant = Boolean(
        row &&
          (row.status === "active" || row.status === "past_due") &&
          row.freemius_license_id == null &&
          row.freemius_subscription_id == null &&
          row.current_period_end != null
      );

      const istice = row
        ? row.status === "trialing"
          ? row.trial_ends_at
          : row.current_period_end
        : null;

      return {
        id: user.id,
        email: user.email ?? "—",
        ime: (user.user_metadata?.full_name as string | undefined) ?? null,
        registrovan: user.created_at,
        poslednjaPrijava: user.last_sign_in_at ?? null,
        plan: row?.plan ?? "starter",
        status: row?.status ?? null,
        efektivniPlan: effective.tier,
        efektivniPlanLabel: planLabel(effective.tier),
        isTrial: effective.isTrial,
        istice,
        rucniGrant,
      };
    })
    .sort(
      (a, b) => new Date(b.registrovan).getTime() - new Date(a.registrovan).getTime()
    );
}
