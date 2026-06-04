import FeatureDashboardCard from "@/app/components/FeatureCardDashboard";
import {
  formatIzvjestajIznos,
  type IzvjestajKpi,
} from "@/lib/izvjestaji";

type Props = {
  kpi: IzvjestajKpi;
  valuta: string;
};

export default function IzvjestajiKpi({ kpi, valuta }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 w-full">
      <FeatureDashboardCard
        title={formatIzvjestajIznos(kpi.placeno, valuta)}
        description="Naplaćeno (plaćeno)"
        icon={
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-lg font-bold">
            ✓
          </span>
        }
      />
      <FeatureDashboardCard
        title={formatIzvjestajIznos(kpi.fakturisano, valuta)}
        description="Fakturisano u periodu"
        icon={
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#137FEC] text-lg font-bold">
            Σ
          </span>
        }
      />
      <FeatureDashboardCard
        title={formatIzvjestajIznos(kpi.naCekanju, valuta)}
        description="Na čekanju"
        icon={
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 text-lg font-bold">
            …
          </span>
        }
      />
      <FeatureDashboardCard
        title={formatIzvjestajIznos(kpi.kasni, valuta)}
        description="Kasni"
        icon={
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 text-lg font-bold">
            !
          </span>
        }
      />
    </div>
  );
}
