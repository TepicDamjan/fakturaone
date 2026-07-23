"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { requireAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import {
  idSchema,
  NEISPRAVNI_PODACI_GRESKA,
} from "@/lib/validacija/zajednicko";
import {
  sacuvajPonavljajucuSchema,
  sacuvajSablonSchema,
} from "@/lib/validacija/sabloni";
import {
  parseStavkeJson,
  stavkeToJson,
  type FrekvencijaPonavljanja,
  type SablonStavka,
} from "@/lib/sabloni";
import { parseTipDokumenta, type TipDokumenta } from "@/lib/tipDokumenta";

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t === "" ? null : t;
}

export type DokumentSablonListItem = {
  id: string;
  naziv: string;
  tipDokumenta: TipDokumenta;
  klijentId: string | null;
  klijentNaziv: string;
  brojStavki: number;
  updatedAt: string;
};

export type DokumentSablonDetalj = {
  id: string;
  naziv: string;
  tipDokumenta: TipDokumenta;
  klijentId: string;
  referenca: string;
  napomene: string;
  pdvProcenat: number;
  popust: number;
  stavke: SablonStavka[];
};

export type PonavljajucaListItem = {
  id: string;
  naziv: string;
  klijentNaziv: string;
  frekvencija: FrekvencijaPonavljanja;
  sljedeciDatum: string;
  aktivan: boolean;
};

export type SacuvajSablonInput = {
  naziv: string;
  tipDokumenta: TipDokumenta;
  klijentId: string;
  referenca: string;
  napomene: string;
  pdvProcenat: number;
  popust: number;
  stavke: SablonStavka[];
};

export type SacuvajPonavljajucuInput = {
  naziv: string;
  klijentId: string;
  referenca: string;
  napomene: string;
  pdvProcenat: number;
  popust: number;
  stavke: SablonStavka[];
  frekvencija: FrekvencijaPonavljanja;
  rokPlacanjaDana: number;
  sljedeciDatum: string;
  aktivan: boolean;
};

export async function ucitajSabloneList(): Promise<DokumentSablonListItem[]> {
  const supabase = await createClient();
  const firmaId = await requireAktivnaFirmaId();
  const { data, error } = await supabase
    .from("dokument_sabloni")
    .select("id, naziv, tip_dokumenta, klijent_id, stavke, updated_at, klijenti(naziv)")
    .eq("firma_id", firmaId)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r) => {
    const k = r.klijenti as { naziv?: string } | null;
    return {
      id: r.id,
      naziv: r.naziv,
      tipDokumenta: parseTipDokumenta(r.tip_dokumenta),
      klijentId: r.klijent_id,
      klijentNaziv: k?.naziv ?? "",
      brojStavki: parseStavkeJson(r.stavke).length,
      updatedAt: r.updated_at,
    };
  });
}

export async function ucitajSablon(
  id: string
): Promise<DokumentSablonDetalj | null> {
  if (!idSchema.safeParse(id).success) return null;
  const supabase = await createClient();
  const firmaId = await requireAktivnaFirmaId();
  const { data, error } = await supabase
    .from("dokument_sabloni")
    .select("*")
    .eq("id", id)
    .eq("firma_id", firmaId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    naziv: data.naziv,
    tipDokumenta: parseTipDokumenta(data.tip_dokumenta),
    klijentId: data.klijent_id ?? "",
    referenca: data.referenca ?? "",
    napomene: data.napomene ?? "",
    pdvProcenat: Number(data.pdv_procenat),
    popust: Number(data.popust),
    stavke: parseStavkeJson(data.stavke),
  };
}

export async function sacuvajSablon(
  input: SacuvajSablonInput,
  sablonId?: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!sacuvajSablonSchema.safeParse(input).success) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }
  if (sablonId && !idSchema.safeParse(sablonId).success) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Morate biti ulogovani." };

  let firmaId: string;
  try {
    firmaId = await requireAktivnaFirmaId();
  } catch {
    return { ok: false, error: "Nije izabrano preduzeće." };
  }

  const row = {
    user_id: user.id,
    firma_id: firmaId,
    naziv: input.naziv.trim(),
    tip_dokumenta: parseTipDokumenta(input.tipDokumenta),
    klijent_id: emptyToNull(input.klijentId),
    referenca: emptyToNull(input.referenca),
    napomene: emptyToNull(input.napomene),
    pdv_procenat: input.pdvProcenat,
    popust: input.popust,
    stavke: stavkeToJson(input.stavke),
  };

  if (sablonId) {
    const { error } = await supabase
      .from("dokument_sabloni")
      .update(row)
      .eq("id", sablonId)
      .eq("firma_id", firmaId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/dashboard/sabloni");
    return { ok: true, id: sablonId };
  }

  const { data, error } = await supabase
    .from("dokument_sabloni")
    .insert(row)
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Greška." };
  revalidatePath("/dashboard/sabloni");
  return { ok: true, id: data.id };
}

