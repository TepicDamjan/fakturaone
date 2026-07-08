"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { requireAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import { sacuvajProizvodSchema } from "@/lib/validacija/proizvodi";
import { idSchema, NEISPRAVNI_PODACI_GRESKA } from "@/lib/validacija/zajednicko";

export type SacuvajProizvodInput = {
  naziv: string;
  opis: string;
  jedinica: string;
  cena: number;
};

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t === "" ? null : t;
}

export async function sacuvajProizvod(
  input: SacuvajProizvodInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!sacuvajProizvodSchema.safeParse(input).success) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani da biste sačuvali proizvod." };
  }

  const naziv = input.naziv.trim();
  if (!naziv) {
    return { ok: false, error: "Naziv proizvoda je obavezan." };
  }

  let firmaId: string;
  try {
    firmaId = await requireAktivnaFirmaId();
  } catch {
    return { ok: false, error: "Nije izabrano preduzeće." };
  }

  const row = {
    user_id: user.id,
    firma_id: firmaId,
    naziv,
    opis: emptyToNull(input.opis),
    jedinica: input.jedinica.trim() || "kom",
    cena: input.cena,
  };

  const { error } = await supabase.from("proizvodi").insert(row);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Proizvod sa istim nazivom već postoji u ovoj firmi.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/proizvodi");
  return { ok: true };
}

export async function azurirajProizvod(
  proizvodId: string,
  input: SacuvajProizvodInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (
    !idSchema.safeParse(proizvodId).success ||
    !sacuvajProizvodSchema.safeParse(input).success
  ) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani da biste sačuvali izmene." };
  }

  const naziv = input.naziv.trim();
  if (!naziv) {
    return { ok: false, error: "Naziv proizvoda je obavezan." };
  }

  let firmaId: string;
  try {
    firmaId = await requireAktivnaFirmaId();
  } catch {
    return { ok: false, error: "Nije izabrano preduzeće." };
  }

  const row = {
    naziv,
    opis: emptyToNull(input.opis),
    jedinica: input.jedinica.trim() || "kom",
    cena: input.cena,
  };

  const { error } = await supabase
    .from("proizvodi")
    .update(row)
    .eq("id", proizvodId)
    .eq("firma_id", firmaId);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Proizvod sa istim nazivom već postoji u ovoj firmi.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/proizvodi");
  return { ok: true };
}

export async function obrisiProizvod(
  proizvodId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!idSchema.safeParse(proizvodId).success) {
    return { ok: false, error: NEISPRAVNI_PODACI_GRESKA };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Morate biti ulogovani." };
  }

  let firmaId: string;
  try {
    firmaId = await requireAktivnaFirmaId();
  } catch {
    return { ok: false, error: "Nije izabrano preduzeće." };
  }

  const { error } = await supabase
    .from("proizvodi")
    .delete()
    .eq("id", proizvodId)
    .eq("firma_id", firmaId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/proizvodi");
  return { ok: true };
}

export async function ucitajProizvodiList() {
  const supabase = await createClient();
  const { fetchProizvodiList } = await import("@/lib/proizvodi.server");
  return fetchProizvodiList(supabase);
}
