import Link from "next/link";
import DashboardHeader from "@/app/components/DashboardHeader";
import FeatureDashboardCard from "@/app/components/FeatureCardDashboard";
import Table, { type Invoice } from "@/app/components/Table";
import {
  fetchFaktureLista,
  initialsFromName,
  type FakturaListItem,
  type FakturaStatus,
} from "@/lib/fakture";
import { fetchKlijentiList } from "@/lib/klijenti";
import { createClient } from "@/utils/supabase/server";

const STATUS_LABEL: Record<FakturaStatus, Invoice["status"]> = {
  placeno: "Plaćeno",
  na_cekanju: "Na čekanju",
  kasni: "Kasni",
  nacrt: "Nacrt",
};

function formatDashboardDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("bs-Latn-BA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fakturaToInvoice(f: FakturaListItem): Invoice {
  return {
    id: f.id,
    displayBroj: `#${f.broj}`,
    broj: f.broj,
    clientEmail: f.klijentEmail,
    clientInitials: initialsFromName(f.klijentNaziv || "?"),
    clientName: f.klijentNaziv || "—",
    date: formatDashboardDate(f.datumIzdavanja),
    amount: `${Math.round(f.iznos).toLocaleString("bs-Latn-BA")} BAM`,
    status: STATUS_LABEL[f.status],
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

  const ukupnoTekst = `${Math.round(ukupnoFakturisano).toLocaleString("bs-Latn-BA")} BAM`;

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
            <Link
              href="/dashboard/fakture/novafakturaforma"
              className="bg-[#137FEC] hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 sm:px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="hidden sm:inline">Kreiraj novu fakturu</span>
              <span className="sm:hidden">Nova faktura</span>
            </Link>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
          <FeatureDashboardCard
            title={ukupnoTekst}
            description="Ukupno fakturisano (sve fakture)"
            icon={
              <svg
                width="46"
                height="40"
                viewBox="0 0 46 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <rect width="46" height="40" rx="8" fill="#EFF6FF" />
                <path
                  d="M25 21C24.1667 21 23.4583 20.7083 22.875 20.125C22.2917 19.5417 22 18.8333 22 18C22 17.1667 22.2917 16.4583 22.875 15.875C23.4583 15.2917 24.1667 15 25 15C25.8333 15 26.5417 15.2917 27.125 15.875C27.7083 16.4583 28 17.1667 28 18C28 18.8333 27.7083 19.5417 27.125 20.125C26.5417 20.7083 25.8333 21 25 21ZM18 24C17.45 24 16.9792 23.8042 16.5875 23.4125C16.1958 23.0208 16 22.55 16 22V14C16 13.45 16.1958 12.9792 16.5875 12.5875C16.9792 12.1958 17.45 12 18 12H32C32.55 12 33.0208 12.1958 33.4125 12.5875C33.8042 12.9792 34 13.45 34 14V22C34 22.55 33.8042 23.0208 33.4125 23.4125C33.0208 23.8042 32.55 24 32 24H18ZM20 22H30C30 21.45 30.1958 20.9792 30.5875 20.5875C30.9792 20.1958 31.45 20 32 20V16C31.45 16 30.9792 15.8042 30.5875 15.4125C30.1958 15.0208 30 14.55 30 14H20C20 14.55 19.8042 15.0208 19.4125 15.4125C19.0208 15.8042 18.55 16 18 16V20C18.55 20 19.0208 20.1958 19.4125 20.5875C19.8042 20.9792 20 21.45 20 22ZM31 28H14C13.45 28 12.9792 27.8042 12.5875 27.4125C12.1958 27.0208 12 26.55 12 26V15H14V26H31V28ZM18 22V14V22Z"
                  fill="#137FEC"
                />
              </svg>
            }
          />
          <FeatureDashboardCard
            title={String(brojPlacenih)}
            description="Plaćene fakture"
            icon={
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <rect width="40" height="40" rx="20" fill="#DCFCE7" />
                <path
                  d="M17.5501 26.0125L11.8501 20.3125L13.2751 18.8875L17.5501 23.1625L26.7251 13.9875L28.1501 15.4125L17.5501 26.0125V26.0125"
                  fill="#16A34A"
                />
              </svg>
            }
          />
          <FeatureDashboardCard
            title={String(brojKasnih)}
            description="Fakture koje kasne"
            icon={
              <svg
                width="46"
                height="43"
                viewBox="0 0 46 43"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <rect width="46" height="43" rx="8" fill="#FEF2F2" />
                <path
                  d="M12 31L23 12L34 31H12ZM15.45 29H30.55L23 16L15.45 29ZM23 28C23.2833 28 23.5208 27.9042 23.7125 27.7125C23.9042 27.5208 24 27.2833 24 27C24 26.7167 23.9042 26.4792 23.7125 26.2875C23.5208 26.0958 23.2833 26 23 26C22.7167 26 22.4792 26.0958 22.2875 26.2875C22.0958 26.4792 22 26.7167 22 27C22 27.2833 22.0958 27.5208 22.2875 27.7125C22.4792 27.9042 22.7167 28 23 28ZM22 25H24V20H22V25Z"
                  fill="#DC2626"
                />
              </svg>
            }
          />
        </div>

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
