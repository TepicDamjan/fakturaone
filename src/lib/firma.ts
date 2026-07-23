import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type FirmaRow = Database["public"]["Tables"]["firma"]["Row"];
export type BankovniRacunRow = Database["public"]["Tables"]["bankovni_racuni"]["Row"];

export type FirmaListItem = {
  id: string;
  naziv: string;
  pib: string | null;
  email: string | null;
  logoUrl: string | null;
  grad: string | null;
  adresa: string | null;
};

export type PodesavanjaFirme = {
  firma: FirmaRow | null;
  racuni: BankovniRacunRow[];
};

const DEFAULT_FIRMA = {
  naziv: "",
  pib: null as string | null,
  maticni_broj: null as string | null,
  adresa: null as string | null,
  grad: null as string | null,
  postanski_broj: null as string | null,
  email: null as string | null,
  telefon: null as string | null,
  valuta: "BAM",
  pdv_procenat: 17,
  rok_placanja_dana: 15,
  logo_url: null as string | null,
  podsjetnici_ukljuceni: true,
  podsjetnik_dana_prije: 3,
};

export async function fetchFirmeLista(
  supabase: SupabaseClient<Database>
): Promise<FirmaListItem[]> {
  const { data, error } = await supabase
    .from("firma")
    .select("id, naziv, pib, email, logo_url, grad, adresa")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .filter((f) => f.naziv?.trim())
    .map((f) => ({
      id: f.id,
      naziv: f.naziv.trim(),
      pib: f.pib,
      email: f.email,
      logoUrl: f.logo_url,
      grad: f.grad,
      adresa: f.adresa,
    }));
}

/** Firme korisnika sa poljima za brzu pretragu / popunu forme klijenta. */
export async function fetchFirmeZaBrzuPretragu(
  supabase: SupabaseClient<Database>
): Promise<
  Pick<
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
  >[]
> {
  const { data, error } = await supabase
    .from("firma")
    .select(
      "id, naziv, pib, maticni_broj, email, telefon, adresa, grad, postanski_broj"
    )
    .order("naziv", { ascending: true });

  if (error) throw error;

  return (data ?? []).filter((f) => f.naziv?.trim()) as Pick<
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
  >[];
}

export function initialsFromFirma(naziv: string): string {
  const parts = naziv.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function defaultFirmaValues(): Omit<FirmaRow, "id" | "user_id" | "created_at" | "updated_at"> {
  return { ...DEFAULT_FIRMA };
}

export function podrazumevaniBankovniRacun(
  racuni: BankovniRacunRow[]
): BankovniRacunRow | null {
  if (racuni.length === 0) return null;
  return racuni.find((r) => r.je_podrazumevani) ?? racuni[0];
}

const IZDAVAC_FALLBACK = {
  naziv: "FakturaOne DOO",
  tagline: "Jednostavno fakturisanje",
  adresa: "Sarajevo, Bosna i Hercegovina",
  email: "billing@fakturaone.app",
  pib: null as string | null,
  maticniBroj: null as string | null,
  telefon: null as string | null,
  logoUrl: null as string | null,
};

export type IzdavalacPrikaz = {
  naziv: string;
  tagline: string;
  adresa: string;
  email: string;
  pib: string | null;
  maticniBroj: string | null;
  telefon: string | null;
  logoUrl: string | null;
};

/** Podaci izdavaoca za fakturu iz podešavanja firme. */
export function izdavalacIzPodesavanja(
  podesavanja: PodesavanjaFirme | null | undefined
): IzdavalacPrikaz {
  const firma = podesavanja?.firma;
  if (!firma?.naziv?.trim()) {
    return { ...IZDAVAC_FALLBACK };
  }
  return {
    naziv: firma.naziv.trim(),
    tagline: "Jednostavno fakturisanje",
    adresa: firma.adresa?.trim() || "—",
    email: firma.email?.trim() || IZDAVAC_FALLBACK.email,
    pib: firma.pib?.trim() || null,
    maticniBroj: firma.maticni_broj?.trim() || null,
    telefon: firma.telefon?.trim() || null,
    logoUrl: firma.logo_url?.trim() || null,
  };
}
