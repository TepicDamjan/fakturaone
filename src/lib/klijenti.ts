import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type Klijent = Database["public"]["Tables"]["klijenti"]["Row"];

export async function fetchKlijentiList(
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
  id: string
): Promise<Klijent | null> {
  const { data, error } = await supabase
    .from("klijenti")
    .select("*")
    .eq("id", id)
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
