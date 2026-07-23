import { createClient } from "@/utils/supabase/server";
import type { FakturaListItem } from "@/lib/fakture";
import { fetchFaktureLista } from "@/lib/fakture.server";
import { fetchPodesavanjaFirme } from "@/lib/firma.server";
import { requireAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import { parseTipDokumenta } from "@/lib/tipDokumenta";
import {
  buildIzvjestajSnapshot,
  parseIzvjestajPeriod,
  type FakturaZaPdv,
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

  let pdvUlaz: FakturaZaPdv[] = [];
  try {
    const firmaId = await requireAktivnaFirmaId();
    const { data } = await supabase
      .from("fakture")
      .select("tip_dokumenta, status, datum_izdavanja, pdv_procenat, popust, id")
      .eq("firma_id", firmaId)
      .in("tip_dokumenta", ["faktura", "kreditna_nota"]);

    const ids = (data ?? []).map((r) => r.id);
    const iznosMap = new Map(fakture.map((f) => [f.id, f.iznos]));

    pdvUlaz = (data ?? []).map((r) => ({
      iznos: iznosMap.get(r.id) ?? 0,
      pdvProcenat: Number(r.pdv_procenat) || 0,
      popust: Number(r.popust) || 0,
      tipDokumenta: parseTipDokumenta(r.tip_dokumenta),
      status: r.status,
      datumIzdavanja: r.datum_izdavanja ?? "",
    }));
    void ids;
  } catch {
    pdvUlaz = [];
  }

  return buildIzvjestajSnapshot(fakture, period, valuta, pdvUlaz);
}
