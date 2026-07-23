import { createClient } from "@/utils/supabase/server";
import { fetchFakturaSaStavkama } from "@/lib/fakture.server";
import { fetchPodesavanjaFirme } from "@/lib/firma.server";
import {
  buildDokumentModel,
  type DokumentModel,
} from "@/lib/dokument/dokumentModel";

export async function ucitajDokumentModel(
  fakturaId: string
): Promise<
  | { ok: true; model: DokumentModel }
  | { ok: false; error: string; status: 401 | 403 | 404 | 500 }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani.", status: 401 };
  }

  let payload;
  try {
    payload = await fetchFakturaSaStavkama(supabase, fakturaId);
  } catch {
    return { ok: false, error: "Greška pri učitavanju dokumenta.", status: 500 };
  }

  if (!payload) {
    return {
      ok: false,
      error: "Dokument nije pronađen ili vam ne pripada.",
      status: 404,
    };
  }

  let podesavanja;
  try {
    podesavanja = await fetchPodesavanjaFirme(supabase);
  } catch {
    return {
      ok: false,
      error: "Greška pri učitavanju podataka firme.",
      status: 500,
    };
  }

  return { ok: true, model: buildDokumentModel(payload, podesavanja) };
}
