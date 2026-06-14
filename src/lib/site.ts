export const SITE_NAME = "FakturaOne";

export const DEFAULT_DESCRIPTION =
  "Kreirajte i šaljite profesionalne fakture, pratite klijente i prihode. Jednostavno online fakturisanje na srpskom.";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fakturaone.app";
  return url.replace(/\/$/, "");
}

export const NOINDEX_ROBOTS = { index: false, follow: false } as const;
