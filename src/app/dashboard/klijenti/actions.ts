"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { requireAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import { proveriLimitKlijenata } from "@/lib/pretplata.server";
import { greskaAkoKlijentPostojiUFirmi } from "@/lib/preduzeceUnique";

export type SacuvajKlijentaInput = {
  naziv: string;
  pib: string;
  maticniBroj: string;
  email: string;
  telefon: string;
  ulica: string;
  grad: string;
  postanskiBroj: string;
};

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t === "" ? null : t;
}

export async function sacuvajKlijenta(
  input: SacuvajKlijentaInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani da biste sačuvali klijenta." };
  }

  const naziv = input.naziv.trim();
  if (!naziv) {
    return { ok: false, error: "Puni naziv kompanije je obavezan." };
  }

  let firmaId: string;
  try {
    firmaId = await requireAktivnaFirmaId();
  } catch {
    return { ok: false, error: "Nije izabrano preduzeće." };
  }

  const pib = emptyToNull(input.pib);
  const konflikt = await greskaAkoKlijentPostojiUFirmi(supabase, {
    firmaId,
    naziv,
    pib,
  });
  if (konflikt) {
    return { ok: false, error: konflikt };
  }

  const limitCheck = await proveriLimitKlijenata(supabase, user.id);
  if (!limitCheck.ok) {
    return limitCheck;
  }

  const row = {
    user_id: user.id,
    firma_id: firmaId,
    naziv,
    pib,
    maticni_broj: emptyToNull(input.maticniBroj),
    email: emptyToNull(input.email),
    telefon: emptyToNull(input.telefon),
    ulica: emptyToNull(input.ulica),
    grad: emptyToNull(input.grad),
    postanski_broj: emptyToNull(input.postanskiBroj),
  };

  const { error } = await supabase.from("klijenti").insert(row);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error:
          "Klijent sa istim PIB-om ili e-mail adresom već postoji u ovoj firmi.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/klijenti");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function azurirajKlijenta(
  klijentId: string,
  input: SacuvajKlijentaInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani da biste sačuvali izmene." };
  }

  const naziv = input.naziv.trim();
  if (!naziv) {
    return { ok: false, error: "Puni naziv kompanije je obavezan." };
  }

  let firmaId: string;
  try {
    firmaId = await requireAktivnaFirmaId();
  } catch {
    return { ok: false, error: "Nije izabrano preduzeće." };
  }

  const pib = emptyToNull(input.pib);
  const konflikt = await greskaAkoKlijentPostojiUFirmi(supabase, {
    firmaId,
    naziv,
    pib,
    iskljuciKlijentId: klijentId,
  });
  if (konflikt) {
    return { ok: false, error: konflikt };
  }

  const row = {
    naziv,
    pib,
    maticni_broj: emptyToNull(input.maticniBroj),
    email: emptyToNull(input.email),
    telefon: emptyToNull(input.telefon),
    ulica: emptyToNull(input.ulica),
    grad: emptyToNull(input.grad),
    postanski_broj: emptyToNull(input.postanskiBroj),
  };

  const { error } = await supabase
    .from("klijenti")
    .update(row)
    .eq("id", klijentId)
    .eq("firma_id", firmaId);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error:
          "Klijent sa istim PIB-om ili e-mail adresom već postoji u ovoj firmi.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/klijenti");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/fakture");
  return { ok: true };
}

export async function obrisiKlijenta(
  klijentId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani." };
  }

  let firmaId: string;
  try {
    firmaId = await requireAktivnaFirmaId();
  } catch {
    return { ok: false, error: "Nije izabrano preduzeće." };
  }

  const { count, error: countErr } = await supabase
    .from("fakture")
    .select("id", { count: "exact", head: true })
    .eq("klijent_id", klijentId)
    .eq("firma_id", firmaId);

  if (countErr) {
    return { ok: false, error: countErr.message };
  }
  if (count !== null && count > 0) {
    return {
      ok: false,
      error:
        "Ne možete obrisati klijenta dok postoje fakture na njegovo ime. Obrišite ili promenite klijenta na tim fakturama.",
    };
  }

  const { error } = await supabase
    .from("klijenti")
    .delete()
    .eq("id", klijentId)
    .eq("firma_id", firmaId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/klijenti");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/fakture");
  return { ok: true };
}

export async function ucitajKlijentiList() {
  const supabase = await createClient();
  const { fetchKlijentiList } = await import("@/lib/klijenti.server");
  return fetchKlijentiList(supabase);
}

/**
 * Pretraga zajedničkog registra svih firmi u aplikaciji (sve korisnike).
 * Koristi service-role klijent jer RLS ograničava firme na vlasnika.
 * Vraća samo poslovne podatke firme, za automatsko popunjavanje forme klijenta.
 */
export async function pretraziRegistarFirmi(upit: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const q = upit.trim();
  if (q.length < 2) return [];

  const { createAdminClient } = await import("@/utils/supabase/admin");
  const admin = createAdminClient();

  // Escape % i _ za ilike; ukloni znakove koji lome PostgREST or() sintaksu
  const ociscen = q.replace(/[,()]/g, " ").trim();
  if (ociscen.length < 2) return [];
  const pattern = `%${ociscen.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;

  const { data, error } = await admin
    .from("firma")
    .select(
      "id, naziv, pib, maticni_broj, email, telefon, adresa, grad, postanski_broj"
    )
    .or(
      `naziv.ilike.${pattern},pib.ilike.${pattern},maticni_broj.ilike.${pattern},email.ilike.${pattern},grad.ilike.${pattern}`
    )
    .order("naziv", { ascending: true })
    .limit(10);

  if (error) return [];

  return (data ?? []).filter((f) => f.naziv?.trim());
}

export async function ucitajBrzaPretragaBazu() {
  const supabase = await createClient();
  const { fetchSviKlijentiKorisnika } = await import("@/lib/klijenti");
  const { fetchFirmeZaBrzuPretragu } = await import("@/lib/firma");
  const { deduplirajBrzaPretragaBazu } = await import("@/lib/brzaPretraga");

  const [klijenti, firme] = await Promise.all([
    fetchSviKlijentiKorisnika(supabase),
    fetchFirmeZaBrzuPretragu(supabase),
  ]);

  return deduplirajBrzaPretragaBazu({ klijenti, firme });
}

export async function ucitajKlijenta(klijentId: string) {
  const supabase = await createClient();
  const { fetchKlijentById } = await import("@/lib/klijenti.server");
  return fetchKlijentById(supabase, klijentId);
}
