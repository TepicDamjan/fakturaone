"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getAktivnaFirmaId, setAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import { fetchPodesavanjaFirme } from "@/lib/firma.server";
import type { PodesavanjaFirme } from "@/lib/firma";
import { greskaAkoFirmaPostoji } from "@/lib/preduzeceUnique";
import { proveriLimitFirme } from "@/lib/pretplata.server";

const LOGO_BUCKET = "firma-logos";
const MAX_LOGO_BYTES = 1024 * 1024; // 1 MB
const DOZVOLJENI_LOGO_TIPOVI = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

function extenzijaIzMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}

function storagePutanjaIzUrl(publicUrl: string | null): string | null {
  if (!publicUrl) return null;
  const marker = `/storage/v1/object/public/${LOGO_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  const putanja = publicUrl.slice(idx + marker.length);
  const qIdx = putanja.indexOf("?");
  return qIdx === -1 ? putanja : putanja.slice(0, qIdx);
}

export async function ucitajPodesavanjaFirme(): Promise<PodesavanjaFirme> {
  const supabase = await createClient();
  return fetchPodesavanjaFirme(supabase);
}

export async function otpremiLogoFirme(
  formData: FormData
): Promise<{ ok: true; logoUrl: string } | { ok: false; error: string }> {
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Nije izabrana slika." };
  }
  if (file.size > MAX_LOGO_BYTES) {
    return { ok: false, error: "Logo ne sme biti veći od 1 MB." };
  }
  if (!DOZVOLJENI_LOGO_TIPOVI.has(file.type)) {
    return {
      ok: false,
      error: "Dozvoljeni formati su JPG, PNG, GIF, WEBP ili SVG.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Morate biti ulogovani." };
  }

  const ext = extenzijaIzMime(file.type);
  const putanja = `${user.id}/logo-${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(putanja, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    });
  if (uploadErr) {
    return { ok: false, error: uploadErr.message };
  }

  const { data: publicData } = supabase.storage
    .from(LOGO_BUCKET)
    .getPublicUrl(putanja);
  const logoUrl = publicData.publicUrl;

  const aktivnaFirmaId = await getAktivnaFirmaId();

  let firmaQuery = supabase.from("firma").select("id, logo_url");
  if (aktivnaFirmaId) {
    firmaQuery = firmaQuery.eq("id", aktivnaFirmaId);
  } else {
    firmaQuery = firmaQuery.eq("user_id", user.id).order("created_at", { ascending: true }).limit(1);
  }

  const { data: postojeca } = await firmaQuery.maybeSingle();

  if (postojeca) {
    const { error: updErr } = await supabase
      .from("firma")
      .update({ logo_url: logoUrl })
      .eq("id", postojeca.id)
      .eq("user_id", user.id);
    if (updErr) {
      await supabase.storage.from(LOGO_BUCKET).remove([putanja]);
      return { ok: false, error: updErr.message };
    }
    const staraPutanja = storagePutanjaIzUrl(postojeca.logo_url);
    if (staraPutanja && staraPutanja !== putanja) {
      await supabase.storage.from(LOGO_BUCKET).remove([staraPutanja]);
    }
  } else {
    const { error: insErr } = await supabase.from("firma").insert({
      user_id: user.id,
      naziv: "",
      logo_url: logoUrl,
    });
    if (insErr) {
      await supabase.storage.from(LOGO_BUCKET).remove([putanja]);
      return { ok: false, error: insErr.message };
    }
  }

  revalidatePath("/dashboard/podesavanja");
  return { ok: true, logoUrl };
}

export async function ukloniLogoFirme(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Morate biti ulogovani." };
  }

  const aktivnaFirmaId = await getAktivnaFirmaId();

  let firmaQuery = supabase.from("firma").select("id, logo_url");
  if (aktivnaFirmaId) {
    firmaQuery = firmaQuery.eq("id", aktivnaFirmaId);
  } else {
    firmaQuery = firmaQuery.eq("user_id", user.id).order("created_at", { ascending: true }).limit(1);
  }

  const { data: postojeca } = await firmaQuery.maybeSingle();

  if (postojeca?.logo_url) {
    const { error: updErr } = await supabase
      .from("firma")
      .update({ logo_url: null })
      .eq("id", postojeca.id)
      .eq("user_id", user.id);
    if (updErr) {
      return { ok: false, error: updErr.message };
    }
    const putanja = storagePutanjaIzUrl(postojeca.logo_url);
    if (putanja) {
      await supabase.storage.from(LOGO_BUCKET).remove([putanja]);
    }
  }

  revalidatePath("/dashboard/podesavanja");
  return { ok: true };
}

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

  const aktivnaFirmaId = await getAktivnaFirmaId();

  let existingQuery = supabase.from("firma").select("id");
  if (aktivnaFirmaId) {
    existingQuery = existingQuery.eq("id", aktivnaFirmaId);
  } else {
    existingQuery = existingQuery.eq("user_id", user.id).order("created_at", { ascending: true }).limit(1);
  }

  const { data: existing } = await existingQuery.maybeSingle();

  const pib = emptyToNull(firma.pib);
  const konflikt = await greskaAkoFirmaPostoji(supabase, {
    userId: user.id,
    naziv,
    pib,
    iskljuciFirmaId: existing?.id,
  });
  if (konflikt) {
    return { ok: false, error: konflikt };
  }

  const firmaRow = {
    user_id: user.id,
    naziv,
    pib,
    maticni_broj: emptyToNull(firma.maticniBroj),
    adresa: emptyToNull(firma.adresa),
    email: emptyToNull(firma.email),
    telefon: emptyToNull(firma.telefon),
    valuta: firma.valuta.trim() || "BAM",
    pdv_procenat: clampPdv(firma.pdvProcenat),
    rok_placanja_dana: clampDana(firma.rokPlacanjaDana),
  };

  let targetFirmaId: string;

  if (existing) {
    const { error } = await supabase
      .from("firma")
      .update(firmaRow)
      .eq("id", existing.id)
      .eq("user_id", user.id);
    if (error) {
      if (error.code === "23505") {
        return {
          ok: false,
          error: "Preduzeće sa ovim PIB-om već postoji na vašem nalogu.",
        };
      }
      return { ok: false, error: error.message };
    }
    targetFirmaId = existing.id;
  } else {
    const limitCheck = await proveriLimitFirme(supabase, user.id);
    if (!limitCheck.ok) {
      return { ok: false, error: limitCheck.error };
    }

    const { data: inserted, error } = await supabase
      .from("firma")
      .insert(firmaRow)
      .select("id")
      .single();
    if (error || !inserted) {
      if (error?.code === "23505") {
        return {
          ok: false,
          error: "Preduzeće sa ovim PIB-om već postoji na vašem nalogu.",
        };
      }
      return { ok: false, error: error?.message ?? "Greška pri čuvanju firme." };
    }
    targetFirmaId = inserted.id;
    await setAktivnaFirmaId(targetFirmaId);
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
    .eq("firma_id", targetFirmaId);

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
      .eq("firma_id", targetFirmaId);
    if (error) return { ok: false, error: error.message };
  }

  for (let i = 0; i < validRacuni.length; i++) {
    const r = validRacuni[i];
    const row = {
      user_id: user.id,
      firma_id: targetFirmaId,
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
        .eq("firma_id", targetFirmaId);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase.from("bankovni_racuni").insert(row);
      if (error) return { ok: false, error: error.message };
    }
  }

  revalidatePath("/dashboard/podesavanja");
  return { ok: true };
}
