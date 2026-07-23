"use client";

import { useState } from "react";
import PodesavanjaFirmaForm from "@/app/dashboard/podesavanja/PodesavanjaFirmaForm";
import PodesavanjaProfil from "@/app/dashboard/podesavanja/PodesavanjaProfil";
import PodesavanjaPlacanja from "@/app/dashboard/podesavanja/PodesavanjaPlacanja";
import PodesavanjaObavestenja from "@/app/dashboard/podesavanja/PodesavanjaObavestenja";
import type { BankovniRacunRow, FirmaRow } from "@/lib/firma";
import type { PretplataPregled } from "@/lib/pretplata.types";

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
  pretplata: PretplataPregled;
};

const TABS: { id: TabId; label: string }[] = [
  { id: "profil", label: "Profil" },
  { id: "firma", label: "Firma" },
  { id: "obavestenja", label: "Obaveštenja" },
  { id: "placanja", label: "Plaćanja" },
];

export default function PodesavanjaTabs({
  initialFirma,
  initialRacuni,
  korisnik,
  pretplata,
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
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                active
                  ? "border-fplava text-fplava"
                  : "border-transparent text-[#64748B] hover:text-fcrna"
              }`}
            >
              {t.label}
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
        <PodesavanjaPlacanja email={korisnik.email} pretplata={pretplata} />
      ) : null}

      {tab === "obavestenja" ? (
        <PodesavanjaObavestenja
          initialFirma={initialFirma}
          emailDostupan={pretplata.limits.emailSlanje}
        />
      ) : null}
    </div>
  );
}
