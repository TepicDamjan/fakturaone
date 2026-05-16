"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type SacuvajFirmuInput = {
  naziv: string;
  pib: string;
  maticniBroj: string;
  adresa: string;
  email: string;
  telefon: string;
  valuta: string;
  pdvProcenat: number;
  rokPlacanjaDana: number;
};

export type BankovniRacunInput = {
  id?: string;
  nazivBanke: string;
  brojRacuna: string;
  naIme: string;
  swift: string;
  jePodrazumevani: boolean;
};

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t === "" ? null : t;
}

function clampPdv(n: number): number {
  if (Number.isNaN(n) || n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

function clampDana(n: number): number {
  if (Number.isNaN(n) || n < 0) return 0;
  if (n > 365) return 365;
  return Math.round(n);
}

export async function sacuvajPodesavanjaFirme(
  firma: SacuvajFirmuInput,
  racuni: BankovniRacunInput[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani." };
  }

  const naziv = firma.naziv.trim();
  if (!naziv) {
    return { ok: false, error: "Naziv firme je obavezan." };
  }

  const firmaRow = {
    user_id: user.id,
    naziv,
    pib: emptyToNull(firma.pib),
    maticni_broj: emptyToNull(firma.maticniBroj),
    adresa: emptyToNull(firma.adresa),
    email: emptyToNull(firma.email),
    telefon: emptyToNull(firma.telefon),
    valuta: firma.valuta.trim() || "RSD",
    pdv_procenat: clampPdv(firma.pdvProcenat),
    rok_placanja_dana: clampDana(firma.rokPlacanjaDana),
  };

  const { data: existing } = await supabase
    .from("firma")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("firma")
      .update(firmaRow)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("firma").insert(firmaRow);
    if (error) return { ok: false, error: error.message };
  }

  const validRacuni = racuni.filter(
    (r) => r.nazivBanke.trim() && r.brojRacuna.trim()
  );

  let hasDefault = validRacuni.some((r) => r.jePodrazumevani);
  if (validRacuni.length > 0 && !hasDefault) {
    validRacuni[0].jePodrazumevani = true;
    hasDefault = true;
  }
  if (hasDefault) {
    let found = false;
    for (const r of validRacuni) {
      if (r.jePodrazumevani && !found) {
        found = true;
      } else {
        r.jePodrazumevani = false;
      }
    }
  }

  const { data: existingRacuni } = await supabase
    .from("bankovni_racuni")
    .select("id")
    .eq("user_id", user.id);

  const keptIds = new Set(
    validRacuni.map((r) => r.id).filter((id): id is string => Boolean(id))
  );

  const toDelete = (existingRacuni ?? [])
    .map((r) => r.id)
    .filter((id) => !keptIds.has(id));

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("bankovni_racuni")
      .delete()
      .in("id", toDelete)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
  }

  for (let i = 0; i < validRacuni.length; i++) {
    const r = validRacuni[i];
    const row = {
      user_id: user.id,
      naziv_banke: r.nazivBanke.trim(),
      broj_racuna: r.brojRacuna.trim(),
      na_ime: emptyToNull(r.naIme),
      swift: emptyToNull(r.swift),
      je_podrazumevani: r.jePodrazumevani,
      redosled: i,
    };

    if (r.id) {
      const { error } = await supabase
        .from("bankovni_racuni")
        .update(row)
        .eq("id", r.id)
        .eq("user_id", user.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase.from("bankovni_racuni").insert(row);
      if (error) return { ok: false, error: error.message };
    }
  }

  revalidatePath("/dashboard/podesavanja");
  return { ok: true };
}