export async function obrisiSablon(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!idSchema.safeParse(id).success) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }
  const supabase = await createClient();
  const firmaId = await requireAktivnaFirmaId();
  const { error } = await supabase
    .from("dokument_sabloni")
    .delete()
    .eq("id", id)
    .eq("firma_id", firmaId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/sabloni");
  return { ok: true };
}

export async function ucitajPonavljajuceList(): Promise<PonavljajucaListItem[]> {
  const supabase = await createClient();
  const firmaId = await requireAktivnaFirmaId();
  const { data, error } = await supabase
    .from("ponavljajuce_fakture")
    .select("id, naziv, frekvencija, sljedeci_datum, aktivan, klijenti(naziv)")
    .eq("firma_id", firmaId)
    .order("sljedeci_datum", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((r) => {
    const k = r.klijenti as { naziv?: string } | null;
    return {
      id: r.id,
      naziv: r.naziv,
      klijentNaziv: k?.naziv ?? "—",
      frekvencija: r.frekvencija as FrekvencijaPonavljanja,
      sljedeciDatum: r.sljedeci_datum,
      aktivan: r.aktivan,
    };
  });
}

export async function sacuvajPonavljajucu(
  input: SacuvajPonavljajucuInput,
  id?: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!sacuvajPonavljajucuSchema.safeParse(input).success) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }
  if (id && !idSchema.safeParse(id).success) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Morate biti ulogovani." };

  let firmaId: string;
  try {
    firmaId = await requireAktivnaFirmaId();
  } catch {
    return { ok: false, error: "Nije izabrano preduzeće." };
  }

  const { data: klijentOk } = await supabase
    .from("klijenti")
    .select("id")
    .eq("id", input.klijentId)
    .eq("firma_id", firmaId)
    .maybeSingle();
  if (!klijentOk) {
    return { ok: false, error: "Klijent nije validan." };
  }

  const row = {
    user_id: user.id,
    firma_id: firmaId,
    klijent_id: input.klijentId,
    naziv: input.naziv.trim(),
    referenca: emptyToNull(input.referenca),
    napomene: emptyToNull(input.napomene),
    pdv_procenat: input.pdvProcenat,
    popust: input.popust,
    stavke: stavkeToJson(input.stavke),
    frekvencija: input.frekvencija,
    rok_placanja_dana: input.rokPlacanjaDana,
    sljedeci_datum: input.sljedeciDatum,
    aktivan: input.aktivan,
  };

  if (id) {
    const { error } = await supabase
      .from("ponavljajuce_fakture")
      .update(row)
      .eq("id", id)
      .eq("firma_id", firmaId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/dashboard/ponavljajuce");
    return { ok: true, id };
  }

  const { data, error } = await supabase
    .from("ponavljajuce_fakture")
    .insert(row)
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Greška." };
  revalidatePath("/dashboard/ponavljajuce");
  return { ok: true, id: data.id };
}

export async function promeniAktivnostPonavljajuce(
  id: string,
  aktivan: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!idSchema.safeParse(id).success) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }
  const supabase = await createClient();
  const firmaId = await requireAktivnaFirmaId();
  const { error } = await supabase
    .from("ponavljajuce_fakture")
    .update({ aktivan })
    .eq("id", id)
    .eq("firma_id", firmaId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/ponavljajuce");
  return { ok: true };
}

export async function obrisiPonavljajucu(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!idSchema.safeParse(id).success) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }
  const supabase = await createClient();
  const firmaId = await requireAktivnaFirmaId();
  const { error } = await supabase
    .from("ponavljajuce_fakture")
    .delete()
    .eq("id", id)
    .eq("firma_id", firmaId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/ponavljajuce");
  return { ok: true };
}
