import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type FakturaStatus = Database["public"]["Enums"]["faktura_status"];

export type FakturaListItem = {
  id: string;
  broj: string;
  klijentNaziv: string;
  klijentEmail: string;
  datumIzdavanja: string;
  datumPlacanja: string;
  iznos: number;
  status: FakturaStatus;
};

type FaktureListaViewRow = Database["public"]["Views"]["fakture_lista"]["Row"];

export async function fetchFaktureLista(
  supabase: SupabaseClient<Database>
): Promise<FakturaListItem[]> {
  const { data, error } = await supabase
    .from("fakture_lista")
    .select("*")
    .order("datum_izdavanja", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as FaktureListaViewRow[];

  return rows
    .filter((r) => r.id && r.broj && r.status)
    .map((r) => ({
      id: r.id as string,
      broj: r.broj as string,
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
