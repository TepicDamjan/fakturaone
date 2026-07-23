import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function normalizujPib(pib: string | null | undefined): string | null {
  const p = pib?.trim();
  return p ? p : null;
}

export function normalizujNazivPreduzeca(naziv: string): string {
  return naziv.trim().toLowerCase();
}

export function kljucPreduzeca(
  naziv: string,
  pib: string | null | undefined
): string {
  const p = normalizujPib(pib);
  if (p) return `pib:${p}`;
  return `naziv:${normalizujNazivPreduzeca(naziv)}`;
}

type ProveraKlijentaOpts = {
  firmaId: string;
  naziv: string;
  pib?: string | null;
  iskljuciKlijentId?: string;
};

type ProveraFirmeOpts = {
  userId: string;
  naziv: string;
  pib?: string | null;
  iskljuciFirmaId?: string;
};

const GRESKA_KLIJENT_PIB =
  "Klijent sa ovim PIB-om već postoji u ovoj firmi.";
const GRESKA_KLIJENT_NAZIV =
  "Klijent sa istim nazivom već postoji u ovoj firmi.";
const GRESKA_FIRMA_PIB =
  "Preduzeće sa ovim PIB-om već postoji na vašem nalogu.";
const GRESKA_FIRMA_NAZIV =
  "Preduzeće sa istim nazivom već postoji na vašem nalogu.";

/** Duplikat klijenta — samo unutar iste firme. */
export async function greskaAkoKlijentPostojiUFirmi(
  supabase: SupabaseClient<Database>,
  opts: ProveraKlijentaOpts
): Promise<string | null> {
  const pib = normalizujPib(opts.pib);
  const naziv = opts.naziv.trim();

  if (pib) {
    let query = supabase
      .from("klijenti")
      .select("id")
      .eq("firma_id", opts.firmaId)
      .eq("pib", pib)
      .limit(1);
    if (opts.iskljuciKlijentId) {
      query = query.neq("id", opts.iskljuciKlijentId);
    }
    const { data } = await query.maybeSingle();
    if (data) return GRESKA_KLIJENT_PIB;
    return null;
  }

  if (!naziv) return null;

  let query = supabase
    .from("klijenti")
    .select("id, naziv, pib")
    .eq("firma_id", opts.firmaId)
    .is("pib", null);
  if (opts.iskljuciKlijentId) {
    query = query.neq("id", opts.iskljuciKlijentId);
  }
  const { data: klijenti } = await query;
  const ciljaniKljuc = kljucPreduzeca(naziv, null);

  for (const k of klijenti ?? []) {
    if (kljucPreduzeca(k.naziv, k.pib) === ciljaniKljuc) {
      return GRESKA_KLIJENT_NAZIV;
    }
  }

  return null;
}

/** Duplikat vlastitog preduzeća — po korisniku (ne miješa se sa klijentima). */
export async function greskaAkoFirmaPostoji(
  supabase: SupabaseClient<Database>,
  opts: ProveraFirmeOpts
): Promise<string | null> {
  const pib = normalizujPib(opts.pib);
  const naziv = opts.naziv.trim();

  if (pib) {
    let query = supabase
      .from("firma")
      .select("id")
      .eq("user_id", opts.userId)
      .eq("pib", pib)
      .limit(1);
    if (opts.iskljuciFirmaId) {
      query = query.neq("id", opts.iskljuciFirmaId);
    }
    const { data } = await query.maybeSingle();
    if (data) return GRESKA_FIRMA_PIB;
    return null;
  }

  if (!naziv) return null;

  let query = supabase
    .from("firma")
    .select("id, naziv, pib")
    .eq("user_id", opts.userId)
    .is("pib", null);
  if (opts.iskljuciFirmaId) {
    query = query.neq("id", opts.iskljuciFirmaId);
  }
  const { data: firme } = await query;
  const ciljaniKljuc = kljucPreduzeca(naziv, null);

  for (const f of firme ?? []) {
    if (kljucPreduzeca(f.naziv, f.pib) === ciljaniKljuc) {
      return GRESKA_FIRMA_NAZIV;
    }
  }

  return null;
}
