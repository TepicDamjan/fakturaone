"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  KlijentFormFields,
  type KlijentForma,
  POCETNA_KLIJENT_FORMA,
} from "@/app/components/KlijentFormFields";
import { sacuvajKlijenta } from "@/app/dashboard/klijenti/actions";

export default function NoviKlijent() {
  const router = useRouter();
  const [forma, setForma] = useState<KlijentForma>(POCETNA_KLIJENT_FORMA);
  const [greska, setGreska] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (polje: keyof KlijentForma, vrednost: string) => {
    setForma((prev) => ({ ...prev, [polje]: vrednost }));
    setGreska(null);
  };

  const handlePonisti = () => {
    setForma(POCETNA_KLIJENT_FORMA);
    setGreska(null);
    router.push("/dashboard/klijenti");
  };

  const handleSacuvaj = (e: FormEvent) => {
    e.preventDefault();
    setGreska(null);
    startTransition(async () => {
      const rez = await sacuvajKlijenta(forma);
      if (rez.ok) {
        router.push("/dashboard/klijenti");
        return;
      }
      setGreska(rez.error);
    });
  };

  return (
    <form onSubmit={handleSacuvaj} className="flex flex-col min-h-full">
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/klijenti"
            aria-label="Nazad na klijente"
            className="text-[#0F172A] hover:text-fplava transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-fcrna">Novi klijent</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePonisti}
            className="text-sm font-medium text-[#64748B] hover:text-fcrna px-3 py-2 transition-colors"
          >
            Poništi
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="bg-fplava hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? "Čuvanje…" : "Sačuvaj klijenta"}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
        <div className="max-w-6xl mx-auto mb-6">
          {greska ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {greska}
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 max-w-6xl mx-auto">
          <aside className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-fcrna mb-2">Informacije o klijentu</h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Unesite zvanične podatke o pravnom licu ili preduzetniku. Ovi podaci će se direktno
                prikazivati na vašim izlaznim fakturama.
              </p>
            </div>

            <div className="bg-white border border-ftsiva rounded-lg p-4 flex gap-3 shadow-sm">
              <div className="shrink-0 w-9 h-9 rounded-full bg-fplava/10 flex items-center justify-center text-fplava">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-fcrna">Automatska provera</p>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Unesite PIB za automatsko povlačenje podataka iz registra NBS.
                </p>
              </div>
            </div>

            <div className="aspect-square rounded-xl overflow-hidden border border-ftsiva shadow-sm bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#137FEC] relative">
              <div className="absolute inset-0 flex items-end justify-center pb-6 opacity-90">
                <svg
                  width="120"
                  height="160"
                  viewBox="0 0 120 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <polygon points="60,10 100,150 20,150" fill="#1E3A8A" stroke="#93C5FD" strokeWidth="1" />
                  <polygon points="60,10 60,150 100,150" fill="#0F172A" opacity="0.55" />
                  <line x1="40" y1="60" x2="80" y2="60" stroke="#60A5FA" strokeWidth="0.5" opacity="0.6" />
                  <line x1="35" y1="80" x2="85" y2="80" stroke="#60A5FA" strokeWidth="0.5" opacity="0.6" />
                  <line x1="30" y1="100" x2="90" y2="100" stroke="#60A5FA" strokeWidth="0.5" opacity="0.6" />
                  <line x1="25" y1="120" x2="95" y2="120" stroke="#60A5FA" strokeWidth="0.5" opacity="0.6" />
                </svg>
              </div>
            </div>
          </aside>

          <KlijentFormFields
            forma={forma}
            onChange={handleChange}
            onPopuniFormu={(nova) => {
              setForma(nova);
              setGreska(null);
            }}
          />
        </div>
      </main>

      <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="pointer-events-auto bg-[#0F172A] text-white text-sm font-medium rounded-full shadow-lg pl-3 pr-5 py-2 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Kliknite „Sačuvaj klijenta” da bi podaci bili upisani u bazu.
        </div>
      </div>
    </form>
  );
}
