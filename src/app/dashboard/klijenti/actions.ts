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
  return { ok: true };
}
