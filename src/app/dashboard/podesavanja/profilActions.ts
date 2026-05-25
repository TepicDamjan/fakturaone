"use server";

import { revalidatePath } from "next/cache";
import { isPasswordStrongEnough } from "@/lib/passwordStrength";
import { createClient } from "@/utils/supabase/server";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const DOZVOLJENI_AVATAR_TIPOVI = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);

function extenzijaIzMimeAvatar(mime: string): string {
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

function avatarPutanjaIzUrl(publicUrl: string | null | undefined): string | null {
  if (!publicUrl) return null;
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  const putanja = publicUrl.slice(idx + marker.length);
  const qIdx = putanja.indexOf("?");
  return qIdx === -1 ? putanja : putanja.slice(0, qIdx);
}

export type AzurirajProfilInput = {
  ime: string;
  email: string;
  telefon: string;
  pozicija: string;
};

export type AzurirajProfilResult =
  | { ok: true; emailPromenjen: boolean }
  | { ok: false; error: string };

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t === "" ? null : t;
}

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("password")) {
    return "Lozinka ne ispunjava bezbednosne zahteve ili nije ispravna.";
  }
  if (lower.includes("valid email") || lower.includes("invalid email")) {
    return "Unesite ispravnu email adresu.";
  }
  if (lower.includes("rate limit")) {
    return "Previše pokušaja. Sačekajte par minuta i probajte ponovo.";
  }
  if (lower.includes("user not found")) {
    return "Korisnik nije pronađen.";
  }
  return message || "Došlo je do greške. Pokušajte ponovo.";
}

export async function azurirajProfil(
  input: AzurirajProfilInput
): Promise<AzurirajProfilResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Morate biti ulogovani." };
  }

  const ime = input.ime.trim();
  if (!ime) {
    return { ok: false, error: "Ime i prezime su obavezni." };
  }
  const email = input.email.trim();
  if (!email) {
    return { ok: false, error: "Email adresa je obavezna." };
  }

  const emailPromenjen = email.toLowerCase() !== (user.email ?? "").toLowerCase();

  const updatePayload: Parameters<typeof supabase.auth.updateUser>[0] = {
    data: {
      ...user.user_metadata,
      full_name: ime,
      telefon: emptyToNull(input.telefon),
      pozicija: emptyToNull(input.pozicija),
    },
  };

  if (emailPromenjen) {
    updatePayload.email = email;
  }

  const { error } = await supabase.auth.updateUser(updatePayload);
  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  revalidatePath("/dashboard/podesavanja");
  return { ok: true, emailPromenjen };
}

export async function promeniLozinku(input: {
  novaLozinka: string;
  potvrdaLozinke: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Morate biti ulogovani." };
  }

  if (input.novaLozinka !== input.potvrdaLozinke) {
    return { ok: false, error: "Lozinke se ne poklapaju." };
  }
  if (!isPasswordStrongEnough(input.novaLozinka)) {
    return {
      ok: false,
      error: "Lozinka mora imati najmanje 8 karaktera i srednju jačinu ili više.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: input.novaLozinka });
  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  return { ok: true };
}

export async function otpremiAvatar(
  formData: FormData
): Promise<{ ok: true; avatarUrl: string } | { ok: false; error: string }> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Nije izabrana slika." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, error: "Slika ne sme biti veća od 2 MB." };
  }
  if (!DOZVOLJENI_AVATAR_TIPOVI.has(file.type)) {
    return { ok: false, error: "Dozvoljeni formati su JPG, PNG, GIF ili WEBP." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Morate biti ulogovani." };
  }

  const ext = extenzijaIzMimeAvatar(file.type);
  const putanja = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(putanja, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    });
  if (uploadErr) {
    return { ok: false, error: uploadErr.message };
  }

  const { data: publicData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(putanja);
  const avatarUrl = publicData.publicUrl;

  const staraSlika = (user.user_metadata as Record<string, unknown> | undefined)
    ?.avatar_url;
  const staraPutanja = avatarPutanjaIzUrl(
    typeof staraSlika === "string" ? staraSlika : null
  );

  const { error: updErr } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      avatar_url: avatarUrl,
    },
  });
  if (updErr) {
    await supabase.storage.from(AVATAR_BUCKET).remove([putanja]);
    return { ok: false, error: mapAuthError(updErr.message) };
  }

  if (staraPutanja && staraPutanja !== putanja) {
    await supabase.storage.from(AVATAR_BUCKET).remove([staraPutanja]);
  }

  revalidatePath("/dashboard/podesavanja");
  revalidatePath("/dashboard", "layout");
  return { ok: true, avatarUrl };
}

export async function ukloniAvatar(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Morate biti ulogovani." };
  }

  const trenutna = (user.user_metadata as Record<string, unknown> | undefined)
    ?.avatar_url;
  const putanja = avatarPutanjaIzUrl(
    typeof trenutna === "string" ? trenutna : null
  );

  const { error: updErr } = await supabase.auth.updateUser({
    data: { ...user.user_metadata, avatar_url: null },
  });
  if (updErr) {
    return { ok: false, error: mapAuthError(updErr.message) };
  }

  if (putanja) {
    await supabase.storage.from(AVATAR_BUCKET).remove([putanja]);
  }

  revalidatePath("/dashboard/podesavanja");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
