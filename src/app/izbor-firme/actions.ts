"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { setAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import { proveriLimitFirme } from "@/lib/pretplata.server";
import { greskaAkoFirmaPostoji } from "@/lib/preduzeceUnique";

const LOGO_BUCKET = "firma-logos";
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const DOZVOLJENI_LOGO_TIPOVI = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t === "" ? null : t;
}

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
    default:
      return "bin";
  }
}

export async function postaviAktivnuFirmu(
  firmaId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani." };
  }

  const { data: firma, error } = await supabase
    .from("firma")
    .select("id")
    .eq("id", firmaId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !firma) {
    return { ok: false, error: "Preduzeće nije pronađeno." };
  }

  await setAktivnaFirmaId(firmaId);
  revalidatePath("/dashboard");
  revalidatePath("/izbor-firme");
  redirect("/dashboard");
}

export async function kreirajFirmu(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Morate biti ulogovani." };
  }

  const naziv = (formData.get("naziv") as string)?.trim();
  const pib = (formData.get("pib") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const adresa = (formData.get("adresa") as string)?.trim();
  const grad = (formData.get("grad") as string)?.trim();
  const postanskiBroj = (formData.get("postanskiBroj") as string)?.trim();
  const logo = formData.get("logo");

  if (!naziv) {
    return { error: "Naziv preduzeća je obavezan." };
  }
  if (!pib) {
    return { error: "PIB je obavezan." };
  }

  const konflikt = await greskaAkoFirmaPostoji(supabase, {
    userId: user.id,
    naziv,
    pib,
  });
  if (konflikt) {
    return { error: konflikt };
  }

  const limitCheck = await proveriLimitFirme(supabase, user.id);
  if (!limitCheck.ok) {
    return { error: limitCheck.error };
  }

  const { data: novaFirma, error: insertErr } = await supabase
    .from("firma")
    .insert({
      user_id: user.id,
      naziv,
      pib: emptyToNull(pib),
      email: emptyToNull(email),
      adresa: emptyToNull(adresa),
      grad: emptyToNull(grad),
      postanski_broj: emptyToNull(postanskiBroj),
    })
    .select("id")
    .single();

  if (insertErr || !novaFirma) {
    if (insertErr?.code === "23505") {
      return {
        error: "Preduzeće sa ovim PIB-om već postoji na vašem nalogu.",
      };
    }
    return { error: insertErr?.message ?? "Greška pri kreiranju preduzeća." };
  }

  if (logo instanceof File && logo.size > 0) {
    if (logo.size > MAX_LOGO_BYTES) {
      await supabase.from("firma").delete().eq("id", novaFirma.id);
      return { error: "Logo ne sme biti veći od 2 MB." };
    }
    if (!DOZVOLJENI_LOGO_TIPOVI.has(logo.type)) {
      await supabase.from("firma").delete().eq("id", novaFirma.id);
      return { error: "Dozvoljeni formati loga su PNG i JPG." };
    }

    const ext = extenzijaIzMime(logo.type);
    const putanja = `${user.id}/${novaFirma.id}/logo-${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(putanja, logo, {
        contentType: logo.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadErr) {
      await supabase.from("firma").delete().eq("id", novaFirma.id);
      return { error: uploadErr.message };
    }

    const { data: publicData } = supabase.storage
      .from(LOGO_BUCKET)
      .getPublicUrl(putanja);

    await supabase
      .from("firma")
      .update({ logo_url: publicData.publicUrl })
      .eq("id", novaFirma.id);
  }

  await setAktivnaFirmaId(novaFirma.id);
  revalidatePath("/izbor-firme");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
