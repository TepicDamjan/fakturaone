import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { requireAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import {
  fetchFakturaSaStavkama as fetchFakturaSaStavkamaBase,
  fetchFaktureLista as fetchFaktureListaBase,
  type FakturaListItem,
  type FakturaSaStavkama,
} from "@/lib/fakture";

export async function fetchFaktureLista(
  supabase: SupabaseClient<Database>
): Promise<FakturaListItem[]> {
  const firmaId = await requireAktivnaFirmaId();
  return fetchFaktureListaBase(supabase, firmaId);
}

export async function fetchFakturaSaStavkama(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<FakturaSaStavkama | null> {
  const firmaId = await requireAktivnaFirmaId();
  return fetchFakturaSaStavkamaBase(supabase, id, firmaId);
}
