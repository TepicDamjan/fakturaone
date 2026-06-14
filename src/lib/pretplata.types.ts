import type { PlanLimits, PlanTier, SubscriptionStatus } from "@/lib/plans";

export type PretplataPregled = {
  tier: PlanTier;
  tierLabel: string;
  subscribedPlan: PlanTier;
  status: SubscriptionStatus;
  isTrial: boolean;
  trialDaysLeft: number | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  limits: PlanLimits;
  usage: {
    dokumentiMesecno: number;
    klijenti: number;
    firme: number;
  };
};
