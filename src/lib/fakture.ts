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
  placenoIznos: number;
  status: FakturaStatus;
};

export type StavkaFaktureRow = Database["public"]["Tables"]["stavke_fakture"]["Row"];

export type FakturaSaStavkama = {
  faktura: Database["public"]["Tables"]["fakture"]["Row"];
  stavke: StavkaFaktureRow[];
  klijent: Database["public"]["Tables"]["klijenti"]["Row"] | null;
  /** Dokument od kojeg je nastao (npr. predračun → faktura). */
  izvor: { id: string; broj: string } | null;
};

type FaktureListaViewRow = Database["public"]["Views"]["fakture_lista"]["Row"];

export type FaktureFilter = {
  q?: string;
  status?: FakturaStatus;
  tip?: TipDokumenta;
  /** Donja granica datuma izdavanja (YYYY-MM-DD). */
  datumOd?: string;
};

export type FakturePage = {
  items: FakturaListItem[];
  ukupno: number;
  strana: number;
  poStrani: number;
};

export const FAKTURE_PO_STRANI = 10;

function mapViewRows(rows: FaktureListaViewRow[]): FakturaListItem[] {
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
      placenoIznos: Number(r.placeno_iznos ?? 0),
      status: r.status as FakturaStatus,
    }));
}

function buildFaktureListaQuery(
  supabase: SupabaseClient<Database>,
  firmaId: string,
  filter: FaktureFilter,
  options: { count?: boolean } = {}
) {
  let query = options.count
    ? supabase.from("fakture_lista").select("*", { count: "exact" })
    : supabase.from("fakture_lista").select("*");

  query = query.eq("firma_id", firmaId);

  if (filter.status) query = query.eq("status", filter.status);
  if (filter.tip) query = query.eq("tip_dokumenta", filter.tip);
  if (filter.datumOd) query = query.gte("datum_izdavanja", filter.datumOd);

  const q = (filter.q ?? "").trim();
  if (q) {
    // Escape % i _ za ilike; ukloni znakove koji lome PostgREST or() sintaksu
    const ociscen = q.replace(/[,()]/g, " ").trim();
    if (ociscen) {
      const pattern = `%${ociscen.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
      query = query.or(
        `broj.ilike.${pattern},klijent_naziv.ilike.${pattern},klijent_email.ilike.${pattern}`
      );
    }
  }

  return query.order("datum_izdavanja", { ascending: false });
}

// Dospele fakture označava dnevni cron (/api/cron/oznaci-dospjele) i
// trigger na insert/update, pa se ovde više ne poziva RPC pri čitanju.
export async function fetchFaktureLista(
  supabase: SupabaseClient<Database>,
  firmaId: string
): Promise<FakturaListItem[]> {
  const { data, error } = await supabase
    .from("fakture_lista")
    .select("*")
    .eq("firma_id", firmaId)
    .order("datum_izdavanja", { ascending: false });

  if (error) throw error;

  return mapViewRows((data ?? []) as FaktureListaViewRow[]);
}

/** Server-side filtrirana i paginirana lista dokumenata. */
export async function fetchFakturePage(
  supabase: SupabaseClient<Database>,
  firmaId: string,
  filter: FaktureFilter = {},
  strana = 1,
  poStrani = FAKTURE_PO_STRANI
): Promise<FakturePage> {
  const bezbednoPoStrani = Math.min(Math.max(1, poStrani), 100);
  const bezbednaStrana = Math.max(1, strana);
  const from = (bezbednaStrana - 1) * bezbednoPoStrani;
  const to = from + bezbednoPoStrani - 1;

  const { data, error, count } = await buildFaktureListaQuery(
    supabase,
    firmaId,
    filter,
    { count: true }
  ).range(from, to);

  if (error) throw error;

  return {
    items: mapViewRows((data ?? []) as FaktureListaViewRow[]),
    ukupno: count ?? 0,
    strana: bezbednaStrana,
    poStrani: bezbednoPoStrani,
  };
}

/** Filtrirana lista bez paginacije, za CSV izvoz (sa bezbednosnim limitom). */
export async function fetchFaktureZaIzvoz(
  supabase: SupabaseClient<Database>,
  firmaId: string,
  filter: FaktureFilter = {},
  limit = 5000
): Promise<FakturaListItem[]> {
  const { data, error } = await buildFaktureListaQuery(
    supabase,
    firmaId,
    filter
  ).limit(limit);

  if (error) throw error;

  return mapViewRows((data ?? []) as FaktureListaViewRow[]);
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
  const { data: faktura, error: fErr } = await supabase
    .from("fakture")
    .select("*")
    .eq("id", id)
    .eq("firma_id", firmaId)
    .maybeSingle();

  if (fErr) throw fErr;
  if (!faktura) return null;

  const fRow = {
    ...(faktura as Database["public"]["Tables"]["fakture"]["Row"]),
    placeno_iznos: Number(
      (faktura as { placeno_iznos?: number | null }).placeno_iznos ?? 0
    ),
  };

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

  let izvor: { id: string; broj: string } | null = null;
  const izvorId = (fRow as { izvor_dokument_id?: string | null }).izvor_dokument_id;
  if (izvorId) {
    const { data: iz, error: izErr } = await supabase
      .from("fakture")
      .select("id, broj")
      .eq("id", izvorId)
      .eq("firma_id", firmaId)
      .maybeSingle();
    // Ne ruši cijeli pregled ako kolona/migracija još nije dostupna.
    if (!izErr && iz?.id && iz.broj) {
      izvor = { id: iz.id, broj: iz.broj };
    }
  }

  return {
    faktura: fRow,
    stavke: (stavke ?? []) as StavkaFaktureRow[],
    klijent,
    izvor,
  };
}
