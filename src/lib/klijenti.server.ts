import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { requireAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import {
  fetchKlijentById as fetchKlijentByIdBase,
  fetchKlijentiList as fetchKlijentiListBase,
  fetchKlijentiSaFakturisano as fetchKlijentiSaFakturisanoBase,
  type Klijent,
  type KlijentSaFakturisano,
} from "@/lib/klijenti";

export async function fetchKlijentiList(
  supabase: SupabaseClient<Database>
): Promise<Klijent[]> {
  const firmaId = await requireAktivnaFirmaId();
  return fetchKlijentiListBase(supabase, firmaId);
}

export async function fetchKlijentiSaFakturisano(
  supabase: SupabaseClient<Database>
): Promise<KlijentSaFakturisano[]> {
  const firmaId = await requireAktivnaFirmaId();
  return fetchKlijentiSaFakturisanoBase(supabase, firmaId);
}

export async function fetchKlijentById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<Klijent | null> {
  const firmaId = await requireAktivnaFirmaId();
  return fetchKlijentByIdBase(supabase, id, firmaId);
}
