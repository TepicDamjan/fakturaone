import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  formatDokumentDatum,
  formatIznos,
} from "@/lib/dokument/format";
import {
  izracunajDokumentIznose,
  type DokumentModel,
} from "@/lib/dokument/dokumentModel";
import { metaZaTip } from "@/lib/tipDokumenta";
import { ensurePdfFonts } from "@/lib/pdf/registerFonts";

ensurePdfFonts();

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    padding: 40,
    color: "#0F172A",
    lineHeight: 1.4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  brandName: { fontSize: 14, fontWeight: 700 },
  brandTag: { fontSize: 9, color: "#64748B", marginTop: 2 },
  docTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#CBD5E1",
    textTransform: "uppercase",
  },
  docBroj: { fontSize: 11, fontWeight: 700, marginTop: 4 },
  docDatum: { fontSize: 9, color: "#64748B", marginTop: 2 },
  cols: { flexDirection: "row", gap: 24, marginBottom: 20 },
  col: { flex: 1 },
  label: {
    fontSize: 8,
    fontWeight: 700,
    color: "#94A3B8",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  body: { fontSize: 10, color: "#334155" },
  bold: { fontWeight: 700, color: "#0F172A" },
  table: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 16,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableHeadCell: {
    fontSize: 8,
    fontWeight: 700,
    color: "#64748B",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  totals: { marginTop: 8, alignItems: "flex-end" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 4,
  },
  totalLabel: { color: "#64748B", fontSize: 9 },
  totalValue: { fontWeight: 700, fontSize: 9 },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  grandLabel: { fontWeight: 700, fontSize: 10 },
  grandValue: { fontWeight: 700, fontSize: 14, color: "#137FEC" },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    gap: 24,
  },
  footerCol: { flex: 1 },
  note: { fontSize: 9, color: "#64748B" },
  generated: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 8,
    color: "#94A3B8",
  },
  logo: { width: 48, height: 48, marginRight: 10, objectFit: "contain" },
  brandRow: { flexDirection: "row", alignItems: "center", maxWidth: 240 },
});

