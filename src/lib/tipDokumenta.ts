import type { Database } from "@/types/database";

export type TipDokumenta = Database["public"]["Enums"]["tip_dokumenta"];

export const TIPOVI_DOKUMENATA: readonly TipDokumenta[] = [
  "faktura",
  "predracun",
  "otpremnica",
] as const;

export function isTipDokumenta(value: unknown): value is TipDokumenta {
  return (
    value === "faktura" || value === "predracun" || value === "otpremnica"
  );
}

export type TipDokumentaMeta = {
  /** Pun naziv u nominativu (npr. "Faktura"). */
  naziv: string;
  /** Naziv u akuzativu — za rečenice tipa "Kreiraj novu fakturu". */
  akuzativ: string;
  /** Kratak opis prikazan u modalu izbora. */
  opis: string;
  /** Prefiks za default broj dokumenta (INV-, PRO-, OTP-). */
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
    brojPrefiks: "INV",
    rokLabel: "Rok plaćanja",
    totalLabel: "Ukupno za uplatu",
    defaultNapomena:
      "Hvala na poverenju. Molimo uplatite iznos u naznačenom roku.",
  },
  predracun: {
    naziv: "Predračun",
    akuzativ: "predračun",
    opis: "Pošaljite ponudu ili predračun pre finalne prodaje.",
    brojPrefiks: "PRO",
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
};

export function metaZaTip(tip: TipDokumenta): TipDokumentaMeta {
  return TIP_DOKUMENTA_META[tip];
}

/** Vraća validan tip iz proizvoljnog stringa, sa fallbackom na 'faktura'. */
export function parseTipDokumenta(value: unknown): TipDokumenta {
  return isTipDokumenta(value) ? value : "faktura";
}
