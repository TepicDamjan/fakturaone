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

const FAKTURA_BASE_COLUMNS =
  "id, user_id, firma_id, klijent_id, broj, referenca, datum_izdavanja, datum_placanja, napomene, pdv_procenat, popust, status, tip_dokumenta, nacin_transporta, adresa_dostave, registracija_vozila, vozac, created_at, updated_at";

const FAKTURA_OPTIONAL_COLUMNS =
  "izvor_dokument_id, placeno_iznos, posljednji_podsjetnik_at, posljednji_podsjetnik_vrsta";

function isMissingColumnError(err: unknown): boolean {
  const msg =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: unknown }).message)
      : String(err ?? "");
  return /column|schema cache|does not exist/i.test(msg);
}

async function selectFakturaById(
  supabase: SupabaseClient<Database>,
  id: string
) {
  // 1) Pokušaj sa svim kolonama (Phase 1+)
  const full = await supabase
    .from("fakture")
    .select(`${FAKTURA_BASE_COLUMNS}, ${FAKTURA_OPTIONAL_COLUMNS}`)
    .eq("id", id)
    .maybeSingle();

  if (!full.error) return full;

  if (!isMissingColumnError(full.error)) {
    return full;
  }

  // 2) Fallback: baza bez Phase 1 migracija (0019–0022)
  return supabase
    .from("fakture")
    .select(FAKTURA_BASE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
}

export async function fetchFakturaSaStavkama(
  supabase: SupabaseClient<Database>,
  id: string,
  firmaId: string
): Promise<FakturaSaStavkama | null> {
  // Ne filtriraj po firma_id u SQL-u — RLS već ograničava na firme korisnika.
  // Tako pregled radi i ako cookie aktivne firme nije savršeno usklađen.
  const { data: faktura, error: fErr } = await selectFakturaById(supabase, id);

  if (fErr) throw fErr;
  if (!faktura) return null;

  const raw = faktura as Record<string, unknown>;
  const rowFirmaId = typeof raw.firma_id === "string" ? raw.firma_id : firmaId;

  const fRow = {
    ...(faktura as Database["public"]["Tables"]["fakture"]["Row"]),
    placeno_iznos: Number(raw.placeno_iznos ?? 0),
    izvor_dokument_id:
      typeof raw.izvor_dokument_id === "string" ? raw.izvor_dokument_id : null,
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
      .maybeSingle();
    if (!kErr) {
      klijent = k as Database["public"]["Tables"]["klijenti"]["Row"] | null;
    }
  }

  let izvor: { id: string; broj: string } | null = null;
  if (fRow.izvor_dokument_id) {
    const { data: iz, error: izErr } = await supabase
      .from("fakture")
      .select("id, broj")
      .eq("id", fRow.izvor_dokument_id)
      .maybeSingle();
    if (!izErr && iz?.id && iz.broj) {
      izvor = { id: iz.id, broj: iz.broj };
    }
  }

  // Ako dokument pripada drugoj firmi korisnika, i dalje ga prikaži (RLS je pustio red).
  void rowFirmaId;

  return {
    faktura: fRow,
    stavke: (stavke ?? []) as StavkaFaktureRow[],
    klijent,
    izvor,
  };
}
