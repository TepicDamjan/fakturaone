"use client";

import { useMemo, useState } from "react";
import type { FirmaListItem } from "@/lib/firma";
import DodajFirmuModal from "@/app/components/DodajFirmuModal";
import FirmaKartica from "@/app/components/FirmaKartica";
import IzborFirmeHeader from "@/app/components/IzborFirmeHeader";

type IzborFirmeSadrzajProps = {
  firme: FirmaListItem[];
};

export default function IzborFirmeSadrzaj({ firme }: IzborFirmeSadrzajProps) {
  const [modalOtvoren, setModalOtvoren] = useState(false);
  const [search, setSearch] = useState("");

  const filtrirane = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return firme;
    return firme.filter(
      (f) =>
        f.naziv.toLowerCase().includes(q) ||
        (f.pib?.toLowerCase().includes(q) ?? false) ||
        (f.email?.toLowerCase().includes(q) ?? false)
    );
  }, [firme, search]);

  return (
    <div className="min-h-[calc(100dvh-2.5rem)] bg-[#F8FAFC] flex flex-col">
      <IzborFirmeHeader
        search={search}
        onSearchChange={setSearch}
        onDodajPreduzece={() => setModalOtvoren(true)}
      />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Dobrodošli nazad</h1>
          <p className="mt-2 text-[#64748B] text-sm sm:text-base">
            Odaberite preduzeće sa kojim želite da radite ili kreirajte novo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtrirane.map((firma) => (
            <FirmaKartica key={firma.id} firma={firma} />
          ))}

          <button
            type="button"
            onClick={() => setModalOtvoren(true)}
            className="text-left rounded-2xl border-2 border-dashed border-gray-200 bg-[#F1F5F9]/60 p-5 sm:p-6 flex flex-col items-center justify-center min-h-[200px] gap-3 hover:border-[#137FEC]/40 hover:bg-[#EFF6FF]/40 transition-all"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm text-[#137FEC]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div className="text-center">
              <p className="font-bold text-[#111827]">Dodaj novo preduzeće</p>
              <p className="mt-1 text-sm text-[#64748B] max-w-[220px]">
                Započnite sa radom za novog klijenta ili organizaciju.
              </p>
            </div>
          </button>
        </div>
      </main>

      <DodajFirmuModal otvoren={modalOtvoren} onClose={() => setModalOtvoren(false)} />
    </div>
  );
}
