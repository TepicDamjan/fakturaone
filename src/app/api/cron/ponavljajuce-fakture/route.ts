import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  dodajFrekvenciju,
  danasISO,
  parseStavkeJson,
  type FrekvencijaPonavljanja,
} from "@/lib/sabloni";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function dodajDane(iso: string, dana: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dana);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Vercel Cron: generiše fakture iz aktivnih ponavljajućih rasporeda.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "nije_podeseno" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "neautorizovano" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const danas = danasISO();

  const { data: rasporedi, error } = await supabase
    .from("ponavljajuce_fakture")
    .select("*")
    .eq("aktivan", true)
    .lte("sljedeci_datum", danas)
    .limit(100);

  if (error) {
    console.error("[cron ponavljajuce]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let kreirano = 0;
  let greske = 0;

  for (const r of rasporedi ?? []) {
    const stavke = parseStavkeJson(r.stavke);
    if (stavke.length === 0) {
      greske += 1;
      continue;
    }

    const { data: broj, error: brojErr } = await supabase.rpc(
      "sledeci_broj_dokumenta_servis",
      { p_firma_id: r.firma_id, p_tip: "faktura" }
    );
    if (brojErr || !broj) {
      console.error("[cron ponavljajuce] broj", r.id, brojErr);
      greske += 1;
      continue;
    }

    const datumIzdavanja = danas;
    const datumPlacanja = dodajDane(danas, Number(r.rok_placanja_dana) || 15);

    const { data: faktura, error: fErr } = await supabase
      .from("fakture")
      .insert({
        user_id: r.user_id,
        firma_id: r.firma_id,
        klijent_id: r.klijent_id,
        broj,
        referenca: r.referenca ?? r.naziv,
        datum_izdavanja: datumIzdavanja,
        datum_placanja: datumPlacanja,
        napomene: r.napomene,
        pdv_procenat: r.pdv_procenat,
        popust: r.popust,
        status: "na_cekanju",
        tip_dokumenta: "faktura",
      })
      .select("id")
      .single();

    if (fErr || !faktura) {
      console.error("[cron ponavljajuce] insert", r.id, fErr);
      greske += 1;
      continue;
    }

    const { error: sErr } = await supabase.from("stavke_fakture").insert(
      stavke.map((s, i) => ({
        faktura_id: faktura.id,
        naziv: s.naziv,
        opis: s.opis || null,
        kolicina: s.kolicina,
        cena: s.cena,
        jedinica: s.jedinica,
        redosled: i,
      }))
    );

    if (sErr) {
      await supabase.from("fakture").delete().eq("id", faktura.id);
      console.error("[cron ponavljajuce] stavke", r.id, sErr);
      greske += 1;
      continue;
    }

    const frekvencija = r.frekvencija as FrekvencijaPonavljanja;
    let sljedeci = dodajFrekvenciju(r.sljedeci_datum, frekvencija);
    // Ako je raspored kasnio više perioda, pomjeri do budućnosti
    while (sljedeci <= danas) {
      sljedeci = dodajFrekvenciju(sljedeci, frekvencija);
    }

    await supabase
      .from("ponavljajuce_fakture")
      .update({
        sljedeci_datum: sljedeci,
        zadnji_faktura_id: faktura.id,
      })
      .eq("id", r.id);

    kreirano += 1;
  }

  return NextResponse.json({ kreirano, greske });
}
