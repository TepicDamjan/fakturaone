import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { parseTipDokumenta, type TipDokumenta } from "@/lib/tipDokumenta";

export type FakturaStatus = Database["public"]["Enums"]["faktura_status"];

export type FakturaListItem = {
  id: string;
  broj: string;
  tipDokumenta: TipDokumenta;
  klijentNaziv: string;
  klijentEmail: string;
  datumIzdavanja: string;
  datumPlacanja: string;
  iznos: number;
  status: FakturaStatus;
};

export type StavkaFaktureRow = Database["public"]["Tables"]["stavke_fakture"]["Row"];

export type FakturaSaStavkama = {
  faktura: Database["public"]["Tables"]["fakture"]["Row"];
  stavke: StavkaFaktureRow[];
  klijent: Database["public"]["Tables"]["klijenti"]["Row"] | null;
};

type FaktureListaViewRow = Database["public"]["Views"]["fakture_lista"]["Row"];

/** Ažurira status na "kasni" za izdate fakture čiji je rok plaćanja prošao. */
export async function oznaciDospjeleFakture(
  supabase: SupabaseClient<Database>
): Promise<void> {
  const { error } = await supabase.rpc("oznaci_dospjele_fakture");
  if (error) throw error;
}

export async function fetchFaktureLista(
  supabase: SupabaseClient<Database>,
  firmaId: string
): Promise<FakturaListItem[]> {
  await oznaciDospjeleFakture(supabase);

  const { data, error } = await supabase
    .from("fakture_lista")
    .select("*")
    .eq("firma_id", firmaId)
    .order("datum_izdavanja", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as FaktureListaViewRow[];

  return rows
    .filter((r) => r.id && r.broj && r.status)
    .map((r) => ({
      id: r.id as string,
      broj: r.broj as string,
      tipDokumenta: parseTipDokumenta(r.tip_dokumenta),
      klijentNaziv: r.klijent_naziv ?? "",
      klijentEmail: r.klijent_email ?? "",
      datumIzdavanja: r.datum_izdavanja ?? "",
      datumPlacanja: r.datum_placanja ?? "",
      iznos: Number(r.iznos ?? 0),
      status: r.status as FakturaStatus,
    }));
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function fetchFakturaSaStavkama(
  supabase: SupabaseClient<Database>,
  id: string,
  firmaId: string
): Promise<FakturaSaStavkama | null> {
  await oznaciDospjeleFakture(supabase);

  const { data: faktura, error: fErr } = await supabase
    .from("fakture")
    .select("*")
    .eq("id", id)
    .eq("firma_id", firmaId)
    .maybeSingle();

  if (fErr) throw fErr;
  if (!faktura) return null;

  const fRow = faktura as Database["public"]["Tables"]["fakture"]["Row"];

  const { data: stavke, error: sErr } = await supabase
    .from("stavke_fakture")
    .select("*")
    .eq("faktura_id", id)
    .order("redosled", { ascending: true });

  if (sErr) throw sErr;

  let klijent: Database["public"]["Tables"]["klijenti"]["Row"] | null = null;
  if (fRow.klijent_id) {
    const { data: k, error: kErr } = await supabase
      .from("klijenti")
      .select("*")
      .eq("id", fRow.klijent_id)
      .eq("firma_id", firmaId)
      .maybeSingle();
    if (kErr) throw kErr;
    klijent = k as Database["public"]["Tables"]["klijenti"]["Row"] | null;
  }

  return {
    faktura: fRow,
    stavke: (stavke ?? []) as StavkaFaktureRow[],
    klijent,
  };
}
