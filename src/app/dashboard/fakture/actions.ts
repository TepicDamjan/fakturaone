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
  evidentirajPlacanjeSchema,
  NEISPRAVNI_PODACI_GRESKA,
} from "@/lib/validacija/fakture";
import { zodFieldErrors } from "@/lib/validacija/zajednicko";
import { izracunajUkupanIznos, zaokruziNovac } from "@/lib/dokument/format";

type StavkaInput = {
  naziv: string;
  opis: string;
  kolicina: number;
  cena: number;
  jedinica?: string;
  pdvProcenat?: number | null;
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
  /** Dokument od kojeg nastaje ovaj (npr. predračun → faktura). */
  izvorDokumentId?: string;
  pdvOslobodjenjeNapomena?: string;
};

export type SacuvajFakturuRezultat =
  | { ok: true; id: string }
  | { ok: false; error: string; fields?: Record<string, string> };

function validirajIzdavanje(
  input: SacuvajFakturuInput
): { ok: true } | { ok: false; error: string; fields: Record<string, string> } {
  if (input.status === "nacrt") return { ok: true };
  const fields: Record<string, string> = {};
  if (!input.klijentId.trim()) {
    fields.klijentId = "Izaberite klijenta prije izdavanja.";
  }
  const imaStavku = input.stavke.some(
    (s) => s.naziv.trim() && Number(s.kolicina) > 0
  );
  if (!imaStavku) {
    fields.stavke = "Dodajte bar jednu stavku sa nazivom i količinom.";
  }
  if (Object.keys(fields).length > 0) {
    return {
      ok: false,
      error: Object.values(fields)[0],
      fields,
    };
  }
  return { ok: true };
}

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
  if (Number.isNaN(n)) return 0;
  return n;
}

function danasISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dodajDane(iso: string, dana: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dana);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function sacuvajFakturu(
  input: SacuvajFakturuInput
): Promise<SacuvajFakturuRezultat> {
  const parsed = sacuvajFakturuSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: NEISPRAVNI_PODACI_GRESKA,
      fields: zodFieldErrors(parsed.error),
    };
  }

  const izdavanje = validirajIzdavanje(input);
  if (!izdavanje.ok) return izdavanje;

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

  const rucniBroj = input.brojFakture.trim();
  const klijentRaw = input.klijentId.trim();
  const klijent_id: string | null = klijentRaw || null;

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

  const izvorDokumentId = input.izvorDokumentId?.trim() || null;
  if (izvorDokumentId) {
    const { data: izvorOk, error: izErr } = await supabase
      .from("fakture")
      .select("id")
      .eq("id", izvorDokumentId)
      .eq("firma_id", firmaId)
      .maybeSingle();
    if (izErr || !izvorOk) {
      return { ok: false, error: "Izvorni dokument nije pronađen." };
    }
  }

  const pdv = clampPdv(input.pdvProcenat);
  const popust = clampPopust(input.popust);

  const fakturaRow = {
    user_id: user.id,
    firma_id: firmaId,
    klijent_id,
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
    izvor_dokument_id: izvorDokumentId,
    pdv_oslobodjenje_napomena: emptyToNull(input.pdvOslobodjenjeNapomena ?? ""),
  };

  let faktura: { id: string } | null = null;

  if (rucniBroj) {
    const { data, error: fErr } = await supabase
      .from("fakture")
      .insert({ ...fakturaRow, broj: rucniBroj })
      .select("id")
      .single();

    if (fErr || !data) {
      if (fErr?.code === "23505") {
        return {
          ok: false,
          error: "Faktura sa tim brojem već postoji. Unesite drugi broj fakture.",
        };
      }
      return { ok: false, error: fErr?.message ?? "Greška pri čuvanju fakture." };
    }
    faktura = data;
  } else {
    // Automatski sekvencijalni broj (npr. FAK-2026-0001). Ako se dodeljeni
    // broj sudari sa ranije rucno unetim, uzima se sledeci iz brojaca.
    const MAX_POKUSAJA = 5;
    for (let pokusaj = 0; pokusaj < MAX_POKUSAJA; pokusaj++) {
      const { data: broj, error: brojErr } = await supabase.rpc(
        "sledeci_broj_dokumenta",
        { p_firma_id: firmaId, p_tip: fakturaRow.tip_dokumenta }
      );
      if (brojErr || !broj) {
        return {
          ok: false,
          error: "Nije moguće dodeliti broj dokumenta. Pokušajte ponovo.",
        };
      }

      const { data, error: fErr } = await supabase
        .from("fakture")
        .insert({ ...fakturaRow, broj })
        .select("id")
        .single();

      if (data) {
        faktura = data;
        break;
      }
      if (fErr?.code !== "23505") {
        return { ok: false, error: fErr?.message ?? "Greška pri čuvanju fakture." };
      }
    }

    if (!faktura) {
      return {
        ok: false,
        error:
          "Nije moguće dodeliti jedinstven broj dokumenta. Unesite broj ručno.",
      };
    }
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
    pdv_procenat:
      s.pdvProcenat != null && Number.isFinite(Number(s.pdvProcenat))
        ? Number(s.pdvProcenat)
        : pdv,
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

/** Kreira nacrt fakture kopiranjem predračuna (klijent, stavke, PDV, popust). */
export async function konvertujPredracunUFakturu(
  predracunId: string
): Promise<
  | { ok: true; id: string; vecPostojala?: boolean }
  | { ok: false; error: string }
> {
  if (!idSchema.safeParse(predracunId).success) {
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

  const { fetchFakturaSaStavkama } = await import("@/lib/fakture.server");
  const src = await fetchFakturaSaStavkama(supabase, predracunId);
  if (!src || src.faktura.tip_dokumenta !== "predracun") {
    return { ok: false, error: "Predračun nije pronađen." };
  }

  const { data: postojeca } = await supabase
    .from("fakture")
    .select("id")
    .eq("izvor_dokument_id", predracunId)
    .eq("tip_dokumenta", "faktura")
    .eq("firma_id", firmaId)
    .maybeSingle();

  if (postojeca?.id) {
    return { ok: true, id: postojeca.id, vecPostojala: true };
  }

  const { data: firma } = await supabase
    .from("firma")
    .select("rok_placanja_dana")
    .eq("id", firmaId)
    .maybeSingle();

  const rokDana =
    typeof firma?.rok_placanja_dana === "number" && firma.rok_placanja_dana >= 0
      ? firma.rok_placanja_dana
      : 15;

  const danas = danasISO();
  const referenca =
    src.faktura.referenca?.trim() || `Predračun ${src.faktura.broj}`;

  return sacuvajFakturu({
    klijentId: src.faktura.klijent_id ?? "",
    brojFakture: "",
    referenca,
    datumIzdavanja: danas,
    datumPlacanja: dodajDane(danas, rokDana),
    napomene: src.faktura.napomene ?? "",
    pdvProcenat: Number(src.faktura.pdv_procenat),
    popust: Number(src.faktura.popust),
    stavke: src.stavke.map((s) => ({
      naziv: s.naziv,
      opis: s.opis ?? "",
      kolicina: Number(s.kolicina),
      cena: Number(s.cena),
      jedinica: s.jedinica || "kom",
    })),
    status: "nacrt",
    tipDokumenta: "faktura",
    izvorDokumentId: predracunId,
  });
}

/** Kreira kreditnu notu (storno) sa negativnim cijenama, vezanu za fakturu. */
export async function stornirajFakturu(
  fakturaId: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
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

  try {
    await requireAktivnaFirmaId();
  } catch {
    return { ok: false, error: "Nije izabrano preduzeće." };
  }

  const { fetchFakturaSaStavkama } = await import("@/lib/fakture.server");
  const src = await fetchFakturaSaStavkama(supabase, fakturaId);
  if (!src || src.faktura.tip_dokumenta !== "faktura") {
    return { ok: false, error: "Možete stornirati samo fakturu." };
  }

  if (src.faktura.status === "nacrt") {
    return {
      ok: false,
      error: "Nacrt se ne stornira — obrišite ga umjesto toga.",
    };
  }

  const { data: vecStorno } = await supabase
    .from("fakture")
    .select("id")
    .eq("izvor_dokument_id", fakturaId)
    .eq("tip_dokumenta", "kreditna_nota")
    .maybeSingle();
  if (vecStorno?.id) {
    return { ok: false, error: "Ova faktura je već stornirana." };
  }

  if (src.stavke.length === 0) {
    return { ok: false, error: "Faktura nema stavki za storno." };
  }

  const danas = danasISO();
  const napomena =
    src.faktura.napomene?.trim() ||
    `Kreditna nota po fakturi ${src.faktura.broj}.`;

  return sacuvajFakturu({
    klijentId: src.faktura.klijent_id ?? "",
    brojFakture: "",
    referenca: `Storno fakture ${src.faktura.broj}`,
    datumIzdavanja: danas,
    datumPlacanja: danas,
    napomene: napomena,
    pdvProcenat: Number(src.faktura.pdv_procenat),
    popust: -Math.abs(Number(src.faktura.popust)),
    stavke: src.stavke.map((s) => ({
      naziv: s.naziv,
      opis: s.opis ?? "",
      kolicina: Number(s.kolicina),
      cena: -Math.abs(Number(s.cena)),
      jedinica: s.jedinica || "kom",
      pdvProcenat: s.pdv_procenat,
    })),
    status: "na_cekanju",
    tipDokumenta: "kreditna_nota",
    izvorDokumentId: fakturaId,
  });
}

/** Ažurira postojeći dokument i zamjenjuje stavke. Ne mijenja tip ni izvor. */
export async function azurirajFakturu(
  fakturaId: string,
  input: SacuvajFakturuInput
): Promise<SacuvajFakturuRezultat> {
  if (!idSchema.safeParse(fakturaId).success) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }
  const parsed = sacuvajFakturuSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: NEISPRAVNI_PODACI_GRESKA,
      fields: zodFieldErrors(parsed.error),
    };
  }
  const izdavanje = validirajIzdavanje(input);
  if (!izdavanje.ok) return izdavanje;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani da biste sačuvali izmjene." };
  }

  let firmaId: string;
  try {
    firmaId = await requireAktivnaFirmaId();
  } catch {
    return { ok: false, error: "Nije izabrano preduzeće." };
  }

  const { data: postojeca, error: loadErr } = await supabase
    .from("fakture")
    .select("id, tip_dokumenta, broj, status")
    .eq("id", fakturaId)
    .eq("firma_id", firmaId)
    .maybeSingle();

  if (loadErr || !postojeca) {
    return { ok: false, error: "Dokument nije pronađen." };
  }

  if (postojeca.status !== "nacrt") {
    return {
      ok: false,
      error:
        "Izdat dokument se ne može mijenjati. Koristite storno ili kreditnu notu.",
    };
  }

  const klijentRaw = input.klijentId.trim();
  const klijent_id: string | null = klijentRaw || null;

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

  const rucniBroj = input.brojFakture.trim() || postojeca.broj;
  const pdv = clampPdv(input.pdvProcenat);
  const popust = clampPopust(input.popust);
  const tip = postojeca.tip_dokumenta;

  const { error: uErr } = await supabase
    .from("fakture")
    .update({
      klijent_id,
      broj: rucniBroj,
      referenca: emptyToNull(input.referenca),
      datum_izdavanja: emptyToNull(input.datumIzdavanja),
      datum_placanja: emptyToNull(input.datumPlacanja),
      napomene: emptyToNull(input.napomene),
      pdv_procenat: pdv,
      popust,
      status: input.status,
      nacin_transporta:
        tip === "otpremnica" ? emptyToNull(input.nacinTransporta ?? "") : null,
      adresa_dostave:
        tip === "otpremnica" ? emptyToNull(input.adresaDostave ?? "") : null,
      registracija_vozila:
        tip === "otpremnica" ? emptyToNull(input.registracijaVozila ?? "") : null,
      vozac: tip === "otpremnica" ? emptyToNull(input.vozac ?? "") : null,
      pdv_oslobodjenje_napomena: emptyToNull(input.pdvOslobodjenjeNapomena ?? ""),
    })
    .eq("id", fakturaId)
    .eq("firma_id", firmaId);

  if (uErr) {
    if (uErr.code === "23505") {
      return {
        ok: false,
        error: "Dokument sa tim brojem već postoji. Unesite drugi broj.",
      };
    }
    return { ok: false, error: uErr.message };
  }

  const { error: delErr } = await supabase
    .from("stavke_fakture")
    .delete()
    .eq("faktura_id", fakturaId);

  if (delErr) {
    return { ok: false, error: delErr.message };
  }

  const stavkeRows = input.stavke.map((s, i) => ({
    faktura_id: fakturaId,
    naziv: (s.naziv || "").trim() || "Stavka",
    opis: emptyToNull(s.opis),
    kolicina: s.kolicina,
    cena: tip === "otpremnica" ? 0 : s.cena,
    jedinica: (s.jedinica || "kom").trim() || "kom",
    redosled: i,
    pdv_procenat:
      s.pdvProcenat != null && Number.isFinite(Number(s.pdvProcenat))
        ? Number(s.pdvProcenat)
        : pdv,
  }));

  if (stavkeRows.length > 0) {
    const { error: sErr } = await supabase.from("stavke_fakture").insert(stavkeRows);
    if (sErr) {
      return { ok: false, error: sErr.message };
    }
  }

  revalidatePath("/dashboard/fakture");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/fakture/${fakturaId}/pregled`);
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

  const updatePayload: Database["public"]["Tables"]["fakture"]["Update"] = {
    status,
  };

  if (status === "placeno") {
    const { fetchFakturaSaStavkama } = await import("@/lib/fakture.server");
    const src = await fetchFakturaSaStavkama(supabase, fakturaId);
    if (src) {
      updatePayload.placeno_iznos = izracunajUkupanIznos(
        src.stavke,
        Number(src.faktura.pdv_procenat),
        Number(src.faktura.popust)
      );
    }
  }

  const { error } = await supabase
    .from("fakture")
    .update(updatePayload)
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

/** Dodaje uplatu na fakturu; status postaje placeno kad je dug zatvoren. */
export async function evidentirajPlacanje(
  fakturaId: string,
  iznos: number,
  detalji?: { datum?: string; nacin?: string; napomena?: string }
): Promise<
  | { ok: true; placenoIznos: number; preostalo: number; status: string }
  | { ok: false; error: string }
> {
  if (
    !evidentirajPlacanjeSchema.safeParse({
      fakturaId,
      iznos,
      datum: detalji?.datum,
      nacin: detalji?.nacin,
      napomena: detalji?.napomena,
    }).success
  ) {
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

  const { fetchFakturaSaStavkama } = await import("@/lib/fakture.server");
  const src = await fetchFakturaSaStavkama(supabase, fakturaId);
  if (!src) {
    return { ok: false, error: "Dokument nije pronađen." };
  }

  if (src.faktura.tip_dokumenta !== "faktura") {
    return { ok: false, error: "Uplata se može evidentirati samo na fakturi." };
  }

  if (src.faktura.status === "nacrt") {
    return { ok: false, error: "Ne možete evidentirati uplatu na nacrtu." };
  }

  const ukupno = izracunajUkupanIznos(
    src.stavke,
    Number(src.faktura.pdv_procenat),
    Number(src.faktura.popust)
  );
  const trenutno = zaokruziNovac(Number(src.faktura.placeno_iznos ?? 0));
  const uplata = zaokruziNovac(iznos);
  const preostaloPrije = zaokruziNovac(Math.max(0, ukupno - trenutno));

  if (preostaloPrije <= 0) {
    return { ok: false, error: "Faktura je već u potpunosti plaćena." };
  }

  if (uplata > preostaloPrije + 0.001) {
    return {
      ok: false,
      error: `Iznos uplate ne smije biti veći od preostalog duga (${preostaloPrije.toFixed(2)}).`,
    };
  }

  const novoPlaceno = zaokruziNovac(trenutno + uplata);
  const preostalo = zaokruziNovac(Math.max(0, ukupno - novoPlaceno));
  const noviStatus: Database["public"]["Enums"]["faktura_status"] =
    preostalo <= 0.001 ? "placeno" : src.faktura.status === "kasni" ? "kasni" : "na_cekanju";

  const { error } = await supabase
    .from("fakture")
    .update({
      placeno_iznos: novoPlaceno,
      status: noviStatus,
    })
    .eq("id", fakturaId)
    .eq("firma_id", firmaId);

  if (error) {
    return { ok: false, error: error.message };
  }

  await supabase.from("uplate").insert({
    user_id: user.id,
    firma_id: firmaId,
    faktura_id: fakturaId,
    iznos: uplata,
    datum: detalji?.datum?.trim() || danasISO(),
    nacin: detalji?.nacin?.trim() || "ostalo",
    napomena: emptyToNull(detalji?.napomena ?? ""),
  });

  revalidatePath("/dashboard/fakture");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/fakture/${fakturaId}/pregled`);
  return {
    ok: true,
    placenoIznos: novoPlaceno,
    preostalo,
    status: noviStatus,
  };
}

