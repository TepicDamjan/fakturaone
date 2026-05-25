import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type FirmaRow = Database["public"]["Tables"]["firma"]["Row"];
export type BankovniRacunRow = Database["public"]["Tables"]["bankovni_racuni"]["Row"];

export type PodesavanjaFirme = {
  firma: FirmaRow | null;
  racuni: BankovniRacunRow[];
};

const DEFAULT_FIRMA = {
  naziv: "",
  pib: null as string | null,
  maticni_broj: null as string | null,
  adresa: null as string | null,
  email: null as string | null,
  telefon: null as string | null,
  valuta: "BAM",
  pdv_procenat: 17,
  rok_placanja_dana: 15,
  logo_url: null as string | null,
};

export async function fetchPodesavanjaFirme(
  supabase: SupabaseClient<Database>
): Promise<PodesavanjaFirme> {
  const { data: firma, error: fErr } = await supabase
    .from("firma")
    .select("*")
    .maybeSingle();

  if (fErr) throw fErr;

  const { data: racuni, error: rErr } = await supabase
    .from("bankovni_racuni")
    .select("*")
    .order("redosled", { ascending: true })
    .order("created_at", { ascending: true });

  if (rErr) throw rErr;

  return {
    firma: firma as FirmaRow | null,
    racuni: (racuni ?? []) as BankovniRacunRow[],
  };
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
  email: "billing@fakturaone.ba",
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
