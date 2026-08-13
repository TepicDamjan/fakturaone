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

  let poslato = 0;

  for (const r of rasporedi ?? []) {
    if (r.zavrsni_datum && r.zavrsni_datum < danas) {
      await supabase
        .from("ponavljajuce_fakture")
        .update({ aktivan: false })
        .eq("id", r.id);
      continue;
    }
    if (
      r.max_ponavljanja != null &&
      Number(r.broj_generisanih ?? 0) >= Number(r.max_ponavljanja)
    ) {
      await supabase
        .from("ponavljajuce_fakture")
        .update({ aktivan: false })
        .eq("id", r.id);
      continue;
    }

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

    const brojGenerisanih = Number(r.broj_generisanih ?? 0) + 1;
    const istekMax =
      r.max_ponavljanja != null && brojGenerisanih >= Number(r.max_ponavljanja);
    const istekDatum = Boolean(r.zavrsni_datum && sljedeci > r.zavrsni_datum);

    await supabase
      .from("ponavljajuce_fakture")
      .update({
        sljedeci_datum: sljedeci,
        zadnji_faktura_id: faktura.id,
        broj_generisanih: brojGenerisanih,
        aktivan: !(istekMax || istekDatum),
      })
      .eq("id", r.id);

    if (r.posalji_email) {
      try {
        const { posaljiDokumentEmail } = await import(
          "@/lib/email/posaljiDokumentEmail"
        );
        const { fetchFakturaSaStavkama } = await import("@/lib/fakture");
        const { buildDokumentModel } = await import("@/lib/dokument/dokumentModel");
        const payload = await fetchFakturaSaStavkama(
          supabase,
          faktura.id,
          r.firma_id
        );
        if (payload) {
          const { data: firma } = await supabase
            .from("firma")
            .select("*")
            .eq("id", r.firma_id)
            .maybeSingle();
          const { data: racuni } = await supabase
            .from("bankovni_racuni")
            .select("*")
            .eq("firma_id", r.firma_id)
            .order("je_podrazumevani", { ascending: false });
          const model = buildDokumentModel(payload, {
            firma: firma ?? null,
            racuni: racuni ?? [],
          });
          const sent = await posaljiDokumentEmail(model);
          if (sent.ok) poslato += 1;
        }
      } catch (e) {
        console.error("[cron ponavljajuce] email", r.id, e);
      }
    }

    kreirano += 1;
  }

  return NextResponse.json({ kreirano, greske, poslato });
}
