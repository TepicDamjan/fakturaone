"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { requireAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import { proveriLimitKlijenata } from "@/lib/pretplata.server";
import { col, parseCsv } from "@/lib/csv";

export async function uvozKlijenataCsv(
  csvText: string
): Promise<
  | { ok: true; uvezeno: number; preskoceno: number; greske: string[] }
  | { ok: false; error: string }
> {
  const { headers, rows } = parseCsv(csvText);
  if (rows.length === 0) {
    return { ok: false, error: "CSV nema redova podataka." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Morate biti ulogovani." };

  let firmaId: string;
  try {
    firmaId = await requireAktivnaFirmaId();
  } catch {
    return { ok: false, error: "Nije izabrano preduzeće." };
  }

  let uvezeno = 0;
  let preskoceno = 0;
  const greske: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const naziv = col(headers, row, "naziv", "ime", "kompanija", "klijent");
    if (!naziv) {
      preskoceno += 1;
      continue;
    }

    const limitCheck = await proveriLimitKlijenata(supabase, user.id);
    if (!limitCheck.ok) {
      greske.push(`Red ${i + 2}: ${limitCheck.error}`);
      break;
    }

    const { error } = await supabase.from("klijenti").insert({
      user_id: user.id,
      firma_id: firmaId,
      naziv,
      pib: col(headers, row, "pib", "jib") || null,
      maticni_broj: col(headers, row, "maticni", "matični", "mb") || null,
      email: col(headers, row, "email", "e-mail") || null,
      telefon: col(headers, row, "telefon", "phone", "tel") || null,
      ulica: col(headers, row, "ulica", "adresa", "address") || null,
      grad: col(headers, row, "grad", "city") || null,
      postanski_broj: col(headers, row, "postanski", "poštanski", "zip") || null,
    });

    if (error) {
      if (error.code === "23505") {
        preskoceno += 1;
      } else {
        greske.push(`Red ${i + 2}: ${error.message}`);
      }
      continue;
    }
    uvezeno += 1;
  }

  revalidatePath("/dashboard/klijenti");
  return { ok: true, uvezeno, preskoceno, greske };
}

export async function uvozProizvodaCsv(
  csvText: string
): Promise<
  | { ok: true; uvezeno: number; preskoceno: number; greske: string[] }
  | { ok: false; error: string }
> {
  const { headers, rows } = parseCsv(csvText);
  if (rows.length === 0) {
    return { ok: false, error: "CSV nema redova podataka." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Morate biti ulogovani." };

  let firmaId: string;
  try {
    firmaId = await requireAktivnaFirmaId();
  } catch {
    return { ok: false, error: "Nije izabrano preduzeće." };
  }

  let uvezeno = 0;
  let preskoceno = 0;
  const greske: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const naziv = col(headers, row, "naziv", "ime", "proizvod", "usluga");
    if (!naziv) {
      preskoceno += 1;
      continue;
    }

    const cenaRaw = col(headers, row, "cena", "cijena", "price").replace(",", ".");
    const cena = Number(cenaRaw) || 0;

    const { error } = await supabase.from("proizvodi").insert({
      user_id: user.id,
      firma_id: firmaId,
      naziv,
      opis: col(headers, row, "opis", "description") || null,
      jedinica: col(headers, row, "jedinica", "jm", "unit") || "kom",
      cena,
    });

    if (error) {
      if (error.code === "23505") {
        preskoceno += 1;
      } else {
        greske.push(`Red ${i + 2}: ${error.message}`);
      }
      continue;
    }
    uvezeno += 1;
  }

  revalidatePath("/dashboard/proizvodi");
  return { ok: true, uvezeno, preskoceno, greske };
}
