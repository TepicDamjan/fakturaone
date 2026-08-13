import { NextResponse } from "next/server";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/utils/supabase/server";
import { proveriPristupIzvestajima } from "@/lib/pretplata.server";
import { fetchIzvjestajSnapshot } from "@/lib/izvjestaji.server";
import { formatIznos } from "@/lib/dokument/format";
import { ensurePdfFonts } from "@/lib/pdf/registerFonts";

function csvCell(v: string | number): string {
  const s = String(v).replace(/"/g, '""');
  if (/^[=+\-@]/.test(s)) return `"'${s}"`;
  return `"${s}"`;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Morate biti ulogovani." }, { status: 401 });
  }

  const pristup = await proveriPristupIzvestajima(supabase, user.id);
  if (!pristup.ok) {
    return NextResponse.json(
      { error: "Izvještaji nisu dostupni na vašem planu." },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const period = url.searchParams.get("period");
  const od = url.searchParams.get("od");
  const doo = url.searchParams.get("do");
  const format = url.searchParams.get("format") === "pdf" ? "pdf" : "csv";

  const snapshot = await fetchIzvjestajSnapshot(period, od, doo);

  if (format === "csv") {
    const lines = [
      ["Datum", "Broj", "Klijent", "JIB", "Osnovica", "PDV", "Ukupno"].join(";"),
      ...snapshot.kif.map((r) =>
        [
          csvCell(r.datum),
          csvCell(r.broj),
          csvCell(r.klijent),
          csvCell(r.jib),
          csvCell(formatIznos(r.osnovica)),
          csvCell(formatIznos(r.pdvIznos)),
          csvCell(formatIznos(r.ukupno)),
        ].join(";")
      ),
    ];
    const body = `\uFEFF${lines.join("\n")}`;
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="kif-${snapshot.range.start}.csv"`,
      },
    });
  }

  ensurePdfFonts();
  const styles = StyleSheet.create({
    page: { padding: 36, fontSize: 10, fontFamily: "Roboto" },
    title: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
    row: { flexDirection: "row", marginBottom: 3, gap: 6 },
    cell: { flex: 1 },
  });

  const Pdf = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Izvještaj — {snapshot.range.label}</Text>
        <Text>
          Fakturisano: {formatIznos(snapshot.kpi.fakturisano)} {snapshot.valuta}
        </Text>
        <Text>
          Naplaćeno: {formatIznos(snapshot.kpi.placeno)} {snapshot.valuta}
        </Text>
        <Text style={{ marginTop: 12, fontWeight: 700 }}>KIF</Text>
        {snapshot.kif.map((r) => (
          <View key={r.id} style={styles.row}>
            <Text style={styles.cell}>{r.datum}</Text>
            <Text style={styles.cell}>{r.broj}</Text>
            <Text style={styles.cell}>{r.klijent}</Text>
            <Text style={styles.cell}>
              {formatIznos(r.ukupno)} {snapshot.valuta}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(Pdf);
  return new NextResponse(new Uint8Array(Buffer.from(buffer)), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="izvjestaj-${snapshot.range.start}.pdf"`,
    },
  });
}
