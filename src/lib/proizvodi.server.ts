import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { requireAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import {
  fetchProizvodById as fetchProizvodByIdBase,
  fetchProizvodiList as fetchProizvodiListBase,
  type Proizvod,
} from "@/lib/proizvodi";

export async function fetchProizvodiList(
  supabase: SupabaseClient<Database>
): Promise<Proizvod[]> {
  const firmaId = await requireAktivnaFirmaId();
  return fetchProizvodiListBase(supabase, firmaId);
}

export async function fetchProizvodById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<Proizvod | null> {
  const firmaId = await requireAktivnaFirmaId();
  return fetchProizvodByIdBase(supabase, id, firmaId);
}

export type { Proizvod } from "@/lib/proizvodi";
