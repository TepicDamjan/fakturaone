import type { Database } from "@/types/database";

export type TipDokumenta = Database["public"]["Enums"]["tip_dokumenta"];

/** Tipovi koje korisnik bira pri kreiranju (bez kreditne note). */
export const TIPOVI_DOKUMENATA = [
  "faktura",
  "predracun",
  "avansna",
  "otpremnica",
] as const satisfies readonly TipDokumenta[];

export type TipDokumentaZaKreiranje = (typeof TIPOVI_DOKUMENATA)[number];

export function isTipDokumenta(value: unknown): value is TipDokumenta {
  return (
    value === "faktura" ||
    value === "predracun" ||
    value === "otpremnica" ||
    value === "kreditna_nota" ||
    value === "avansna"
  );
}

export function jeFinansijskiDokument(tip: TipDokumenta): boolean {
  return tip === "faktura" || tip === "kreditna_nota" || tip === "avansna";
}

export type TipDokumentaMeta = {
  /** Pun naziv u nominativu (npr. "Faktura"). */
  naziv: string;
  /** Naziv u akuzativu — za rečenice tipa "Kreiraj novu fakturu". */
  akuzativ: string;
  /** Kratak opis prikazan u modalu izbora. */
  opis: string;
  /** Prefiks za default broj dokumenta (FAK-, PRE-, OTP-, AVA-, KRE-). */
  brojPrefiks: string;
  /** Label za rok / datum koji se prikazuje u zaglavlju pregleda. */
  rokLabel: string;
  /** Label za totalni iznos na dnu dokumenta. */
  totalLabel: string;
  /** Default napomena koja se prikazuje kad korisnik ništa ne unese. */
  defaultNapomena: string;
};

export const TIP_DOKUMENTA_META: Record<TipDokumenta, TipDokumentaMeta> = {
  faktura: {
    naziv: "Faktura",
    akuzativ: "fakturu",
    opis: "Kreirajte standardnu fakturu za vaše klijente.",
    brojPrefiks: "FAK",
    rokLabel: "Rok plaćanja",
    totalLabel: "Ukupno za uplatu",
    defaultNapomena:
      "Hvala na poverenju. Molimo uplatite iznos u naznačenom roku.",
  },
  predracun: {
    naziv: "Predračun",
    akuzativ: "predračun",
    opis: "Pošaljite ponudu ili predračun pre finalne prodaje.",
    brojPrefiks: "PRE",
    rokLabel: "Važi do",
    totalLabel: "Ukupan iznos ponude",
    defaultNapomena:
      "Ovo je predračun. Faktura će biti izdana po finalnoj kupovini.",
  },
  otpremnica: {
    naziv: "Otpremnica",
    akuzativ: "otpremnicu",
    opis: "Dokument koji prati isporuku robe ili usluga.",
    brojPrefiks: "OTP",
    rokLabel: "Datum isporuke",
    totalLabel: "Ukupna vrednost robe",
    defaultNapomena:
      "Potvrđujemo da je gore navedena roba/usluga isporučena u skladu sa narudžbinom.",
  },
  avansna: {
    naziv: "Avansna faktura",
    akuzativ: "avansnu fakturu",
    opis: "Faktura za avans / depozit prije konačne isporuke.",
    brojPrefiks: "AVA",
    rokLabel: "Rok plaćanja",
    totalLabel: "Ukupno za uplatu",
    defaultNapomena:
      "Ovo je avansna faktura. Konačna faktura biće izdata po isporuci.",
  },
  kreditna_nota: {
    naziv: "Kreditna nota",
    akuzativ: "kreditnu notu",
    opis: "Storno ili umanjenje ranije izdate fakture.",
    brojPrefiks: "KRE",
    rokLabel: "Datum izdavanja",
    totalLabel: "Iznos za umanjenje",
    defaultNapomena:
      "Ova kreditna nota stornira / umanjuje ranije izdatu fakturu.",
  },
};

export function metaZaTip(tip: TipDokumenta): TipDokumentaMeta {
  return TIP_DOKUMENTA_META[tip];
}

/** Vraća validan tip iz proizvoljnog stringa, sa fallbackom na 'faktura'. */
export function parseTipDokumenta(value: unknown): TipDokumenta {
  return isTipDokumenta(value) ? value : "faktura";
}
