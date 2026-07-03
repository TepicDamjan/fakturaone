import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { PlanTier } from "@/lib/plans";
import { getSiteUrl } from "@/lib/site";

export type FreemiusLicensePayload = {
  id: string | number;
  plan_id: string | number;
  pricing_id?: string | number | null;
  user_id?: string | number | null;
  expiration?: string | null;
  is_canceled?: boolean;
  is_cancelled?: boolean;
};

export type FreemiusUserPayload = {
  id?: string | number;
  email: string;
  first?: string;
  last?: string;
};

export type FreemiusWebhookEvent = {
  type: string;
  objects?: {
    user?: FreemiusUserPayload;
    license?: FreemiusLicensePayload;
    subscription?: { id?: string | number };
  };
  data?: {
    license_id?: string | number;
    user_id?: string | number;
  };
};

export type FreemiusCheckoutRedirect = {
  user_id?: string;
  plan_id?: string;
  email?: string;
  pricing_id?: string;
  currency?: string;
  subscription_id?: string;
  billing_cycle?: string;
  license_id?: string;
  expiration?: string;
  action?: string;
  signature?: string;
};

function env(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v || undefined;
}

export function freemiusConfigured(): boolean {
  return Boolean(
    env("FREEMIUS_PRODUCT_ID") &&
      env("FREEMIUS_SECRET_KEY") &&
      env("FREEMIUS_API_BEARER_TOKEN") &&
      env("FREEMIUS_PLAN_PROFESSIONAL") &&
      env("FREEMIUS_PLAN_BUSINESS")
  );
}

export function freemiusServerReady(): boolean {
  return freemiusConfigured() && Boolean(env("SUPABASE_SERVICE_ROLE_KEY"));
}

export function freemiusProductId(): string {
  const id = env("FREEMIUS_PRODUCT_ID");
  if (!id) throw new Error("FREEMIUS_PRODUCT_ID nije podešen.");
  return id;
}

export function freemiusSecretKey(): string {
  const key = env("FREEMIUS_SECRET_KEY");
  if (!key) throw new Error("FREEMIUS_SECRET_KEY nije podešen.");
  return key;
}

export function freemiusApiToken(): string {
  const token = env("FREEMIUS_API_BEARER_TOKEN");
  if (!token) throw new Error("FREEMIUS_API_BEARER_TOKEN nije podešen.");
  return token;
}

export function freemiusPlanIdForTier(tier: PlanTier): string | null {
  switch (tier) {
    case "professional":
      return env("FREEMIUS_PLAN_PROFESSIONAL") ?? null;
    case "business":
      return env("FREEMIUS_PLAN_BUSINESS") ?? null;
    default:
      return null;
  }
}

export function tierFromFreemiusPlanId(planId: string | number): PlanTier | null {
  const id = String(planId);
  const professional = env("FREEMIUS_PLAN_PROFESSIONAL");
  const business = env("FREEMIUS_PLAN_BUSINESS");

  if (professional && id === professional) return "professional";
  if (business && id === business) return "business";
  return null;
}

export function siteUrl(): string {
  return getSiteUrl();
}

/** Tačan URL iz Freemius Dashboard → Plans → Customization → Redirect URL */
export function freemiusCheckoutRedirectUrl(): string {
  const configured = env("FREEMIUS_CHECKOUT_REDIRECT_URL");
  if (configured) return configured.replace(/\/$/, "");
  return `${siteUrl()}/api/freemius/checkout`;
}

/**
 * Freemius potpisuje URL podešen u dashboardu. Za lokalni dev često treba
 * FREEMIUS_CHECKOUT_REDIRECT_URL=http://localhost:3000/api/freemius/checkout
 */
export function buildFreemiusVerificationUrl(requestUrl: string): string {
  const incoming = new URL(requestUrl);
  const base = new URL(freemiusCheckoutRedirectUrl());
  base.search = incoming.search;
  return base.toString();
}

