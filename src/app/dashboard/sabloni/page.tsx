import Link from "next/link";
import DashboardHeader from "@/app/components/DashboardHeader";
import { ucitajSabloneList } from "@/app/dashboard/sabloni/actions";
import SabloniLista from "@/app/dashboard/sabloni/SabloniLista";
import { TIP_DOKUMENTA_META } from "@/lib/tipDokumenta";

export default async function SabloniPage() {
  let sabloni: Awaited<ReturnType<typeof ucitajSabloneList>> = [];
  try {
    sabloni = await ucitajSabloneList();
  } catch {
    sabloni = [];
  }

  return (
    <>
      <DashboardHeader
        title="Šabloni"
        subtitle="Sačuvajte česte dokumente i koristite ih jednim klikom"
        rightContent={
          <Link
            href="/dashboard/sabloni/novi"
            className="bg-[#137FEC] hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors shadow-sm"
          >
            Novi šablon
          </Link>
        }
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
        {sabloni.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <p className="text-fcrna font-medium">Nema šablona</p>
            <p className="text-sm text-[#64748B] mt-1">
              Kreirajte šablon za ponavljajuće usluge (npr. mjesečni najam).
            </p>
            <Link
              href="/dashboard/sabloni/novi"
              className="inline-flex mt-4 text-sm font-semibold text-fplava hover:underline"
            >
              Kreiraj prvi šablon
            </Link>
          </div>
        ) : (
          <SabloniLista
            sabloni={sabloni.map((s) => ({
              ...s,
              tipNaziv: TIP_DOKUMENTA_META[s.tipDokumenta].naziv,
            }))}
          />
        )}
      </main>
    </>
  );
}