export async function ucitajUplateFakture(
  fakturaId: string
): Promise<{ id: string; iznos: number; datum: string; nacin: string; napomena: string | null }[]> {
  if (!idSchema.safeParse(fakturaId).success) return [];
  const supabase = await createClient();
  let firmaId: string;
  try {
    firmaId = await requireAktivnaFirmaId();
  } catch {
    return [];
  }
  const { data } = await supabase
    .from("uplate")
    .select("id, iznos, datum, nacin, napomena")
    .eq("faktura_id", fakturaId)
    .eq("firma_id", firmaId)
    .order("datum", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []).map((r) => ({
    id: r.id,
    iznos: Number(r.iznos),
    datum: r.datum,
    nacin: r.nacin,
    napomena: r.napomena,
  }));
}

/** Kopira dokument kao novi nacrt (isti klijent i stavke, novi broj i datum). */
export async function duplirajDokument(
  fakturaId: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!idSchema.safeParse(fakturaId).success) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Morate biti ulogovani." };

  const { fetchFakturaSaStavkama } = await import("@/lib/fakture.server");
  const src = await fetchFakturaSaStavkama(supabase, fakturaId);
  if (!src) return { ok: false, error: "Dokument nije pronađen." };

  const tip = parseTipDokumenta(src.faktura.tip_dokumenta);
  const noviTip: TipDokumenta =
    tip === "kreditna_nota" ? "faktura" : tip;

  const danas = danasISO();
  return sacuvajFakturu({
    klijentId: src.faktura.klijent_id ?? "",
    brojFakture: "",
    referenca: src.faktura.referenca ?? "",
    datumIzdavanja: danas,
    datumPlacanja: src.faktura.datum_placanja
      ? dodajDane(danas, 15)
      : "",
    napomene: src.faktura.napomene ?? "",
    pdvProcenat: Number(src.faktura.pdv_procenat),
    popust: Math.abs(Number(src.faktura.popust)),
    stavke: src.stavke.map((s) => ({
      naziv: s.naziv,
      opis: s.opis ?? "",
      kolicina: Number(s.kolicina),
      cena: Math.abs(Number(s.cena)),
      jedinica: s.jedinica || "kom",
      pdvProcenat: s.pdv_procenat,
    })),
    status: "nacrt",
    tipDokumenta: noviTip,
    nacinTransporta: src.faktura.nacin_transporta ?? "",
    adresaDostave: src.faktura.adresa_dostave ?? "",
    registracijaVozila: src.faktura.registracija_vozila ?? "",
    vozac: src.faktura.vozac ?? "",
    pdvOslobodjenjeNapomena: src.faktura.pdv_oslobodjenje_napomena ?? "",
  });
}

