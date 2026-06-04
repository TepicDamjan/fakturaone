import DashboardHeader from "@/app/components/DashboardHeader";
import IzvjestajiFilter from "@/app/dashboard/izvjestaji/IzvjestajiFilter";
import IzvjestajiKpi from "@/app/dashboard/izvjestaji/IzvjestajiKpi";
import IzvjestajiNeplacene from "@/app/dashboard/izvjestaji/IzvjestajiNeplacene";
import IzvjestajiPrihodChart from "@/app/dashboard/izvjestaji/IzvjestajiPrihodChart";
import IzvjestajiTopKlijenti from "@/app/dashboard/izvjestaji/IzvjestajiTopKlijenti";
import { fetchIzvjestajSnapshot } from "@/lib/izvjestaji.server";
import { parseIzvjestajPeriod } from "@/lib/izvjestaji";

type PageProps = {
  searchParams: Promise<{ period?: string }>;
};

export default async function IzvjestajiPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const period = parseIzvjestajPeriod(sp.period);
  const snapshot = await fetchIzvjestajSnapshot(sp.period);

  return (
    <>
      <DashboardHeader
        title="Izveštaji"
        subtitle="Finansijski pregled fakturisanja i naplate"
      />

      <main className="flex-1 p-6 sm:p-8 overflow-y-auto w-full max-w-[1600px] mx-auto">
        <IzvjestajiFilter
          aktivni={period}
          periodLabel={snapshot.range.label}
        />

        <IzvjestajiKpi kpi={snapshot.kpi} valuta={snapshot.valuta} />

        <p className="text-sm text-[#64748B] mt-6 mb-4">
          Broj faktura u periodu:{" "}
          <span className="font-semibold text-fcrna">
            {snapshot.kpi.brojFaktura}
          </span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          <div className="lg:col-span-2">
            <IzvjestajiPrihodChart
              poMesecu={snapshot.poMesecu}
              valuta={snapshot.valuta}
            />
          </div>
          <div>
            <IzvjestajiTopKlijenti
              redovi={snapshot.topKlijenti}
              valuta={snapshot.valuta}
            />
          </div>
        </div>

        <div className="mt-8">
          <IzvjestajiNeplacene
            fakture={snapshot.neplacene}
            valuta={snapshot.valuta}
          />
        </div>
      </main>
    </>
  );
}
