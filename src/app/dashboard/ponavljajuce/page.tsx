import Link from "next/link";
import DashboardHeader from "@/app/components/DashboardHeader";
import { ucitajPonavljajuceList } from "@/app/dashboard/sabloni/actions";
import PonavljajuceLista from "@/app/dashboard/ponavljajuce/PonavljajuceLista";
import { FREKVENCIJE } from "@/lib/sabloni";

export default async function PonavljajucePage() {
  let items: Awaited<ReturnType<typeof ucitajPonavljajuceList>> = [];
  try {
    items = await ucitajPonavljajuceList();
  } catch {
    items = [];
  }

  const frekLabel = Object.fromEntries(FREKVENCIJE.map((f) => [f.id, f.label]));

  return (
    <>
      <DashboardHeader
        title="Ponavljajuće fakture"
        subtitle="Automatsko izdavanje (cron svaki dan u 06:30 UTC)"
        rightContent={
          <Link
            href="/dashboard/ponavljajuce/nova"
            className="bg-[#137FEC] hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors shadow-sm"
          >
            Nova ponavljajuća
          </Link>
        }
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <p className="text-fcrna font-medium">Nema rasporeda</p>
            <p className="text-sm text-[#64748B] mt-1">
              Postavite mjesečni najam, pretplatu ili održavanje — faktura se kreira sama.
            </p>
            <Link
              href="/dashboard/ponavljajuce/nova"
              className="inline-flex mt-4 text-sm font-semibold text-fplava hover:underline"
            >
              Kreiraj raspored
            </Link>
          </div>
        ) : (
          <PonavljajuceLista
            items={items.map((i) => ({
              ...i,
              frekvencijaLabel: frekLabel[i.frekvencija] ?? i.frekvencija,
            }))}
          />
        )}
      </main>
    </>
  );
}
