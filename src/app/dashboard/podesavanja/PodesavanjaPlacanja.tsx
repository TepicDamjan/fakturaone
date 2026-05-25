"use client";

import { useMemo, useState } from "react";

type Props = {
  email: string;
};

type Transakcija = {
  id: string;
  datum: string;
  opis: string;
  iznos: string;
  status: "Plaćeno" | "U obradi" | "Otkazano";
};

function generisiIstoriju(): Transakcija[] {
  const meseci = ["Sep", "Avg", "Jul", "Jun", "Maj", "Apr"];
  const godina = 2024;
  return meseci.map((m, idx) => ({
    id: `tx-${idx}`,
    datum: `15. ${m} ${godina}.`,
    opis: "FakturaOne - Pro Plan (Mesečna pretplata)",
    iznos: "€29.00",
    status: "Plaćeno",
  }));
}

export default function PodesavanjaPlacanja({ email }: Props) {
  const sveTransakcije = useMemo(() => generisiIstoriju(), []);
  const [prikaziSve, setPrikaziSve] = useState(false);

  const transakcije = prikaziSve ? sveTransakcije : sveTransakcije.slice(0, 3);

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
            Aktivna pretplata
          </span>
          <h2 className="mt-3 text-2xl font-bold text-fcrna">Pro Plan</h2>
          <p className="text-sm text-[#64748B] mt-1 max-w-md">
            Vaš nalog je na profesionalnom nivou. Uživajte u neograničenom broju faktura, timskoj
            saradnji i naprednoj analitici.
          </p>

          <dl className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <dt className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Cena</dt>
              <dd className="text-fcrna font-bold mt-1">€29.00 / mesečno</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                Sledeća naplata
              </dt>
              <dd className="text-fcrna font-bold mt-1">15. Oktobar 2024.</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Status</dt>
              <dd className="text-emerald-600 font-bold mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Aktivan
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              className="bg-fplava hover:bg-blue-600 text-white text-sm font-semibold py-2.5 px-5 rounded-lg shadow-sm transition-colors"
            >
              Nadogradi plan
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-fcrna bg-white border border-ftsiva hover:bg-fsiva py-2.5 px-5 rounded-lg transition-colors"
            >
              Prikaži detalje
            </button>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-fcrna">Metode plaćanja</h3>
            <button
              type="button"
              className="text-sm font-semibold text-fplava hover:text-blue-700"
            >
              Izmeni
            </button>
          </div>

          <div className="rounded-xl p-4 text-white relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1e3a5f] shadow-md">
            <div className="flex items-center justify-between">
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-hidden>
                <path
                  d="M3 10c0-3 1-5 3-6m0 12c-2-1-3-3-3-6zm6-6c2 1 3 3 3 6m-3 6c2-1 3-3 3-6"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="w-8 h-5 rounded-sm bg-amber-300/80 border border-amber-200/60" />
            </div>
            <p className="font-mono tracking-widest text-base mt-6">**** **** **** 1234</p>
            <div className="flex items-center justify-between mt-4 text-xs">
              <div>
                <p className="text-white/60">VLASNIK</p>
                <p className="font-semibold">MARKO MARKOVIĆ</p>
              </div>
              <div className="text-right">
                <p className="text-white/60">ISTIČE</p>
                <p className="font-semibold">12/26</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-ftsiva text-sm font-semibold text-[#64748B] hover:text-fcrna hover:border-gray-300 py-2.5 transition-colors"
          >
            <span className="text-lg leading-none">+</span> Dodaj novu karticu
          </button>
        </section>
      </div>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-fcrna">Istorija računa</h3>
            <p className="text-sm text-[#64748B] mt-0.5">
              Pregledajte i preuzmite sve vaše prethodne uplate.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-ftsiva bg-white px-4 py-2 text-sm font-semibold text-fcrna hover:bg-fsiva transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Filteri
          </button>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="bg-fsiva/60 border-b border-gray-100">
                <th className="px-6 py-3 text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Opis
                </th>
                <th className="px-6 py-3 text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Iznos
                </th>
                <th className="px-6 py-3 text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-bold text-[#94A3B8] uppercase tracking-wider text-right">
                  Akcija
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transakcije.map((t) => (
                <tr key={t.id} className="hover:bg-fsiva/40 transition-colors">
                  <td className="px-6 py-4 text-[#64748B] whitespace-nowrap">{t.datum}</td>
                  <td className="px-6 py-4 text-fcrna">{t.opis}</td>
                  <td className="px-6 py-4 font-bold text-fcrna whitespace-nowrap">{t.iznos}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      aria-label="Preuzmi račun"
                      className="text-fplava hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-6 py-4 text-center">
          <button
            type="button"
            onClick={() => setPrikaziSve((v) => !v)}
            className="text-sm font-semibold text-fplava hover:text-blue-700"
          >
            {prikaziSve ? "Prikaži manje" : "Prikaži sve transakcije"}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-red-200 bg-red-50/70 p-5 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-fcrna">Otkaži pretplatu</p>
            <p className="text-sm text-[#64748B] mt-1">
              Otkazivanjem gubite pristup naprednim funkcijama na kraju perioda naplate.
            </p>
            <button
              type="button"
              className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Otkaži moj nalog
            </button>
          </div>
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
              Trenutno šaljemo račune na <span className="font-medium text-fcrna">{email}</span>
            </p>
            <button
              type="button"
              className="mt-2 text-sm font-semibold text-fplava hover:text-blue-700"
            >
              Promeni email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
