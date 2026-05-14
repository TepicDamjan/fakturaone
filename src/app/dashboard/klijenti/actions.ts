"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

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

  const row = {
    user_id: user.id,
    naziv,
    pib: emptyToNull(input.pib),
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
          "Klijent sa istim PIB-om ili istom e-mail adresom već postoji. Proverite unos.",
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

  const row = {
    naziv,
    pib: emptyToNull(input.pib),
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
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error:
          "Klijent sa istim PIB-om ili istom e-mail adresom već postoji. Proverite unos.",
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

  const { count, error: countErr } = await supabase
    .from("fakture")
    .select("id", { count: "exact", head: true })
    .eq("klijent_id", klijentId)
    .eq("user_id", user.id);

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
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/klijenti");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/fakture");
  return { ok: true };
}
