"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sacuvajFakturu } from "@/app/dashboard/fakture/actions";
import StavkeFakture, { type Stavka } from "@/app/components/StavkeFakture";
import FakturaPregled from "@/app/components/FakturaPregled";
import { saveFakturaPregledSesija } from "@/lib/fakturaPregledSession";
import { fetchKlijentiList, type Klijent } from "@/lib/klijenti";
import { createClient } from "@/utils/supabase/client";

const initialStavke: Stavka[] = [
  {
    id: "1",
    naziv: "Usluge veb dizajna",
    opis: "UI/UX dizajn za glavnu stranicu",
    kolicina: 10,
    cena: 15000.0,
  },
  {
    id: "2",
    naziv: "Frontend razvoj",
    opis: "React implementacija",
    kolicina: 20,
    cena: 12000.0,
  },
];

export default function NovaFaktura() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [stavke, setStavke] = useState<Stavka[]>(initialStavke);
  const [klijentId, setKlijentId] = useState("");
  const [klijenti, setKlijenti] = useState<Klijent[]>([]);
  const [brojFakture, setBrojFakture] = useState("");
  const [referenca, setReferenca] = useState("");
  const [datumIzdavanja, setDatumIzdavanja] = useState("");
  const [datumPlacanja, setDatumPlacanja] = useState("");
  const [napomene, setNapomene] = useState("");
  const [pdvProcenat, setPdvProcenat] = useState(20);
  const [popust, setPopust] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    fetchKlijentiList(supabase)
      .then(setKlijenti)
      .catch(() => setKlijenti([]));
  }, []);

  const osnovica = useMemo(
    () => stavke.reduce((sum, s) => sum + s.kolicina * s.cena, 0),
    [stavke]
  );

  const handleAddStavka = () => {
    const newStavka: Stavka = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9),
      naziv: "",
      opis: "",
      kolicina: 0,
      cena: 0,
    };
    setStavke((prev) => [...prev, newStavka]);
  };

  const handleUpdateStavka = (
    id: string,
    field: keyof Stavka,
    value: string | number
  ) => {
    setStavke((prev) =>
      prev.map((stavka) =>
        stavka.id === id ? { ...stavka, [field]: value } : stavka
      )
    );
  };

  const handlePregledStampa = () => {
    saveFakturaPregledSesija({
      stavke,
      klijentId,
      brojFakture,
      referenca,
      datumIzdavanja,
      datumPlacanja,
      napomene,
      pdvProcenat,
      popust,
    });
    router.push("/dashboard/fakture/pregled");
  };

  const sacuvajPayload = () => ({
    klijentId,
    brojFakture,
    referenca,
    datumIzdavanja,
    datumPlacanja,
    napomene,
    pdvProcenat,
    popust,
    stavke: stavke.map((s) => ({
      naziv: s.naziv,
      opis: s.opis,
      kolicina: s.kolicina,
      cena: s.cena,
    })),
  });

  const handleSacuvajNacrt = () => {
    setSaveError(null);
    startTransition(async () => {
      const rez = await sacuvajFakturu({
        ...sacuvajPayload(),
        status: "nacrt",
      });
      if (!rez.ok) {
        setSaveError(rez.error);
        return;
      }
      router.push("/dashboard/fakture");
    });
  };

  const handlePosalji = () => {
    setSaveError(null);
    startTransition(async () => {
      const rez = await sacuvajFakturu({
        ...sacuvajPayload(),
        status: "na_cekanju",
      });
      if (!rez.ok) {
        setSaveError(rez.error);
        return;
      }
      router.push("/dashboard/fakture");
    });
  };

  return (
    <div>
      <div>
        <div className="m-8">
          <h1 className="text-2xl font-bold text-fcrna">
            Forma za kreiranje nove fakture
          </h1>
          <p className="text-xl text-[#64748B]">
            Popunite detalje ispod kako biste generisali novu fakturu za vašeg
            klijenta.
          </p>
        </div>

        {saveError ? (
          <div
            role="alert"
            className="mx-8 mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 max-w-4xl"
          >
            {saveError}
          </div>
        ) : null}

        <div className="bg-white rounded-lg m-8 p-6 border border-gray-100 shadow-sm">
          <label className="block text-sm font-bold text-[#0F172A] mb-2">
            Izbor Klijenta
          </label>
          <div className="relative max-w-md">
            <select
              value={klijentId}
              onChange={(e) => setKlijentId(e.target.value)}
              className="w-full appearance-none bg-fsiva border border-ftsiva text-[#0F172A] text-sm rounded-lg focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC] block p-3 pr-8 transition-all shadow-sm outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="">Izaberite klijenta...</option>
              {klijenti.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.naziv}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">
                Broj fakture
              </label>
              <input
                type="text"
                value={brojFakture}
                onChange={(e) => setBrojFakture(e.target.value)}
                className="border-ftsiva border-2 hover:border-fplava focus:border-fplava outline-none transition-colors rounded-lg text-xl font-light w-full max-h-12 h-full p-2 bg-fsiva text-[#0F172A] mb-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">
                Referenca ( Opcionalno )
              </label>
              <input
                type="text"
                value={referenca}
                onChange={(e) => setReferenca(e.target.value)}
                className="border-ftsiva border-2 hover:border-fplava focus:border-fplava outline-none transition-colors rounded-lg text-xl font-light w-full max-h-12 h-full p-2 bg-fsiva text-[#0F172A] mb-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">
                Datum izdavanja
              </label>
              <input
                type="date"
                value={datumIzdavanja}
                onChange={(e) => setDatumIzdavanja(e.target.value)}
                className="border-ftsiva border-2 hover:border-fplava focus:border-fplava outline-none transition-colors rounded-lg text-xl font-light w-full max-h-12 h-full p-2 bg-fsiva text-[#0F172A] mb-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">
                Datum placanja
              </label>
              <input
                type="date"
                value={datumPlacanja}
                onChange={(e) => setDatumPlacanja(e.target.value)}
                className="border-ftsiva border-2 hover:border-fplava focus:border-fplava outline-none transition-colors rounded-lg text-xl font-light w-full max-h-12 h-full p-2 bg-fsiva text-[#0F172A] mb-2"
              />
            </div>
          </div>
        </div>

        <StavkeFakture
          stavke={stavke}
          onAddStavka={handleAddStavka}
          onUpdateStavka={handleUpdateStavka}
        />

        <div className="bg-white rounded-lg m-8 p-6 border border-gray-100 shadow-sm">
          <label className="block text-base font-bold text-[#0F172A] mb-4">
            Napomene / Uslovi plaćanja
          </label>
          <textarea
            value={napomene}
            onChange={(e) => setNapomene(e.target.value)}
            className="w-full border border-ftsiva border-2 rounded-lg p-4 bg-fsiva text-[#0F172A] min-h-[120px] outline-none hover:border-fplava focus:border-fplava transition-colors resize-y"
            placeholder="npr. Molimo platite u roku od 15 dana putem bankovnog transfera."
          />
        </div>

        <FakturaPregled
          osnovica={osnovica}
          pdvProcenat={pdvProcenat}
          onPdvProcenatChange={setPdvProcenat}
          popust={popust}
          onPopustChange={setPopust}
          onPregledStampa={handlePregledStampa}
          onSacuvajNacrt={handleSacuvajNacrt}
          onPosalji={handlePosalji}
          akcijeDisabled={isPending}
        />
      </div>
    </div>
  );
}
