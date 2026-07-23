export function formatIznos(amount: number): string {
  return amount.toLocaleString("bs-Latn-BA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Zaokruživanje na 2 decimale (novac). */
export function zaokruziNovac(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

/** Ukupan iznos dokumenta: osnovica + PDV − popust. */
export function izracunajUkupanIznos(
  stavke: { kolicina: number; cena: number }[],
  pdvProcenat: number,
  popust: number
): number {
  const osnovica = stavke.reduce(
    (s, x) => s + Number(x.kolicina) * Number(x.cena),
    0
  );
  const pdv = osnovica * (Number(pdvProcenat) / 100);
  return zaokruziNovac(osnovica + pdv - Number(popust || 0));
}

export function formatDokumentDatum(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("bs-Latn-BA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function sanitizePdfFilename(broj: string): string {
  const safe = broj.replace(/[^\w.-]+/g, "_").replace(/_+/g, "_");
  return safe || "dokument";
}
