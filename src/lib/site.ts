export const SITE_NAME = "FakturaOne";

export const DEFAULT_DESCRIPTION =
  "Kreirajte i šaljite profesionalne fakture, pratite klijente i prihode. Jednostavno online fakturisanje na srpskom.";

/** Kanonički URL za metadata (Open Graph, canonical). Postavi u produkciji. */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fakturaone.app";
  return url.replace(/\/$/, "");
}

/**
 * Bazni URL za sitemap/robots — uvek domen sa kog je zahtev stigao,
 * da URL-ovi odgovaraju property-ju u Google Search Console.
 */
export async function getRequestSiteUrl(): Promise<string> {
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const host = headersList.get("host");

  if (host) {
    const protocol = headersList.get("x-forwarded-proto") ?? "https";
    return `${protocol}://${host}`.replace(/\/$/, "");
  }

  return getSiteUrl();
}

export const NOINDEX_ROBOTS = { index: false, follow: false } as const;