export function verifyFreemiusRedirectSignature(fullUrl: string): boolean {
  const signatureMatch = fullUrl.match(/(?:\?|&)signature=([^&]+)/);
  const signature = signatureMatch?.[1];
  if (!signature) return false;

  // Freemius: ukloni &signature=... sa kraja URL-a (ne rekonstruiši query)
  let unsigned = fullUrl.replace(/&signature=[^&]*$/, "");
  if (unsigned.includes("?signature=")) {
    unsigned = unsigned.replace(/\?signature=[^&]*(?=&|$)/, "?").replace(/\?$/, "");
  }

  const hash = createHash("sha256").update(unsigned).digest("hex");
  const decodedSig = decodeURIComponent(signature);

  try {
    const a = Buffer.from(hash, "utf8");
    const b = Buffer.from(decodedSig, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isFreemiusRedirectSignatureValid(requestUrl: string): boolean {
  const candidates = [requestUrl, buildFreemiusVerificationUrl(requestUrl)];
  return candidates.some((url) => verifyFreemiusRedirectSignature(url));
}

export function buildFreemiusCheckoutUrl(
  planTier: PlanTier,
  email: string
): string | null {
  const productId = env("FREEMIUS_PRODUCT_ID");
  const planId = freemiusPlanIdForTier(planTier);
  if (!productId || !planId) return null;

  const base = `https://checkout.freemius.com/product/${productId}/plan/${planId}/currency/eur/`;
  const params = new URLSearchParams({
    user_email: email,
    readonly_user: "true",
    cancel_url: `${siteUrl()}/dashboard/nadogradi`,
  });

  return `${base}?${params.toString()}`;
}

export function verifyFreemiusWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader) return false;

  const expected = createHmac("sha256", freemiusSecretKey())
    .update(rawBody)
    .digest("hex");

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signatureHeader, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function parseCheckoutRedirect(searchParams: URLSearchParams): FreemiusCheckoutRedirect {
  const get = (key: string) => searchParams.get(key) ?? undefined;
  return {
    user_id: get("user_id"),
    plan_id: get("plan_id"),
    email: get("email"),
    pricing_id: get("pricing_id"),
    currency: get("currency"),
    subscription_id: get("subscription_id"),
    billing_cycle: get("billing_cycle"),
    license_id: get("license_id"),
    expiration: get("expiration"),
    action: get("action"),
    signature: get("signature"),
  };
}

export async function fetchFreemiusLicense(licenseId: string): Promise<FreemiusLicensePayload | null> {
  const productId = freemiusProductId();
  const res = await fetch(
    `https://api.freemius.com/v1/products/${productId}/licenses/${licenseId}.json`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${freemiusApiToken()}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) return null;
  const data = (await res.json()) as FreemiusLicensePayload & {
    user_email?: string;
    email?: string;
  };
  return data;
}

export async function fetchFreemiusUserEmail(
  fsUserId: string | number
): Promise<string | null> {
  const productId = freemiusProductId();
  const res = await fetch(
    `https://api.freemius.com/v1/products/${productId}/users/${fsUserId}.json`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${freemiusApiToken()}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) return null;
  const data = (await res.json()) as { email?: string };
  return data.email?.trim() ?? null;
}

export async function createFreemiusUpgradeCheckoutUrl(
  licenseId: string,
  targetPlanTier: PlanTier
): Promise<string | null> {
  const productId = freemiusProductId();
  const planId = freemiusPlanIdForTier(targetPlanTier);
  if (!planId) return null;

  const res = await fetch(
    `https://api.freemius.com/v1/products/${productId}/licenses/${licenseId}/checkout/link.json`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${freemiusApiToken()}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        billing_cycle: "monthly",
        quota: 1,
        currency: "eur",
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) return null;
  const data = (await res.json()) as { url?: string };
  return data.url ?? null;
}

export async function createFreemiusPortalUrl(licenseId: string): Promise<string | null> {
  const productId = freemiusProductId();

  const res = await fetch(
    `https://api.freemius.com/v1/products/${productId}/licenses/${licenseId}/checkout/link.json`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${freemiusApiToken()}`,
      },
      body: JSON.stringify({
        is_payment_method_update: false,
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) return null;
  const data = (await res.json()) as { url?: string };
  return data.url ?? null;
}
