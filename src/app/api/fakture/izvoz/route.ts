import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { fetchFaktureZaIzvoz } from "@/lib/fakture.server";
import { parseFaktureParams } from "@/lib/faktureFilter";
import { TIP_DOKUMENTA_META } from "@/lib/tipDokumenta";
import type { FakturaStatus } from "@/lib/fakture";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<FakturaStatus, string> = {
  placeno: "Plaćeno",
  na_cekanju: "Na čekanju",
  kasni: "Kasni",
  nacrt: "Nacrt",
};

/** Excel u sr/bs lokalizaciji koristi decimalni zarez, pa je delimiter ';'. */
const DELIMITER = ";";

function csvCelija(vrednost: string): string {
  let v = vrednost;
  // Zaštita od CSV formula injection-a u Excelu
  if (/^[=+\-@]/.test(v)) {
    v = `'${v}`;
  }
  if (v.includes(DELIMITER) || v.includes('"') || v.includes("\n")) {
    v = `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "neautorizovano" }, { status: 401 });
  }

  const url = new URL(request.url);
  const params = parseFaktureParams(
    Object.fromEntries(url.searchParams.entries())
  );

  let fakture;
  try {
    fakture = await fetchFaktureZaIzvoz(supabase, params.filter);
  } catch {
    return NextResponse.json({ error: "greska_pri_izvozu" }, { status: 500 });
  }

  const zaglavlje = [
    "Broj",
    "Tip",
    "Klijent",
    "Email",
    "Datum izdavanja",
    "Rok plaćanja",
    "Iznos",
    "Status",
  ].join(DELIMITER);

  const redovi = fakture.map((f) =>
    [
      csvCelija(f.broj),
      csvCelija(TIP_DOKUMENTA_META[f.tipDokumenta].naziv),
      csvCelija(f.klijentNaziv),
      csvCelija(f.klijentEmail),
      csvCelija(f.datumIzdavanja),
      csvCelija(f.datumPlacanja),
      csvCelija(
        f.iznos.toLocaleString("bs-Latn-BA", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      ),
      csvCelija(STATUS_LABELS[f.status]),
    ].join(DELIMITER)
  );

  // BOM da bi Excel ispravno prikazao dijakritike (UTF-8)
  const csv = `\uFEFF${zaglavlje}\n${redovi.join("\n")}\n`;
  const datum = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dokumenti-${datum}.csv"`,
    },
  });
}
