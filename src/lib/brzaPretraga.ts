import type { KlijentForma } from "@/app/components/KlijentFormFields";
import type { Klijent } from "@/lib/klijenti";
import type { FirmaRow } from "@/lib/firma";
import { kljucPreduzeca } from "@/lib/preduzeceUnique";

export type FirmaZaPretragu = Pick<
  FirmaRow,
  | "id"
  | "naziv"
  | "pib"
  | "maticni_broj"
  | "email"
  | "telefon"
  | "adresa"
  | "grad"
  | "postanski_broj"
>;

export type BrzaPretragaStavka =
  | { tip: "klijent"; podaci: Klijent }
  | { tip: "firma"; podaci: FirmaZaPretragu }
  | { tip: "registar"; podaci: FirmaZaPretragu };

export type BrzaPretragaBaza = {
  klijenti: Klijent[];
  firme: FirmaZaPretragu[];
};

function odgovaraUpitu(
  upit: string,
  polja: (string | null | undefined)[]
): boolean {
  return polja.some((p) => p?.toLowerCase().includes(upit));
}

function kljucEntiteta(
  naziv: string,
  pib: string | null | undefined
): string {
  return kljucPreduzeca(naziv, pib);
}

export function filtrirajBrzaPretragu(
  baza: BrzaPretragaBaza,
  upit: string,
  opts?: { iskljuciKlijentId?: string; limit?: number }
): BrzaPretragaStavka[] {
  const q = upit.trim().toLowerCase();
  if (!q) return [];

  const limit = opts?.limit ?? 10;
  const stavke: BrzaPretragaStavka[] = [];
  const vidjeni = new Set<string>();

  for (const k of baza.klijenti) {
    if (opts?.iskljuciKlijentId && k.id === opts.iskljuciKlijentId) continue;
    if (
      !odgovaraUpitu(q, [
        k.naziv,
        k.pib,
        k.email,
        k.maticni_broj,
        k.grad,
        k.telefon,
      ])
    ) {
      continue;
    }

    const kljuc = kljucEntiteta(k.naziv, k.pib);
    if (vidjeni.has(kljuc)) continue;
    vidjeni.add(kljuc);
    stavke.push({ tip: "klijent", podaci: k });
  }

  for (const f of baza.firme) {
    if (
      !odgovaraUpitu(q, [
        f.naziv,
        f.pib,
        f.email,
        f.maticni_broj,
        f.grad,
        f.telefon,
        f.adresa,
      ])
    ) {
      continue;
    }

    const kljuc = kljucEntiteta(f.naziv, f.pib);
    if (vidjeni.has(kljuc)) continue;
    vidjeni.add(kljuc);
    stavke.push({ tip: "firma", podaci: f });
  }

  return stavke
    .sort((a, b) => a.podaci.naziv.localeCompare(b.podaci.naziv, "sr"))
    .slice(0, limit);
}

export function stavkaNaziv(stavka: BrzaPretragaStavka): string {
  return stavka.podaci.naziv;
}

/**
 * Spaja lokalne rezultate (klijenti + vlastite firme) sa rezultatima iz
 * zajedničkog registra svih firmi u aplikaciji. Registar dolazi na kraj,
 * duplikati (isti PIB ili naziv) se preskaču.
 */
export function spojiSaRegistrom(
  lokalne: BrzaPretragaStavka[],
  registar: FirmaZaPretragu[],
  limit = 10
): BrzaPretragaStavka[] {
  const vidjeni = new Set(
    lokalne.map((s) => kljucEntiteta(s.podaci.naziv, s.podaci.pib))
  );
  const rezultat = [...lokalne];

  for (const f of registar) {
    if (rezultat.length >= limit) break;
    const kljuc = kljucEntiteta(f.naziv, f.pib);
    if (vidjeni.has(kljuc)) continue;
    vidjeni.add(kljuc);
    rezultat.push({ tip: "registar", podaci: f });
  }

  return rezultat.slice(0, limit);
}

export function stavkaToForma(stavka: BrzaPretragaStavka): KlijentForma {
  if (stavka.tip === "klijent") {
    const k = stavka.podaci;
    return {
      naziv: k.naziv,
      pib: k.pib ?? "",
      maticniBroj: k.maticni_broj ?? "",
      email: k.email ?? "",
      telefon: k.telefon ?? "",
      ulica: k.ulica ?? "",
      grad: k.grad ?? "",
      postanskiBroj: k.postanski_broj ?? "",
    };
  }

  const f = stavka.podaci;
  return {
    naziv: f.naziv,
    pib: f.pib ?? "",
    maticniBroj: f.maticni_broj ?? "",
    email: f.email ?? "",
    telefon: f.telefon ?? "",
    ulica: f.adresa ?? "",
    grad: f.grad ?? "",
    postanskiBroj: f.postanski_broj ?? "",
  };
}

export function stavkaMeta(stavka: BrzaPretragaStavka): string {
  const p = stavka.podaci;
  const pib = p.pib ? `PIB: ${p.pib}` : null;
  const email = p.email ?? null;
  const grad = p.grad ?? null;
  return [pib, email, grad].filter(Boolean).join(" · ");
}

/** Uklanja duplikate iz učitane baze (isti PIB ili naziv). */
export function deduplirajBrzaPretragaBazu(baza: BrzaPretragaBaza): BrzaPretragaBaza {
  const vidjeni = new Set<string>();
  const klijenti: BrzaPretragaBaza["klijenti"] = [];

  for (const k of baza.klijenti) {
    const kljuc = kljucEntiteta(k.naziv, k.pib);
    if (vidjeni.has(kljuc)) continue;
    vidjeni.add(kljuc);
    klijenti.push(k);
  }

  const firme: BrzaPretragaBaza["firme"] = [];
  for (const f of baza.firme) {
    const kljuc = kljucEntiteta(f.naziv, f.pib);
    if (vidjeni.has(kljuc)) continue;
    vidjeni.add(kljuc);
    firme.push(f);
  }

  return { klijenti, firme };
}
