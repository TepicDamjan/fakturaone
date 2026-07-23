import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { posaljiPodsjetnikPlacanjaEmail } from "@/lib/email/posaljiPodsjetnikEmail";
import { izracunajUkupanIznos, zaokruziNovac } from "@/lib/dokument/format";
import { fetchPretplataPregled } from "@/lib/pretplata.server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function danasISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dodajDane(iso: string, dana: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dana);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Vercel Cron: šalje email podsjetnike za neplaćene fakture
 * (N dana prije dospijeća + dospjeli).
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron podsjetnici] CRON_SECRET nije podešen.");
    return NextResponse.json({ error: "nije_podeseno" }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "neautorizovano" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const danas = danasISO();

  const { data: firme, error: firmeErr } = await supabase
    .from("firma")
    .select(
      "id, user_id, naziv, email, valuta, podsjetnici_ukljuceni, podsjetnik_dana_prije"
    )
    .eq("podsjetnici_ukljuceni", true);

  if (firmeErr) {
    console.error("[cron podsjetnici] firme", firmeErr);
    return NextResponse.json({ error: firmeErr.message }, { status: 500 });
  }

  let poslato = 0;
  let greske = 0;
  let preskoceno = 0;

  for (const firma of firme ?? []) {
    const pregled = await fetchPretplataPregled(supabase, firma.user_id);
    if (!pregled.limits.emailSlanje) {
      continue;
    }

    const danaPrije = Math.min(
      30,
      Math.max(0, Number(firma.podsjetnik_dana_prije ?? 3))
    );
    const ciljPrije = dodajDane(danas, danaPrije);

    const { data: fakture, error: fErr } = await supabase
      .from("fakture")
      .select(
        "id, broj, datum_placanja, status, placeno_iznos, pdv_procenat, popust, posljednji_podsjetnik_at, posljednji_podsjetnik_vrsta, klijent_id"
      )
      .eq("firma_id", firma.id)
      .eq("tip_dokumenta", "faktura")
      .in("status", ["na_cekanju", "kasni"])
      .not("klijent_id", "is", null)
      .not("datum_placanja", "is", null);

    if (fErr) {
      console.error("[cron podsjetnici] fakture", firma.id, fErr);
      greske += 1;
      continue;
    }

    for (const f of fakture ?? []) {
      const datumPlacanja = f.datum_placanja as string;
      let vrsta: "prije" | "dospjelo" | null = null;

      if (datumPlacanja < danas) {
        // Dospjelo: podsjetnik najviše jednom u 7 dana
        const last = f.posljednji_podsjetnik_at
          ? new Date(f.posljednji_podsjetnik_at).getTime()
          : 0;
        const sedamDanaMs = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - last >= sedamDanaMs) {
          vrsta = "dospjelo";
        }
      } else if (danaPrije > 0 && datumPlacanja === ciljPrije) {
        if (f.posljednji_podsjetnik_vrsta !== "prije") {
          vrsta = "prije";
        }
      }

      if (!vrsta) {
        continue;
      }

      const { data: klijent } = await supabase
        .from("klijenti")
        .select("naziv, email")
        .eq("id", f.klijent_id as string)
        .maybeSingle();

      const email = klijent?.email?.trim();
      if (!email) {
        preskoceno += 1;
        continue;
      }

      const { data: stavke } = await supabase
        .from("stavke_fakture")
        .select("kolicina, cena")
        .eq("faktura_id", f.id);

      const ukupno = izracunajUkupanIznos(
        stavke ?? [],
        Number(f.pdv_procenat),
        Number(f.popust)
      );
      const placeno = zaokruziNovac(Number(f.placeno_iznos ?? 0));
      const preostalo = zaokruziNovac(Math.max(0, ukupno - placeno));
      if (preostalo <= 0.001) {
        continue;
      }

      const rez = await posaljiPodsjetnikPlacanjaEmail({
        to: email,
        replyTo: firma.email?.trim() || undefined,
        firmaNaziv: firma.naziv || "Firma",
        klijentNaziv: klijent?.naziv?.trim() || "poštovani klijent",
        brojFakture: f.broj,
        iznos: ukupno,
        valuta: firma.valuta || "BAM",
        datumPlacanja,
        preostalo,
        vrsta,
      });

      if (!rez.ok) {
        console.error("[cron podsjetnici] email", f.id, rez.error);
        greske += 1;
        continue;
      }

      await supabase
        .from("fakture")
        .update({
          posljednji_podsjetnik_at: new Date().toISOString(),
          posljednji_podsjetnik_vrsta: vrsta,
        })
        .eq("id", f.id);

      poslato += 1;
    }
  }

  return NextResponse.json({ poslato, greske, preskoceno });
}
