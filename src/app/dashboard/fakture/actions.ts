"use server";

import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";
import { createClient } from "@/utils/supabase/server";
import { requireAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import { proveriLimitDokumenta } from "@/lib/pretplata.server";
import { parseTipDokumenta, type TipDokumenta } from "@/lib/tipDokumenta";
import {
  idSchema,
  sacuvajFakturuSchema,
  NEISPRAVNI_PODACI_GRESKA,
} from "@/lib/validacija/fakture";

type StavkaInput = {
  naziv: string;
  opis: string;
  kolicina: number;
  cena: number;
  jedinica?: string;
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
  tipDokumenta: TipDokumenta;
  nacinTransporta?: string;
  adresaDostave?: string;
  registracijaVozila?: string;
  vozac?: string;
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
  if (!sacuvajFakturuSchema.safeParse(input).success) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani da biste sačuvali fakturu." };
  }

  let firmaId: string;
  try {
    firmaId = await requireAktivnaFirmaId();
  } catch {
    return { ok: false, error: "Nije izabrano preduzeće." };
  }

  const limitCheck = await proveriLimitDokumenta(supabase, user.id);
  if (!limitCheck.ok) {
    return limitCheck;
  }

  const broj = input.brojFakture.trim() || `INV-${Date.now()}`;
  const klijentRaw = input.klijentId.trim();
  let klijent_id: string | null = klijentRaw || null;

  if (klijent_id) {
    const { data: klijentOk, error: kErr } = await supabase
      .from("klijenti")
      .select("id")
      .eq("id", klijent_id)
      .eq("firma_id", firmaId)
      .maybeSingle();
    if (kErr || !klijentOk) {
      return { ok: false, error: "Izabrani klijent nije validan ili vam ne pripada." };
    }
  }

  const pdv = clampPdv(input.pdvProcenat);
  const popust = clampPopust(input.popust);

  const fakturaRow = {
    user_id: user.id,
    firma_id: firmaId,
    klijent_id,
    broj,
    referenca: emptyToNull(input.referenca),
    datum_izdavanja: emptyToNull(input.datumIzdavanja),
    datum_placanja: emptyToNull(input.datumPlacanja),
    napomene: emptyToNull(input.napomene),
    pdv_procenat: pdv,
    popust,
    status: input.status,
    tip_dokumenta: parseTipDokumenta(input.tipDokumenta),
    nacin_transporta: emptyToNull(input.nacinTransporta ?? ""),
    adresa_dostave: emptyToNull(input.adresaDostave ?? ""),
    registracija_vozila: emptyToNull(input.registracijaVozila ?? ""),
    vozac: emptyToNull(input.vozac ?? ""),
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
    jedinica: (s.jedinica || "kom").trim() || "kom",
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
  if (!idSchema.safeParse(fakturaId).success) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }

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

  const { error } = await supabase
    .from("fakture")
    .update({ status })
    .eq("id", fakturaId)
    .eq("firma_id", firmaId);

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
  if (!idSchema.safeParse(fakturaId).success) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }

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

  const { error } = await supabase
    .from("fakture")
    .delete()
    .eq("id", fakturaId)
    .eq("firma_id", firmaId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/fakture");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function ucitajFakturuSaStavkama(fakturaId: string) {
  const supabase = await createClient();
  const { fetchFakturaSaStavkama } = await import("@/lib/fakture.server");
  return fetchFakturaSaStavkama(supabase, fakturaId);
}
