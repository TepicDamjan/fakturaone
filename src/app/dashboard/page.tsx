import Link from "next/link";
import DashboardHeader from "@/app/components/DashboardHeader";
import DashboardStatKartice from "@/app/components/DashboardStatKartice";
import type { DashboardFakturaRow } from "@/app/components/DashboardFaktureModal";
import KreirajDokumentDugme from "@/app/components/KreirajDokumentDugme";
import Table, { type Invoice } from "@/app/components/Table";
import {
  initialsFromName,
  type FakturaListItem,
  type FakturaStatus,
} from "@/lib/fakture";
import { formatDatumKratki, formatIznosCijeli } from "@/lib/dokument/format";
import { fetchFaktureLista } from "@/lib/fakture.server";
import { fetchKlijentiList } from "@/lib/klijenti.server";
import { createClient } from "@/utils/supabase/server";

const STATUS_LABEL: Record<FakturaStatus, Invoice["status"]> = {
  placeno: "Plaćeno",
  na_cekanju: "Na čekanju",
  kasni: "Kasni",
  nacrt: "Nacrt",
};

function fakturaToInvoice(f: FakturaListItem): Invoice {
  const djelimicno =
    f.tipDokumenta === "faktura" &&
    f.placenoIznos > 0 &&
    f.status !== "placeno";
  return {
    id: f.id,
    displayBroj: `#${f.broj}`,
    broj: f.broj,
    tipDokumenta: f.tipDokumenta,
    clientEmail: f.klijentEmail,
    clientInitials: initialsFromName(f.klijentNaziv || "?"),
    clientName: f.klijentNaziv || "—",
    date: formatDatumKratki(f.datumIzdavanja),
    amount: `${formatIznosCijeli(f.iznos)} BAM`,
    status: djelimicno ? "Djelimično" : STATUS_LABEL[f.status],
    iznos: f.iznos,
    placenoIznos: f.placenoIznos,
    statusKod: f.status,
  };
}

export default async function Dashboard() {
  const supabase = await createClient();

  let fakture: FakturaListItem[] = [];
  let klijentCount = 0;
  try {
    fakture = await fetchFaktureLista(supabase);
  } catch {
    fakture = [];
  }
  try {
    const klijenti = await fetchKlijentiList(supabase);
    klijentCount = klijenti.length;
  } catch {
    klijentCount = 0;
  }

  const ukupnoFakturisano = fakture.reduce((s, f) => s + f.iznos, 0);
  const brojPlacenih = fakture.filter((f) => f.status === "placeno").length;
  const brojKasnih = fakture.filter((f) => f.status === "kasni").length;
  const brojFaktura = fakture.length;

  const nedavne = fakture.slice(0, 5).map(fakturaToInvoice);
  const footerSummary =
    brojFaktura === 0
      ? "Nema faktura za prikaz."
      : `Lista prikazuje ${nedavne.length} od ukupno ${brojFaktura} faktura.`;

  const ukupnoTekst = `${formatIznosCijeli(ukupnoFakturisano)} BAM`;

  const faktureZaModal: DashboardFakturaRow[] = fakture.map((f) => ({
    id: f.id,
    broj: f.broj,
    klijentNaziv: f.klijentNaziv,
    klijentEmail: f.klijentEmail,
    datumIzdavanja: f.datumIzdavanja,
    datumPlacanja: f.datumPlacanja,
    iznos: f.iznos,
    status: f.status,
  }));

  return (
    <>
      <DashboardHeader
        title="Komandna tabla"
        subtitle="Pregled vašeg poslovanja i najnovijih aktivnosti"
        rightContent={
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/klijenti/novi"
              className="text-sm font-medium text-[#64748B] hover:text-fcrna px-3 py-2 transition-colors hidden sm:inline-flex"
            >
              Novi klijent
            </Link>
            <KreirajDokumentDugme />
          </div>
        }
      />

      <main className="flex-1 p-6 sm:p-8 overflow-y-auto w-full max-w-[1600px] mx-auto">
        <p className="text-sm text-[#64748B] mb-6">
          Broj faktura:{" "}
          <span className="font-semibold text-fcrna">{brojFaktura}</span>
          <span className="mx-2 text-ftsiva">·</span>
          Broj klijenata:{" "}
          <span className="font-semibold text-fcrna">{klijentCount}</span>
        </p>

        <DashboardStatKartice
          ukupnoTekst={ukupnoTekst}
          brojPlacenih={brojPlacenih}
          brojKasnih={brojKasnih}
          fakture={faktureZaModal}
        />

        <div className="flex flex-col mt-8 w-full">
          <div className="flex flex-row flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-fcrna">
              Nedavne fakture
            </h2>
            <Link
              href="/dashboard/fakture"
              className="text-sm font-semibold text-fplava hover:text-blue-700 transition-colors"
            >
              Pogledaj sve
            </Link>
          </div>

          <Table invoices={nedavne} footerSummary={footerSummary} />
        </div>
      </main>
    </>
  );
}
