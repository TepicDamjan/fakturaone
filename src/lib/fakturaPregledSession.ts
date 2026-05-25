import type { Stavka } from "@/app/components/StavkeFakture";
import type { TipDokumenta } from "@/lib/tipDokumenta";

export const FAKTURA_PREGLED_SESSION_KEY = "fakturaone:fakturaPregled";

export type FakturaPregledSesija = {
  stavke: Stavka[];
  klijentId: string;
  brojFakture: string;
  referenca: string;
  datumIzdavanja: string;
  datumPlacanja: string;
  napomene: string;
  pdvProcenat: number;
  popust: number;
  tipDokumenta: TipDokumenta;
  nacinTransporta?: string;
  adresaDostave?: string;
  registracijaVozila?: string;
  vozac?: string;
};

export function saveFakturaPregledSesija(data: FakturaPregledSesija): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(FAKTURA_PREGLED_SESSION_KEY, JSON.stringify(data));
}

export function loadFakturaPregledSesija(): FakturaPregledSesija | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(FAKTURA_PREGLED_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FakturaPregledSesija;
  } catch {
    return null;
  }
}
