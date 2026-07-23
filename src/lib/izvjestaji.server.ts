import { createClient } from "@/utils/supabase/server";
import type { FakturaListItem } from "@/lib/fakture";
import { fetchFaktureLista } from "@/lib/fakture.server";
import { fetchPodesavanjaFirme } from "@/lib/firma.server";
import {
  buildIzvjestajSnapshot,
  parseIzvjestajPeriod,
  type IzvjestajSnapshot,
} from "@/lib/izvjestaji";

export async function fetchIzvjestajSnapshot(
  periodRaw: string | null | undefined
): Promise<IzvjestajSnapshot> {
  const period = parseIzvjestajPeriod(periodRaw);
  const supabase = await createClient();

  let fakture: FakturaListItem[] = [];
  try {
    fakture = await fetchFaktureLista(supabase);
  } catch {
    fakture = [];
  }

  let valuta = "BAM";
  try {
    const { firma } = await fetchPodesavanjaFirme(supabase);
    valuta = firma?.valuta?.trim() || "BAM";
  } catch {
    valuta = "BAM";
  }

  return buildIzvjestajSnapshot(fakture, period, valuta);
}
