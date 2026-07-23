"use server";

import { revalidatePath } from "next/cache";
import { ucitajDokumentModel } from "@/lib/dokument/ucitajDokument";
import { posaljiDokumentEmail } from "@/lib/email/posaljiDokumentEmail";
import { proveriEmailSlanje } from "@/lib/pretplata.server";
import { createClient } from "@/utils/supabase/server";
import { promeniStatusFakture } from "@/app/dashboard/fakture/actions";

export async function posaljiFakturuEmail(
  fakturaId: string,
  opcionaPoruka?: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani." };
  }

  const emailCheck = await proveriEmailSlanje(supabase, user.id);
  if (!emailCheck.ok) {
    return emailCheck;
  }

  const loaded = await ucitajDokumentModel(fakturaId);
  if (!loaded.ok) {
    return { ok: false, error: loaded.error };
  }

  const sent = await posaljiDokumentEmail(loaded.model, opcionaPoruka);
  if (!sent.ok) return sent;

  if (loaded.model.tipDokumenta === "faktura") {
    await promeniStatusFakture(fakturaId, "na_cekanju");
  }

  revalidatePath("/dashboard/fakture");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/fakture/${fakturaId}/pregled`);

  return { ok: true };
}
