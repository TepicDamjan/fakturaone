"use client";

import { useState } from "react";
import PodesavanjaFirmaForm from "@/app/dashboard/podesavanja/PodesavanjaFirmaForm";
import PodesavanjaProfil from "@/app/dashboard/podesavanja/PodesavanjaProfil";
import PodesavanjaPlacanja from "@/app/dashboard/podesavanja/PodesavanjaPlacanja";
import type { BankovniRacunRow, FirmaRow } from "@/lib/firma";

export type TabId = "profil" | "firma" | "obavestenja" | "placanja";

type Props = {
  initialFirma: FirmaRow | null;
  initialRacuni: BankovniRacunRow[];
  korisnik: {
    ime: string;
    email: string;
    telefon: string;
    pozicija: string;
    avatarUrl: string | null;
  };
};

const TABS: { id: TabId; label: string; disabled?: boolean }[] = [
  { id: "profil", label: "Profil" },
  { id: "firma", label: "Firma" },
  { id: "obavestenja", label: "Obaveštenja", disabled: true },
  { id: "placanja", label: "Plaćanja" },
];

export default function PodesavanjaTabs({
  initialFirma,
  initialRacuni,
  korisnik,
}: Props) {
  const [tab, setTab] = useState<TabId>("profil");

  return (
    <div className="flex flex-col min-h-0">
      <nav className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              disabled={t.disabled}
              onClick={() => !t.disabled && setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                active
                  ? "border-fplava text-fplava"
                  : t.disabled
                    ? "border-transparent text-[#94A3B8] cursor-not-allowed"
                    : "border-transparent text-[#64748B] hover:text-fcrna"
              }`}
            >
              {t.label}
              {t.disabled ? (
                <span className="ml-1.5 text-[10px] uppercase text-[#94A3B8]">uskoro</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {tab === "profil" ? (
        <PodesavanjaProfil
          initialIme={korisnik.ime}
          initialEmail={korisnik.email}
          initialTelefon={korisnik.telefon}
          initialPozicija={korisnik.pozicija}
          initialAvatarUrl={korisnik.avatarUrl}
        />
      ) : null}

      {tab === "firma" ? (
        <PodesavanjaFirmaForm
          initialFirma={initialFirma}
          initialRacuni={initialRacuni}
        />
      ) : null}

      {tab === "placanja" ? (
        <PodesavanjaPlacanja email={korisnik.email} />
      ) : null}

      {tab === "obavestenja" ? (
        <p className="text-[#64748B] text-sm">Ova sekcija će uskoro biti dostupna.</p>
      ) : null}
    </div>
  );
}
