"use server";

import { revalidatePath } from "next/cache";
import { ucitajDokumentModel } from "@/lib/dokument/ucitajDokument";
import { posaljiDokumentEmail } from "@/lib/email/posaljiDokumentEmail";
import { promeniStatusFakture } from "@/app/dashboard/fakture/actions";

export async function posaljiFakturuEmail(
  fakturaId: string,
  opcionaPoruka?: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
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
