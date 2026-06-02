"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  KlijentFormFields,
  type KlijentForma,
} from "@/app/components/KlijentFormFields";
import { klijentToForma } from "@/lib/klijentForma";
import { azurirajKlijenta } from "@/app/dashboard/klijenti/actions";
import type { Klijent } from "@/lib/klijenti";

type Props = {
  klijent: Klijent;
};

export default function IzmenaKlijentaForm({ klijent }: Props) {
  const router = useRouter();
  const initial = useMemo(() => klijentToForma(klijent), [klijent]);
  const [forma, setForma] = useState<KlijentForma>(initial);
  const [greska, setGreska] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (polje: keyof KlijentForma, vrednost: string) => {
    setForma((prev) => ({ ...prev, [polje]: vrednost }));
    setGreska(null);
  };

  const handlePonisti = () => {
    setForma(initial);
    setGreska(null);
    router.push("/dashboard/klijenti");
  };

  const handleSacuvaj = (e: FormEvent) => {
    e.preventDefault();
    setGreska(null);
    startTransition(async () => {
      const rez = await azurirajKlijenta(klijent.id, forma);
      if (rez.ok) {
        router.push("/dashboard/klijenti");
        router.refresh();
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
          <h1 className="text-xl font-bold text-fcrna">Izmena klijenta</h1>
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
            {isPending ? "Čuvanje…" : "Sačuvaj izmene"}
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
                Ažurirajte podatke koji se prikazuju na fakturama za ovog klijenta.
              </p>
            </div>
          </aside>

          <KlijentFormFields
            forma={forma}
            onChange={handleChange}
            onPopuniFormu={(nova) => {
              setForma(nova);
              setGreska(null);
            }}
            iskljuciKlijentId={klijent.id}
          />
        </div>
      </main>
    </form>
  );
}