/** Avansna → konačna faktura, sa stavkom umanjenja avansa. */
export async function konvertujAvansnuUFakturu(
  avansnaId: string
): Promise<
  | { ok: true; id: string; vecPostojala?: boolean }
  | { ok: false; error: string }
> {
  if (!idSchema.safeParse(avansnaId).success) {
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

  const { fetchFakturaSaStavkama } = await import("@/lib/fakture.server");
  const src = await fetchFakturaSaStavkama(supabase, avansnaId);
  if (!src || src.faktura.tip_dokumenta !== "avansna") {
    return { ok: false, error: "Avansna faktura nije pronađena." };
  }

  const { data: postojeca } = await supabase
    .from("fakture")
    .select("id")
    .eq("izvor_dokument_id", avansnaId)
    .eq("tip_dokumenta", "faktura")
    .eq("firma_id", firmaId)
    .maybeSingle();
  if (postojeca?.id) {
    return { ok: true, id: postojeca.id, vecPostojala: true };
  }

  const avansIznos = izracunajUkupanIznos(
    src.stavke,
    Number(src.faktura.pdv_procenat),
    Number(src.faktura.popust)
  );

  const danas = danasISO();
  return sacuvajFakturu({
    klijentId: src.faktura.klijent_id ?? "",
    brojFakture: "",
    referenca: `Konačna faktura po avansu ${src.faktura.broj}`,
    datumIzdavanja: danas,
    datumPlacanja: dodajDane(danas, 15),
    napomene: src.faktura.napomene ?? "",
    pdvProcenat: Number(src.faktura.pdv_procenat),
    popust: 0,
    stavke: [
      ...src.stavke.map((s) => ({
        naziv: s.naziv,
        opis: s.opis ?? "",
        kolicina: Number(s.kolicina),
        cena: Number(s.cena),
        jedinica: s.jedinica || "kom",
        pdvProcenat: s.pdv_procenat,
      })),
      {
        naziv: `Umanjenje avansa ${src.faktura.broj}`,
        opis: "Avans već fakturisan",
        kolicina: 1,
        cena: -Math.abs(avansIznos),
        jedinica: "kom",
        pdvProcenat: 0,
      },
    ],
    status: "nacrt",
    tipDokumenta: "faktura",
    izvorDokumentId: avansnaId,
  });
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
