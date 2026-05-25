"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Stavka } from "@/app/components/StavkeFakture";
import {
  loadFakturaPregledSesija,
  type FakturaPregledSesija,
} from "@/lib/fakturaPregledSession";
import {
  fetchKlijentById,
  formatKlijentAdresa,
  type Klijent,
} from "@/lib/klijenti";
import {
  FakturaDetaljiPlacanja,
  FakturaIzdavalacKolona,
  FakturaLogoZaglavlje,
} from "@/app/components/FakturaFirmaNaFakturi";
import { usePodesavanjaFirme } from "@/lib/usePodesavanjaFirme";
import { createClient } from "@/utils/supabase/client";

function formatIznos(amount: number) {
  return amount.toLocaleString("bs-Latn-BA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatShortDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("bs-Latn-BA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLongDate(iso: string) {
  if (!iso)
    return new Date().toLocaleDateString("bs-Latn-BA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("bs-Latn-BA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function FakturaPregledStranica() {
  const router = useRouter();
  const { izdavac, bankovniRacun } = usePodesavanjaFirme();
  const [data, setData] = useState<FakturaPregledSesija | null | undefined>(
    undefined
  );
  const [primalac, setPrimalac] = useState<Klijent | null>(null);

  useEffect(() => {
    setData(loadFakturaPregledSesija());
  }, []);

  useEffect(() => {
    if (!data?.klijentId) {
      setPrimalac(null);
      return;
    }
    const supabase = createClient();
    fetchKlijentById(supabase, data.klijentId)
      .then(setPrimalac)
      .catch(() => setPrimalac(null));
  }, [data?.klijentId]);

  const brojFakture = data?.brojFakture?.trim() || "INV-—";

  const osnovica = useMemo(() => {
    if (!data?.stavke?.length) return 0;
    return data.stavke.reduce((s, x) => s + x.kolicina * x.cena, 0);
  }, [data]);

  const pdvProcenat = data?.pdvProcenat ?? 17;
  const popust = data?.popust ?? 0;
  const pdvIznos = osnovica * (pdvProcenat / 100);
  const ukupno = osnovica + pdvIznos - popust;

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleEmail = () => {
    if (!primalac?.email) return;
    const sub = encodeURIComponent(`Faktura ${brojFakture}`);
    window.location.href = `mailto:${primalac.email}?subject=${sub}`;
  };

  if (data === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-8">
        <p className="text-[#64748B]">Učitavanje…</p>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8FAFC] p-8">
        <p className="text-fcrna font-medium text-center max-w-md">
          Nema sačuvanog pregleda. Otvorite pregled sa forme za novu fakturu
          (dugme „Pregled i štampa“).
        </p>
        <Link
          href="/dashboard/fakture/novafakturaforma"
          className="text-fplava font-semibold hover:underline"
        >
          Nazad na formu
        </Link>
      </div>
    );
  }

  const stavke: Stavka[] = data.stavke ?? [];

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-16 print:bg-white print:pb-0">
      <header className="print:hidden border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-fcrna">
                Faktura #{brojFakture}
              </h1>
              <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-sm font-semibold text-emerald-700 border border-emerald-200">
                Nacrt
              </span>
            </div>
            <p className="mt-1 text-sm text-[#64748B]">
              Kreirano {formatShortDate(data.datumIzdavanja)} • Rok plaćanja{" "}
              {formatShortDate(data.datumPlacanja)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-lg border border-ftsiva bg-white px-4 py-2.5 text-sm font-medium text-fcrna hover:bg-fsiva transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Izmeni
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-fplava px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition-opacity"
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
              Preuzmi PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-fplava px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition-opacity"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Štampaj
            </button>
            <button
              type="button"
              onClick={handleEmail}
              disabled={!primalac?.email}
              className="inline-flex items-center gap-2 rounded-lg bg-fplava px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Pošalji e-mail
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 print:mt-0 print:max-w-none print:px-8">
        <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-0">
          <div className="p-8 sm:p-10 print:p-6">
            <FakturaLogoZaglavlje
              izdavac={izdavac}
              brojFakture={brojFakture}
              datumTekst={formatLongDate(data.datumIzdavanja)}
            />

            <div className="grid sm:grid-cols-2 gap-8 py-8">
              <FakturaIzdavalacKolona izdavac={izdavac} />
              <div>
                <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                  Primalac
                </p>
                {primalac ? (
                  <>
                    <p className="font-semibold text-fcrna">{primalac.naziv}</p>
                    {formatKlijentAdresa(primalac) ? (
                      <p className="text-sm text-[#64748B] mt-1">
                        {formatKlijentAdresa(primalac)}
                      </p>
                    ) : null}
                    {primalac.email ? (
                      <p className="text-sm text-fplava mt-2">{primalac.email}</p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-[#94A3B8] italic">Klijent nije izabran</p>
                )}
              </div>
            </div>

            {data.referenca?.trim() ? (
              <p className="text-sm text-[#64748B] mb-4">
                Referenca:{" "}
                <span className="text-fcrna font-medium">{data.referenca}</span>
              </p>
            ) : null}

            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-2 bg-fsiva px-4 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wide">
                <div className="col-span-5">Opis</div>
                <div className="col-span-2 text-center">Količina</div>
                <div className="col-span-3 text-center">Jedinična cena</div>
                <div className="col-span-2 text-right">Ukupno</div>
              </div>
              {stavke.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-12 gap-2 px-4 py-4 border-t border-gray-100 text-sm"
                >
                  <div className="col-span-5">
                    <p className="font-medium text-fcrna">{row.naziv || "—"}</p>
                    {row.opis ? (
                      <p className="text-[#64748B] text-xs mt-0.5">{row.opis}</p>
                    ) : null}
                  </div>
                  <div className="col-span-2 text-center tabular-nums text-fcrna">
                    {row.kolicina}
                  </div>
                  <div className="col-span-3 text-center tabular-nums text-fcrna">
                    {formatIznos(row.cena)}
                  </div>
                  <div className="col-span-2 text-right font-semibold tabular-nums text-fcrna">
                    {formatIznos(row.kolicina * row.cena)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <div className="w-full max-w-xs space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B]">Međuzbir</span>
                  <span className="tabular-nums font-medium text-fcrna">
                    {formatIznos(osnovica)} BAM
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B]">PDV ({pdvProcenat}%)</span>
                  <span className="tabular-nums font-medium text-fcrna">
                    {formatIznos(pdvIznos)} BAM
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B]">Popust</span>
                  <span className="tabular-nums font-medium text-fcrna">
                    -{formatIznos(popust)} BAM
                  </span>
                </div>
                <div className="flex justify-between gap-4 items-end pt-3 border-t border-gray-200">
                  <span className="text-fcrna font-semibold">Ukupno za uplatu</span>
                  <span className="text-2xl font-bold text-fplava tabular-nums">
                    {formatIznos(ukupno)} BAM
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 grid sm:grid-cols-2 gap-8 text-sm">
              <FakturaDetaljiPlacanja
                izdavac={izdavac}
                bankovniRacun={bankovniRacun}
                pozivNaBroj={brojFakture}
              />
              <div>
                <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                  Napomena
                </p>
                <p className="text-[#64748B] leading-relaxed whitespace-pre-wrap">
                  {data.napomene?.trim() ||
                    "Hvala na poverenju. Molimo uplatite iznos u naznačenom roku."}
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-[#94A3B8] py-4 bg-fsiva border-t border-gray-100 print:bg-transparent">
            Generisano pomoću {izdavac.naziv}
          </p>
        </article>
      </main>
    </div>
  );
}
