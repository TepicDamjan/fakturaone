import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { requireAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import {
  fetchFakturaSaStavkama as fetchFakturaSaStavkamaBase,
  fetchFaktureLista as fetchFaktureListaBase,
  fetchFakturePage as fetchFakturePageBase,
  fetchFaktureZaIzvoz as fetchFaktureZaIzvozBase,
  type FaktureFilter,
  type FakturaListItem,
  type FakturaSaStavkama,
  type FakturePage,
} from "@/lib/fakture";

export async function fetchFaktureLista(
  supabase: SupabaseClient<Database>
): Promise<FakturaListItem[]> {
  const firmaId = await requireAktivnaFirmaId();
  return fetchFaktureListaBase(supabase, firmaId);
}

export async function fetchFakturePage(
  supabase: SupabaseClient<Database>,
  filter: FaktureFilter = {},
  strana = 1
): Promise<FakturePage> {
  const firmaId = await requireAktivnaFirmaId();
  return fetchFakturePageBase(supabase, firmaId, filter, strana);
}

export async function fetchFaktureZaIzvoz(
  supabase: SupabaseClient<Database>,
  filter: FaktureFilter = {}
): Promise<FakturaListItem[]> {
  const firmaId = await requireAktivnaFirmaId();
  return fetchFaktureZaIzvozBase(supabase, firmaId, filter);
}

export async function fetchFakturaSaStavkama(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<FakturaSaStavkama | null> {
  const firmaId = await requireAktivnaFirmaId();
  return fetchFakturaSaStavkamaBase(supabase, id, firmaId);
}
