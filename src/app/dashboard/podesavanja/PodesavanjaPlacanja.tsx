"use client";

import Link from "next/link";
import type { PretplataPregled } from "@/lib/pretplata.types";
import { PLAN_DEFS } from "@/lib/plans";
import { formatDatumDugi } from "@/lib/dokument/format";

type Props = {
  email: string;
  pretplata: PretplataPregled;
};

function statusLabel(pretplata: PretplataPregled): { text: string; active: boolean } {
  if (pretplata.isTrial) {
    return { text: "Probni period", active: true };
  }
  switch (pretplata.status) {
    case "active":
      return { text: "Aktivan", active: true };
    case "past_due":
      return { text: "Neplaćeno", active: false };
    case "canceled":
      return { text: "Otkazano", active: false };
    case "expired":
      return { text: "Istekao", active: false };
    default:
      return { text: "Besplatan", active: pretplata.tier !== "starter" };
  }
}

export default function PodesavanjaPlacanja({ email, pretplata }: Props) {
  const planDef = PLAN_DEFS[pretplata.tier];
  const status = statusLabel(pretplata);
  const cenaTekst =
    planDef.cenaMesecno != null ? `€${planDef.cenaMesecno.toFixed(2)} / mesečno` : "Po dogovoru";

  const sledecaNaplata = pretplata.isTrial
    ? pretplata.trialEndsAt
    : pretplata.currentPeriodEnd;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute top-6 right-6 w-24 h-24 sm:w-28 sm:h-28 opacity-90 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="none" aria-hidden>
              <path
                d="M50 5l8 12 14 1-3 14 11 9-9 11 4 14-14-1-7 12-7-12-14 1 4-14-9-11 11-9-3-14 14-1z"
                fill="#DBEAFE"
              />
              <path
                d="M40 50l7 7 15-15"
                stroke="#137FEC"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-fplava text-xs font-semibold">
            {pretplata.isTrial ? "Probni period" : "Aktivna pretplata"}
          </span>
          <h2 className="mt-3 text-2xl font-bold text-fcrna">{planDef.naziv}</h2>
          <p className="text-sm text-[#64748B] mt-1 max-w-md">{planDef.opis}</p>

          <dl className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <dt className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Cena</dt>
              <dd className="text-fcrna font-bold mt-1">{cenaTekst}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                {pretplata.isTrial ? "Probni period do" : "Sledeća naplata"}
              </dt>
              <dd className="text-fcrna font-bold mt-1">{formatDatumDugi(sledecaNaplata)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Status</dt>
              <dd
                className={`font-bold mt-1 flex items-center gap-1.5 ${
                  status.active ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    status.active ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                {status.text}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/dashboard/nadogradi"
              className="bg-fplava hover:bg-blue-600 text-white text-sm font-semibold py-2.5 px-5 rounded-lg shadow-sm transition-colors"
            >
              {pretplata.tier === "starter" || pretplata.isTrial
                ? "Nadogradi plan"
                : "Promeni plan"}
            </Link>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-fcrna mb-4">Potrošnja ovog meseca</h3>
          <ul className="space-y-4 text-sm">
            <li>
              <div className="flex justify-between text-[#64748B] mb-1">
                <span>Dokumenti</span>
                <span className="font-semibold text-fcrna">
                  {pretplata.usage.dokumentiMesecno}
                  {Number.isFinite(pretplata.limits.dokumentiMesecno)
                    ? ` / ${pretplata.limits.dokumentiMesecno}`
                    : ""}
                </span>
              </div>
              {Number.isFinite(pretplata.limits.dokumentiMesecno) ? (
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-fplava rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (pretplata.usage.dokumentiMesecno / pretplata.limits.dokumentiMesecno) * 100
                      )}%`,
                    }}
                  />
                </div>
              ) : null}
            </li>
            <li className="flex justify-between text-[#64748B]">
              <span>Klijenti</span>
              <span className="font-semibold text-fcrna">
                {pretplata.usage.klijenti}
                {Number.isFinite(pretplata.limits.klijenti)
                  ? ` / ${pretplata.limits.klijenti}`
                  : ""}
              </span>
            </li>
            <li className="flex justify-between text-[#64748B]">
              <span>Preduzeća</span>
              <span className="font-semibold text-fcrna">
                {pretplata.usage.firme}
                {Number.isFinite(pretplata.limits.firme)
                  ? ` / ${pretplata.limits.firme}`
                  : ""}
              </span>
            </li>
          </ul>
        </section>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-fsiva flex items-center justify-center text-fcrna shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-fcrna">Email za račune</p>
          <p className="text-sm text-[#64748B] mt-1 truncate">
            Računi će stizati na <span className="font-medium text-fcrna">{email}</span>
          </p>
          <p className="text-xs text-[#94A3B8] mt-2">
            Plaćanje i fakture obrađuje Freemius. Upravljajte planom na stranici{" "}
            <Link href="/dashboard/nadogradi" className="font-semibold text-fplava hover:text-blue-700">
              Planovi i pretplata
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
