import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type Proizvod = Database["public"]["Tables"]["proizvodi"]["Row"];

export async function fetchProizvodiList(
  supabase: SupabaseClient<Database>,
  firmaId: string
): Promise<Proizvod[]> {
  const { data, error } = await supabase
    .from("proizvodi")
    .select("*")
    .eq("firma_id", firmaId)
    .order("naziv", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Proizvod[];
}

export async function fetchProizvodById(
  supabase: SupabaseClient<Database>,
  id: string,
  firmaId: string
): Promise<Proizvod | null> {
  const { data, error } = await supabase
    .from("proizvodi")
    .select("*")
    .eq("id", id)
    .eq("firma_id", firmaId)
    .maybeSingle();

  if (error) throw error;
  return data as Proizvod | null;
}
