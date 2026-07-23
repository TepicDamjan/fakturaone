export type PlanTier = "starter" | "professional" | "business" | "enterprise";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export type PlanLimits = {
  firme: number;
  dokumentiMesecno: number;
  klijenti: number;
  emailSlanje: boolean;
  izvestaji: boolean;
  pdfWatermark: boolean;
};

export type PlanDef = {
  id: PlanTier;
  naziv: string;
  cenaMesecno: number | null;
  cenaTekst: string;
  opis: string;
  istaknuto?: boolean;
  features: string[];
  limits: PlanLimits;
};

const UNLIMITED = Number.POSITIVE_INFINITY;

/** Besplatan probni Professional plan za nove korisnike */
export const PRO_TRIAL_DAYS = 14;

export const PRO_TRIAL_LABEL = `${PRO_TRIAL_DAYS} dana besplatno`;

export const PLAN_DEFS: Record<PlanTier, PlanDef> = {
  starter: {
    id: "starter",
    naziv: "Starter",
    cenaMesecno: 0,
    cenaTekst: "0€",
    opis: "Besplatan plan za upoznavanje sa aplikacijom.",
    features: [
      "1 preduzeće",
      "Do 10 dokumenata mesečno",
      "Do 20 klijenata",
      "PDF preuzimanje",
      "Osnovni dashboard",
    ],
    limits: {
      firme: 1,
      dokumentiMesecno: 10,
      klijenti: 20,
      emailSlanje: false,
      izvestaji: false,
      pdfWatermark: true,
    },
  },
  professional: {
    id: "professional",
    naziv: "Professional",
    cenaMesecno: 15,
    cenaTekst: "15€",
    opis: "Za freelancere i mala preduzeća sa punim pristupom.",
    istaknuto: true,
    features: [
      `${PRO_TRIAL_LABEL} — pun pristup`,
      "1 preduzeće",
      "Neograničeni dokumenti",
      "Neograničeni klijenti",
      "Slanje PDF-a emailom",
      "Napredni izveštaji",
      "Više bankovnih računa",
    ],
    limits: {
      firme: 1,
      dokumentiMesecno: UNLIMITED,
      klijenti: UNLIMITED,
      emailSlanje: true,
      izvestaji: true,
      pdfWatermark: false,
    },
  },
  business: {
    id: "business",
    naziv: "Business",
    cenaMesecno: 29,
    cenaTekst: "29€",
    opis: "Za više preduzeća i rastuće timove.",
    features: [
      "Do 5 preduzeća",
      "Sve iz Professional paketa",
      "Napredna analitika",
      "Prioritetna podrška",
    ],
    limits: {
      firme: 5,
      dokumentiMesecno: UNLIMITED,
      klijenti: UNLIMITED,
      emailSlanje: true,
      izvestaji: true,
      pdfWatermark: false,
    },
  },
  enterprise: {
    id: "enterprise",
    naziv: "Enterprise",
    cenaMesecno: null,
    cenaTekst: "Dogovor",
    opis: "Prilagođeno rešenje za veće organizacije.",
    features: [
      "Neograničeno preduzeća",
      "Timski pristup",
      "API integracije",
      "Posvećen account manager",
      "SLA i enterprise podrška",
    ],
    limits: {
      firme: UNLIMITED,
      dokumentiMesecno: UNLIMITED,
      klijenti: UNLIMITED,
      emailSlanje: true,
      izvestaji: true,
      pdfWatermark: false,
    },
  },
};

export const PLANS_ORDER: PlanTier[] = [
  "starter",
  "professional",
  "business",
  "enterprise",
];

export function planLabel(tier: PlanTier): string {
  return PLAN_DEFS[tier].naziv;
}

export function planLimits(tier: PlanTier): PlanLimits {
  return PLAN_DEFS[tier].limits;
}

export function isUnlimited(n: number): boolean {
  return !Number.isFinite(n);
}

export function formatLimit(n: number): string {
  return isUnlimited(n) ? "Neograničeno" : String(n);
}
