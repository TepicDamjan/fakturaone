import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type Klijent = Database["public"]["Tables"]["klijenti"]["Row"];

export type KlijentSaFakturisano = Klijent & {
  ukupnoFakturisano: number;
};

type FakturaSaStavkamaRow = {
  klijent_id: string | null;
  pdv_procenat: number;
  popust: number;
  stavke_fakture: { kolicina: number; cena: number }[] | null;
};

export async function fetchKlijentiSaFakturisano(
  supabase: SupabaseClient<Database>,
  firmaId: string
): Promise<KlijentSaFakturisano[]> {
  const klijenti = await fetchKlijentiList(supabase, firmaId);

  const { data: fakture, error } = await supabase
    .from("fakture")
    .select(`
      klijent_id,
      pdv_procenat,
      popust,
      stavke_fakture ( kolicina, cena )
    `)
    .eq("firma_id", firmaId);

  if (error) throw error;

  const totals = new Map<string, number>();
  const rows = (fakture ?? []) as FakturaSaStavkamaRow[];

  for (const row of rows) {
    const kid = row.klijent_id;
    if (!kid) continue;
    const stavke = row.stavke_fakture ?? [];
    const osnovica = stavke.reduce(
      (s, x) => s + Number(x.kolicina) * Number(x.cena),
      0
    );
    const pdv = Number(row.pdv_procenat);
    const popust = Number(row.popust);
    const iznos = osnovica * (1 + pdv / 100) - popust;
    totals.set(kid, (totals.get(kid) ?? 0) + iznos);
  }

  return klijenti.map((k) => ({
    ...k,
    ukupnoFakturisano: totals.get(k.id) ?? 0,
  }));
}

export async function fetchKlijentiList(
  supabase: SupabaseClient<Database>,
  firmaId: string
): Promise<Klijent[]> {
  const { data, error } = await supabase
    .from("klijenti")
    .select("*")
    .eq("firma_id", firmaId)
    .order("naziv", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Klijent[];
}

/** Svi klijenti korisnika (svih firmi) — RLS ograničava na vlasnika. */
export async function fetchSviKlijentiKorisnika(
  supabase: SupabaseClient<Database>
): Promise<Klijent[]> {
  const { data, error } = await supabase
    .from("klijenti")
    .select("*")
    .order("naziv", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Klijent[];
}

export async function fetchKlijentById(
  supabase: SupabaseClient<Database>,
  id: string,
  firmaId: string
): Promise<Klijent | null> {
  const { data, error } = await supabase
    .from("klijenti")
    .select("*")
    .eq("id", id)
    .eq("firma_id", firmaId)
    .maybeSingle();

  if (error) throw error;
  return data as Klijent | null;
}

export function formatKlijentAdresa(k: Pick<Klijent, "ulica" | "grad" | "postanski_broj">): string {
  const ulica = k.ulica?.trim() ?? "";
  const grad = k.grad?.trim() ?? "";
  const postanski = k.postanski_broj?.trim() ?? "";
  const desno = [postanski, grad].filter(Boolean).join(" ");
  return [ulica, desno].filter(Boolean).join(", ");
}
