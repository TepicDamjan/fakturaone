import { createClient } from "@/utils/supabase/server";
import type { FakturaListItem } from "@/lib/fakture";
import { fetchFaktureLista } from "@/lib/fakture.server";
import { fetchPodesavanjaFirme } from "@/lib/firma.server";
import { requireAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import { parseTipDokumenta } from "@/lib/tipDokumenta";
import { izracunajPdvOdUkupnog } from "@/lib/izvjestaji";
import {
  buildIzvjestajSnapshot,
  parseIzvjestajPeriod,
  type FakturaZaPdv,
  type IzvjestajSnapshot,
  type KifRed,
} from "@/lib/izvjestaji";

export async function fetchIzvjestajSnapshot(
  periodRaw: string | null | undefined,
  od?: string | null,
  doo?: string | null
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
  let kif: KifRed[] = [];
  try {
    const firmaId = await requireAktivnaFirmaId();
    const { data } = await supabase
      .from("fakture")
      .select(
        "id, broj, tip_dokumenta, status, datum_izdavanja, pdv_procenat, popust, klijent_id, klijenti(naziv, pib)"
      )
      .eq("firma_id", firmaId)
      .in("tip_dokumenta", ["faktura", "kreditna_nota", "avansna"]);

    const iznosMap = new Map(fakture.map((f) => [f.id, f.iznos]));

    pdvUlaz = (data ?? []).map((r) => ({
      iznos: iznosMap.get(r.id) ?? 0,
      pdvProcenat: Number(r.pdv_procenat) || 0,
      popust: Number(r.popust) || 0,
      tipDokumenta: parseTipDokumenta(r.tip_dokumenta),
      status: r.status,
      datumIzdavanja: r.datum_izdavanja ?? "",
    }));

    kif = (data ?? [])
      .filter((r) => r.status !== "nacrt")
      .map((r) => {
        const k = r.klijenti as { naziv?: string; pib?: string | null } | null;
        const ukupno = iznosMap.get(r.id) ?? 0;
        const p = izracunajPdvOdUkupnog(
          ukupno,
          Number(r.pdv_procenat) || 0,
          Number(r.popust) || 0
        );
        return {
          id: r.id,
          datum: r.datum_izdavanja ?? "",
          broj: r.broj,
          klijent: k?.naziv ?? "—",
          jib: k?.pib?.trim() || "—",
          osnovica: p.osnovica,
          pdvIznos: p.pdvIznos,
          ukupno,
          pdvProcenat: Number(r.pdv_procenat) || 0,
        };
      });
  } catch {
    pdvUlaz = [];
    kif = [];
  }

  return buildIzvjestajSnapshot(
    fakture,
    period,
    valuta,
    pdvUlaz,
    { start: od ?? undefined, end: doo ?? undefined },
    kif
  );
}
