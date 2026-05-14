"use server";

import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

type StavkaInput = {
  naziv: string;
  opis: string;
  kolicina: number;
  cena: number;
};

export type SacuvajFakturuInput = {
  klijentId: string;
  brojFakture: string;
  referenca: string;
  datumIzdavanja: string;
  datumPlacanja: string;
  napomene: string;
  pdvProcenat: number;
  popust: number;
  stavke: StavkaInput[];
  status: Database["public"]["Enums"]["faktura_status"];
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

function clampPopust(n: number): number {
  if (Number.isNaN(n) || n < 0) return 0;
  return n;
}

export async function sacuvajFakturu(
  input: SacuvajFakturuInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani da biste sačuvali fakturu." };
  }

  const broj = input.brojFakture.trim() || `INV-${Date.now()}`;
  const klijentRaw = input.klijentId.trim();
  let klijent_id: string | null = klijentRaw || null;

  if (klijent_id) {
    const { data: klijentOk, error: kErr } = await supabase
      .from("klijenti")
      .select("id")
      .eq("id", klijent_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (kErr || !klijentOk) {
      return { ok: false, error: "Izabrani klijent nije validan ili vam ne pripada." };
    }
  }

  const pdv = clampPdv(input.pdvProcenat);
  const popust = clampPopust(input.popust);

  const fakturaRow = {
    user_id: user.id,
    klijent_id,
    broj,
    referenca: emptyToNull(input.referenca),
    datum_izdavanja: emptyToNull(input.datumIzdavanja),
    datum_placanja: emptyToNull(input.datumPlacanja),
    napomene: emptyToNull(input.napomene),
    pdv_procenat: pdv,
    popust,
    status: input.status,
  };

  const { data: faktura, error: fErr } = await supabase
    .from("fakture")
    .insert(fakturaRow)
    .select("id")
    .single();

  if (fErr || !faktura) {
    if (fErr?.code === "23505") {
      return {
        ok: false,
        error: "Faktura sa tim brojem već postoji. Unesite drugi broj fakture.",
      };
    }
    return { ok: false, error: fErr?.message ?? "Greška pri čuvanju fakture." };
  }

  const fakturaId = faktura.id;
  const stavkeRows = input.stavke.map((s, i) => ({
    faktura_id: fakturaId,
    naziv: (s.naziv || "").trim() || "Stavka",
    opis: emptyToNull(s.opis),
    kolicina: s.kolicina,
    cena: s.cena,
    redosled: i,
  }));

  if (stavkeRows.length > 0) {
    const { error: sErr } = await supabase.from("stavke_fakture").insert(stavkeRows);
    if (sErr) {
      await supabase.from("fakture").delete().eq("id", fakturaId);
      return { ok: false, error: sErr.message };
    }
  }

  revalidatePath("/dashboard/fakture");
  revalidatePath("/dashboard");
  return { ok: true, id: fakturaId };
}

export async function promeniStatusFakture(
  fakturaId: string,
  status: Database["public"]["Enums"]["faktura_status"]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani." };
  }

  const { error } = await supabase
    .from("fakture")
    .update({ status })
    .eq("id", fakturaId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/fakture");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/fakture/${fakturaId}/pregled`);
  return { ok: true };
}

export async function obrisiFakturu(
  fakturaId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani." };
  }

  const { error } = await supabase
    .from("fakture")
    .delete()
    .eq("id", fakturaId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/fakture");
  revalidatePath("/dashboard");
  return { ok: true };
}
