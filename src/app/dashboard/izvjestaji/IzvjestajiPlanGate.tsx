import Link from "next/link";
import type { PretplataPregled } from "@/lib/pretplata.types";

type Props = {
  pretplata: PretplataPregled;
};

export default function IzvjestajiPlanGate({ pretplata }: Props) {
  return (
    <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
      <div className="max-w-md w-full text-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-fplava mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M18 20V10M12 20V4M6 20v-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-fcrna">Izveštaji nisu dostupni</h2>
        <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
          Napredni finansijski izveštaji dostupni su na{" "}
          <span className="font-semibold text-fcrna">Professional</span> planu i višim paketima.
          Trenutno koristite <span className="font-semibold text-fcrna">{pretplata.tierLabel}</span>{" "}
          plan.
        </p>
        <Link
          href="/dashboard/nadogradi"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-fplava px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
        >
          Nadogradi plan
        </Link>
      </div>
    </div>
  );
}
