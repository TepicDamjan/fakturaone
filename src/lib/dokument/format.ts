/**
 * Stable money formatting for SSR/CSR (bs style): "1.234,56"
 * Avoids toLocaleString ICU mismatches (e.g. Windows → "12.00" vs Node → "12,00").
 */
export function formatIznos(
  amount: number,
  fractionDigits: 0 | 2 = 2
): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const negative = n < 0;
  const fixed = Math.abs(n).toFixed(fractionDigits);
  const [intRaw, frac] = fixed.split(".");
  const intPart = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const body =
    fractionDigits === 0 ? intPart : `${intPart},${frac ?? "00"}`;
  return negative ? `-${body}` : body;
}

/** Cijeli iznos bez decimala: "1.234" */
export function formatIznosCijeli(amount: number): string {
  return formatIznos(Math.round(amount), 0);
}

/** Zaokruživanje na 2 decimale (novac). */
export function zaokruziNovac(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

export function formatIznosValuta(
  amount: number,
  valuta: string,
  cijeli = false
): string {
  const iznos = cijeli ? formatIznosCijeli(amount) : formatIznos(amount);
  return `${iznos} ${valuta?.trim() || "BAM"}`;
}

export type StavkaZaIznos = {
  kolicina: number;
  cena: number;
  pdvProcenat?: number | null;
};

export type IznosiDokumenta = {
  osnovica: number;
  pdvIznos: number;
  ukupno: number;
};

export type PdvPoStopi = {
  stopa: number;
  osnovica: number;
  pdvIznos: number;
};

/** Iznosi dokumenta: PDV po stavci ako je zadan, inače default stopa. */
export function izracunajIznoseDokumenta(
  stavke: StavkaZaIznos[],
  defaultPdv: number,
  popust: number
): IznosiDokumenta {
  let osnovica = 0;
  let pdvIznos = 0;
  for (const s of stavke) {
    const line = Number(s.kolicina) * Number(s.cena);
    const stopa =
      s.pdvProcenat != null && Number.isFinite(Number(s.pdvProcenat))
        ? Number(s.pdvProcenat)
        : Number(defaultPdv) || 0;
    osnovica += line;
    pdvIznos += line * (stopa / 100);
  }
  return {
    osnovica: zaokruziNovac(osnovica),
    pdvIznos: zaokruziNovac(pdvIznos),
    ukupno: zaokruziNovac(osnovica + pdvIznos - Number(popust || 0)),
  };
}

export function pdvPoStopama(
  stavke: StavkaZaIznos[],
  defaultPdv: number
): PdvPoStopi[] {
  const map = new Map<number, { osnovica: number; pdvIznos: number }>();
  for (const s of stavke) {
    const line = Number(s.kolicina) * Number(s.cena);
    const stopa =
      s.pdvProcenat != null && Number.isFinite(Number(s.pdvProcenat))
        ? Number(s.pdvProcenat)
        : Number(defaultPdv) || 0;
    const cur = map.get(stopa) ?? { osnovica: 0, pdvIznos: 0 };
    cur.osnovica += line;
    cur.pdvIznos += line * (stopa / 100);
    map.set(stopa, cur);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([stopa, v]) => ({
      stopa,
      osnovica: zaokruziNovac(v.osnovica),
      pdvIznos: zaokruziNovac(v.pdvIznos),
    }));
}

/** Ukupan iznos dokumenta: osnovica + PDV − popust. */
export function izracunajUkupanIznos(
  stavke: StavkaZaIznos[],
  pdvProcenat: number,
  popust: number
): number {
  return izracunajIznoseDokumenta(stavke, pdvProcenat, popust).ukupno;
}

const MESECI_KRATKI = [
  "jan",
  "feb",
  "mar",
  "apr",
  "maj",
  "jun",
  "jul",
  "avg",
  "sep",
  "okt",
  "nov",
  "dec",
] as const;

const MESECI_DUGI = [
  "januar",
  "februar",
  "mart",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "septembar",
  "oktobar",
  "novembar",
  "decembar",
] as const;

/** Parse YYYY-MM-DD (or ISO) without timezone surprises. */
export function parseIsoDatum(iso: string | null | undefined): Date | null {
  if (!iso?.trim()) return null;
  const day = iso.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const d = new Date(`${day}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Stable short date for SSR/CSR: "23. jul 2026." */
export function formatDatumKratki(iso: string | null | undefined): string {
  const d = parseIsoDatum(iso);
  if (!d) return "—";
  return `${d.getDate()}. ${MESECI_KRATKI[d.getMonth()]} ${d.getFullYear()}.`;
}

/** Stable long date for SSR/CSR: "23. juli 2026." */
export function formatDatumDugi(iso: string | null | undefined): string {
  const d = parseIsoDatum(iso);
  if (!d) return "—";
  return `${d.getDate()}. ${MESECI_DUGI[d.getMonth()]} ${d.getFullYear()}.`;
}

export function formatDokumentDatum(iso: string | null): string {
  return formatDatumDugi(iso);
}

export function sanitizePdfFilename(broj: string): string {
  const safe = broj.replace(/[^\w.-]+/g, "_").replace(/_+/g, "_");
  return safe || "dokument";
}
