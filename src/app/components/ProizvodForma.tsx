"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JEDINICE } from "@/lib/jedinice";
import { useToast } from "@/app/components/toast/ToastContext";
import type { SacuvajProizvodInput } from "@/app/dashboard/proizvodi/actions";

export type ProizvodFormaVrednosti = {
  naziv: string;
  opis: string;
  jedinica: string;
  cena: string;
};

export const POCETNA_PROIZVOD_FORMA: ProizvodFormaVrednosti = {
  naziv: "",
  opis: "",
  jedinica: "kom",
  cena: "",
};

export default function ProizvodForma({
  naslov,
  pocetneVrednosti = POCETNA_PROIZVOD_FORMA,
  onSacuvaj,
  porukaUspeha,
}: {
  naslov: string;
  pocetneVrednosti?: ProizvodFormaVrednosti;
  onSacuvaj: (
    input: SacuvajProizvodInput
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  porukaUspeha: string;
}) {
  const router = useRouter();
  const { prikaziToast } = useToast();
  const [forma, setForma] = useState<ProizvodFormaVrednosti>(pocetneVrednosti);
  const [greska, setGreska] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (
    polje: keyof ProizvodFormaVrednosti,
    vrednost: string
  ) => {
    setForma((prev) => ({ ...prev, [polje]: vrednost }));
    setGreska(null);
  };

  const handleSacuvaj = (e: FormEvent) => {
    e.preventDefault();
    setGreska(null);
    startTransition(async () => {
      const rez = await onSacuvaj({
        naziv: forma.naziv,
        opis: forma.opis,
        jedinica: forma.jedinica,
        cena: parseFloat(forma.cena) || 0,
      });
      if (rez.ok) {
        prikaziToast({ tip: "uspeh", poruka: porukaUspeha });
        router.push("/dashboard/proizvodi");
        return;
      }
      setGreska(rez.error);
    });
  };

  const inputClass =
    "w-full rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 px-3 py-2.5";

  return (
    <form onSubmit={handleSacuvaj} className="flex flex-col min-h-full">
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/proizvodi"
            aria-label="Nazad na proizvode"
            className="text-[#0F172A] hover:text-fplava transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-fcrna">{naslov}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/proizvodi")}
            className="text-sm font-medium text-[#64748B] hover:text-fcrna px-3 py-2 transition-colors"
          >
            Poništi
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="bg-fplava hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? "Čuvanje…" : "Sačuvaj proizvod"}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
        <div className="max-w-2xl mx-auto space-y-6">
          {greska ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {greska}
            </div>
          ) : null}

          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Naziv *
              </label>
              <input
                type="text"
                required
                value={forma.naziv}
                onChange={(e) => handleChange("naziv", e.target.value)}
                placeholder="Npr. Izrada web sajta"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Opis
              </label>
              <textarea
                value={forma.opis}
                onChange={(e) => handleChange("opis", e.target.value)}
                placeholder="Detaljniji opis proizvoda ili usluge…"
                className={`${inputClass} resize-y min-h-[80px]`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                  Jedinica mere
                </label>
                <select
                  value={forma.jedinica}
                  onChange={(e) => handleChange("jedinica", e.target.value)}
                  className={`${inputClass} cursor-pointer`}
                >
                  {JEDINICE.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                  Cena
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={forma.cena}
                  onChange={(e) => handleChange("cena", e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </form>
  );
}
