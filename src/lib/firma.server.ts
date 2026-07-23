import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getAktivnaFirmaId, requireAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import type { BankovniRacunRow, FirmaRow, PodesavanjaFirme } from "@/lib/firma";

export async function fetchPodesavanjaFirme(
  supabase: SupabaseClient<Database>
): Promise<PodesavanjaFirme> {
  const aktivnaFirmaId = await getAktivnaFirmaId();

  let firmaQuery = supabase.from("firma").select("*");
  if (aktivnaFirmaId) {
    firmaQuery = firmaQuery.eq("id", aktivnaFirmaId);
  } else {
    firmaQuery = firmaQuery.order("created_at", { ascending: true }).limit(1);
  }

  const { data: firma, error: fErr } = await firmaQuery.maybeSingle();

  if (fErr) throw fErr;

  const firmaRow = firma as FirmaRow | null;
  const firmaId = firmaRow?.id ?? aktivnaFirmaId;

  let racuniQuery = supabase
    .from("bankovni_racuni")
    .select("*")
    .order("redosled", { ascending: true })
    .order("created_at", { ascending: true });

  if (firmaId) {
    racuniQuery = racuniQuery.eq("firma_id", firmaId);
  }

  const { data: racuni, error: rErr } = await racuniQuery;

  if (rErr) throw rErr;

  return {
    firma: firmaRow,
    racuni: (racuni ?? []) as BankovniRacunRow[],
  };
}

export async function getAktivnaFirmaIdForData(): Promise<string> {
  return requireAktivnaFirmaId();
}
