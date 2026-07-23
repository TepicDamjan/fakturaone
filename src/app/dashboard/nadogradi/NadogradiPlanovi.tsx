import Link from "next/link";
import type { PretplataPregled } from "@/lib/pretplata.types";
import { PLAN_DEFS, PLANS_ORDER } from "@/lib/plans";
import NadogradiCheckoutDugme from "@/app/dashboard/nadogradi/NadogradiCheckoutDugme";

type Props = {
  trenutniPlan: PretplataPregled["tier"];
  placanjeAktivno: boolean;
};

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="shrink-0 text-fplava" aria-hidden>
      <path
        d="M7.5 12.5L3.5 8.5L4.56 7.44L7.5 10.38L13.44 4.44L14.5 5.5L7.5 12.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function NadogradiPlanovi({ trenutniPlan, placanjeAktivno }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {PLANS_ORDER.map((tier) => {
        const plan = PLAN_DEFS[tier];
        const aktivan = tier === trenutniPlan;
        const istaknuto = plan.istaknuto && !aktivan;
        const mozePlacanje =
          placanjeAktivno && (tier === "professional" || tier === "business");

        return (
          <div
            key={tier}
            className={`relative flex flex-col rounded-xl border p-6 ${
              aktivan
                ? "border-fplava bg-blue-50/50 ring-1 ring-fplava/30"
                : istaknuto
                  ? "border-fplava/40 bg-white shadow-sm"
                  : "border-gray-100 bg-white"
            }`}
          >
            {aktivan ? (
              <span className="absolute -top-2.5 left-4 rounded-full bg-fplava px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Trenutni plan
              </span>
            ) : null}
            {istaknuto ? (
              <span className="absolute -top-2.5 right-4 rounded-full bg-[#0F172A] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Preporučeno
              </span>
            ) : null}

            <h3 className="text-lg font-bold text-fcrna">{plan.naziv}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-fcrna">{plan.cenaTekst}</span>
              {plan.cenaMesecno != null ? (
                <span className="text-sm text-[#64748B]">/mesečno</span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-[#64748B]">{plan.opis}</p>

            <ul className="mt-5 flex flex-1 flex-col gap-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#475569]">
                  <CheckIcon />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              {aktivan ? (
                <span className="inline-flex w-full items-center justify-center rounded-lg border border-fplava/30 bg-white px-4 py-2.5 text-sm font-semibold text-fplava">
                  Aktivan plan
                </span>
              ) : tier === "enterprise" ? (
                <Link
                  href="/#kontakt"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-fcrna hover:bg-fsiva transition-colors"
                >
                  Kontaktirajte nas
                </Link>
              ) : tier === "starter" ? (
                <span className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#64748B]">
                  Besplatan plan
                </span>
              ) : mozePlacanje ? (
                <NadogradiCheckoutDugme
                  planTier={tier}
                  label={`Izaberi ${plan.naziv}`}
                  highlighted={istaknuto}
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-fcrna opacity-60 cursor-not-allowed"
                >
                  Uskoro dostupno
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