function StavkeTable({ model }: { model: DokumentModel }) {
  const jeOtpremnica = model.tipDokumenta === "otpremnica";

  if (jeOtpremnica) {
    return (
      <View style={styles.table}>
        <View style={styles.tableHead}>
          <Text style={[styles.tableHeadCell, { width: "55%" }]}>
            Opis robe
          </Text>
          <Text
            style={[
              styles.tableHeadCell,
              { width: "20%", textAlign: "center" },
            ]}
          >
            Jedinica
          </Text>
          <Text
            style={[styles.tableHeadCell, { width: "25%", textAlign: "right" }]}
          >
            Količina
          </Text>
        </View>
        {model.stavke.map((row, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={{ width: "55%" }}>
              <Text style={styles.bold}>{row.naziv}</Text>
              {row.opis ? <Text style={styles.note}>{row.opis}</Text> : null}
            </View>
            <Text style={{ width: "20%", textAlign: "center" }}>
              {row.jedinica}
            </Text>
            <Text style={{ width: "25%", textAlign: "right", fontWeight: 700 }}>
              {row.kolicina}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.table}>
      <View style={styles.tableHead}>
        <Text style={[styles.tableHeadCell, { width: "40%" }]}>Opis</Text>
        <Text
          style={[styles.tableHeadCell, { width: "15%", textAlign: "center" }]}
        >
          Kol.
        </Text>
        <Text
          style={[styles.tableHeadCell, { width: "22%", textAlign: "center" }]}
        >
          Cena
        </Text>
        <Text
          style={[styles.tableHeadCell, { width: "23%", textAlign: "right" }]}
        >
          Ukupno
        </Text>
      </View>
      {model.stavke.map((row, i) => (
        <View key={i} style={styles.tableRow}>
          <View style={{ width: "40%" }}>
            <Text style={styles.bold}>{row.naziv}</Text>
            {row.opis ? <Text style={styles.note}>{row.opis}</Text> : null}
          </View>
          <Text style={{ width: "15%", textAlign: "center" }}>
            {row.kolicina}
          </Text>
          <Text style={{ width: "22%", textAlign: "center" }}>
            {formatIznos(row.cena)}
          </Text>
          <Text style={{ width: "23%", textAlign: "right", fontWeight: 700 }}>
            {formatIznos(row.kolicina * row.cena)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function DokumentPdfDocument({
  model,
  qrDataUrl,
}: {
  model: DokumentModel;
  qrDataUrl?: string | null;
}) {
  const tipMeta = metaZaTip(model.tipDokumenta);
  const { osnovica, pdvIznos, ukupno } = izracunajDokumentIznose(model);
  const jeOtpremnica = model.tipDokumenta === "otpremnica";
  const racun = model.bankovniRacun;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            {model.izdavac.logoUrl ? (
              <Image src={model.izdavac.logoUrl} style={styles.logo} />
            ) : null}
            <View>
              <Text style={styles.brandName}>{model.izdavac.naziv}</Text>
              <Text style={styles.brandTag}>{model.izdavac.tagline}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.docTitle}>{tipMeta.naziv}</Text>
            <Text style={styles.docBroj}>#{model.broj}</Text>
            <Text style={styles.docDatum}>
              {formatDokumentDatum(model.datumIzdavanja)}
            </Text>
          </View>
        </View>

        <View style={styles.cols}>
          <View style={styles.col}>
            <Text style={styles.label}>Izdavalac</Text>
            <Text style={styles.bold}>{model.izdavac.naziv}</Text>
            {model.izdavac.adresa && model.izdavac.adresa !== "—" ? (
              <Text style={styles.body}>{model.izdavac.adresa}</Text>
            ) : null}
            {model.izdavac.pib ? (
              <Text style={styles.body}>PIB: {model.izdavac.pib}</Text>
            ) : null}
            {model.izdavac.email ? (
              <Text style={styles.body}>{model.izdavac.email}</Text>
            ) : null}
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Primalac</Text>
            {model.primalac ? (
              <>
                <Text style={styles.bold}>{model.primalac.naziv}</Text>
                {model.primalac.adresa ? (
                  <Text style={styles.body}>{model.primalac.adresa}</Text>
                ) : null}
                {model.primalac.email ? (
                  <Text style={styles.body}>{model.primalac.email}</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.note}>Klijent nije povezan</Text>
            )}
          </View>
        </View>

        {model.referenca ? (
          <Text style={[styles.body, { marginBottom: 8 }]}>
            Referenca: <Text style={styles.bold}>{model.referenca}</Text>
          </Text>
        ) : null}

        <StavkeTable model={model} />

        {!jeOtpremnica ? (
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Međuzbir</Text>
              <Text style={styles.totalValue}>
                {formatIznos(osnovica)} {model.valuta}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>PDV ({model.pdvProcenat}%)</Text>
              <Text style={styles.totalValue}>
                {formatIznos(pdvIznos)} {model.valuta}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Popust</Text>
              <Text style={styles.totalValue}>
                -{formatIznos(model.popust)} {model.valuta}
              </Text>
            </View>
            <View style={styles.grandTotal}>
              <Text style={styles.grandLabel}>{tipMeta.totalLabel}</Text>
              <Text style={styles.grandValue}>
                {formatIznos(ukupno)} {model.valuta}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.footer}>
          {jeOtpremnica ? (
            <View style={styles.footerCol}>
              <Text style={styles.label}>Detalji isporuke</Text>
              {model.nacinTransporta ? (
                <Text style={styles.body}>Transport: {model.nacinTransporta}</Text>
              ) : null}
              {model.registracijaVozila ? (
                <Text style={styles.body}>Vozilo: {model.registracijaVozila}</Text>
              ) : null}
              {model.vozac ? (
                <Text style={styles.body}>Vozač: {model.vozac}</Text>
              ) : null}
              {model.adresaDostave ? (
                <Text style={styles.body}>Adresa: {model.adresaDostave}</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.footerCol}>
              <Text style={styles.label}>Detalji plaćanja</Text>
              {racun ? (
                <>
                  <Text style={styles.body}>Banka: {racun.naziv_banke}</Text>
                  <Text style={styles.body}>
                    Na ime: {racun.na_ime?.trim() || model.izdavac.naziv}
                  </Text>
                  <Text style={styles.body}>Račun: {racun.broj_racuna}</Text>
                  {racun.swift ? (
                    <Text style={styles.body}>SWIFT: {racun.swift}</Text>
                  ) : null}
                </>
              ) : (
                <Text style={styles.note}>Bankovni račun nije podešen.</Text>
              )}
              <Text style={styles.body}>Poziv na broj: {model.broj}</Text>
              <Text style={[styles.body, { marginTop: 4 }]}>
                {tipMeta.rokLabel}: {formatDokumentDatum(model.datumPlacanja)}
              </Text>
              {qrDataUrl ? (
                <View style={{ marginTop: 10, alignItems: "flex-start" }}>
                  <Image src={qrDataUrl} style={{ width: 72, height: 72 }} />
                  <Text style={[styles.note, { marginTop: 4, fontSize: 8 }]}>
                    Skenirajte za podatke o plaćanju
                  </Text>
                </View>
              ) : null}
            </View>
          )}
          <View style={styles.footerCol}>
            <Text style={styles.label}>Napomena</Text>
            <Text style={styles.note}>{model.napomene}</Text>
          </View>
        </View>

        <Text style={styles.generated}>
          Generisano pomoću {model.izdavac.naziv}
        </Text>
      </Page>
    </Document>
  );
}
