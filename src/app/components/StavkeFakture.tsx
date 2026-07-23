"use client";

import { metaZaTip, type TipDokumenta } from "@/lib/tipDokumenta";
import { formatIznos } from "@/lib/dokument/format";
import { JEDINICE } from "@/lib/jedinice";
import ProizvodBrzaPretraga from "@/app/components/ProizvodBrzaPretraga";
import type { Proizvod } from "@/lib/proizvodi";

export type Stavka = {
  id: string;
  naziv: string;
  opis: string;
  kolicina: number;
  cena: number;
  /** Jedinica mere (kom, kg, l, rol…) — default "kom" ako nije zadata. */
  jedinica?: string;
};

type StavkeFaktureProps = {
  stavke: Stavka[];
  onAddStavka: () => void;
  onUpdateStavka: (
    id: string,
    field: keyof Stavka,
    value: string | number
  ) => void;
  onRemoveStavka?: (id: string) => void;
  tipDokumenta?: TipDokumenta;
  /** Kada je true, kartica se prikazuje bez vanjskih margina (za grid layout). */
  inGrid?: boolean;
  /** Katalog proizvoda za brzi izbor stavki (opcionalno). */
  proizvodi?: Proizvod[];
};

export default function StavkeFakture({
  stavke,
  onAddStavka,
  onUpdateStavka,
  onRemoveStavka,
  tipDokumenta = "faktura",
  inGrid = false,
  proizvodi = [],
}: StavkeFaktureProps) {
  const tipMeta = metaZaTip(tipDokumenta);
  const jeOtpremnica = tipDokumenta === "otpremnica";

  const formatCurrency = (amount: number) => formatIznos(amount);

  const wrapperClass = inGrid
    ? "bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    : "bg-white rounded-lg mx-4 sm:m-8 border border-gray-100 shadow-sm overflow-hidden";

  const naslovStavki = jeOtpremnica
    ? "Stavke Otpremnice"
    : tipDokumenta === "predracun"
      ? "Stavke Predračuna"
      : "Stavke";

  return (
    <section className={wrapperClass}>
      <header className="p-4 sm:p-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center border-b border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold text-fcrna">
          {naslovStavki}
        </h2>
        <button
          type="button"
          onClick={onAddStavka}
          className="text-fplava font-medium hover:underline flex items-center gap-1 transition-colors text-sm"
        >
          <span className="text-lg leading-none">+</span> Dodaj stavku
        </button>
      </header>

      <div className="overflow-x-auto">
        <div className={jeOtpremnica ? "min-w-[520px]" : "min-w-[640px]"}>
          {jeOtpremnica ? (
            <div className="grid grid-cols-12 gap-3 px-4 sm:px-6 py-3 border-b border-gray-100 bg-fsiva/40">
              <span className="col-span-7 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Opis robe / materijala
              </span>
              <span className="col-span-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Jedinica
              </span>
              <span className="col-span-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Količina
              </span>
              <span className="col-span-1" />
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-3 px-4 sm:px-6 py-3 border-b border-gray-100 bg-fsiva/40">
              <span className="col-span-5 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Opis usluge / proizvoda
              </span>
              <span className="col-span-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider text-center">
                Količina
              </span>
              <span className="col-span-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider text-center">
                Cena
              </span>
              <span className="col-span-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider text-right">
                Ukupno
              </span>
              <span className="col-span-1" />
            </div>
          )}

          {stavke.length === 0 ? (
            <div className="px-4 sm:px-6 py-10 text-center text-sm text-[#94A3B8]">
              Još nema stavki. Klikni „Dodaj stavku" da bi započeo.
            </div>
          ) : null}

          {stavke.map((stavka) =>
            jeOtpremnica ? (
              <article
                key={stavka.id}
                className="grid grid-cols-12 gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 items-center hover:bg-gray-50/50 transition-colors"
              >
                <div className="col-span-7 flex flex-col gap-1">
                  <input
                    type="text"
                    value={stavka.naziv}
                    onChange={(e) =>
                      onUpdateStavka(stavka.id, "naziv", e.target.value)
                    }
                    placeholder="Naziv robe"
                    className="text-fcrna font-medium text-sm bg-transparent border-none outline-none placeholder-gray-300 w-full"
                  />
                  <input
                    type="text"
                    value={stavka.opis}
                    onChange={(e) =>
                      onUpdateStavka(stavka.id, "opis", e.target.value)
                    }
                    placeholder="Serijski broj / dodatni opis"
                    className="text-[#64748B] text-xs bg-transparent border-none outline-none placeholder-gray-300 w-full"
                  />
                </div>
                <div className="col-span-2">
                  <select
                    value={stavka.jedinica ?? "kom"}
                    onChange={(e) =>
                      onUpdateStavka(stavka.id, "jedinica", e.target.value)
                    }
                    className="w-full appearance-none rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-2 py-1 outline-none cursor-pointer"
                  >
                    {JEDINICE.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={stavka.kolicina || ""}
                    onChange={(e) =>
                      onUpdateStavka(
                        stavka.id,
                        "kolicina",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    className="text-fcrna font-bold bg-transparent border-none outline-none w-full"
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  {onRemoveStavka ? (
                    <button
                      type="button"
                      onClick={() => onRemoveStavka(stavka.id)}
                      aria-label="Ukloni stavku"
                      className="p-1 text-[#94A3B8] hover:text-red-500 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </article>
            ) : (
              <article
                key={stavka.id}
                className="grid grid-cols-12 gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 items-start hover:bg-gray-50/50 transition-colors"
              >
                <div className="col-span-5 flex flex-col gap-1">
                  <ProizvodBrzaPretraga
                    value={stavka.naziv}
                    onChange={(v) => onUpdateStavka(stavka.id, "naziv", v)}
                    onSelect={(p) => {
                      onUpdateStavka(stavka.id, "naziv", p.naziv);
                      onUpdateStavka(stavka.id, "opis", p.opis ?? "");
                      onUpdateStavka(stavka.id, "cena", Number(p.cena));
                      onUpdateStavka(stavka.id, "jedinica", p.jedinica);
                    }}
                    proizvodi={proizvodi}
                    placeholder="Naziv usluge/proizvoda"
                    className="text-fcrna font-medium text-sm bg-transparent border-none outline-none placeholder-gray-300 w-full"
                  />
                  <input
                    type="text"
                    value={stavka.opis}
                    onChange={(e) =>
                      onUpdateStavka(stavka.id, "opis", e.target.value)
                    }
                    placeholder="Detaljniji opis"
                    className="text-[#64748B] text-xs bg-transparent border-none outline-none placeholder-gray-300 w-full"
                  />
                </div>
                <div className="col-span-2 flex items-start justify-center pt-0.5">
                  <input
                    type="number"
                    value={stavka.kolicina || ""}
                    onChange={(e) =>
                      onUpdateStavka(
                        stavka.id,
                        "kolicina",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="text-fcrna bg-transparent border-none outline-none w-full text-center"
                  />
                </div>
                <div className="col-span-2 flex items-start justify-center pt-0.5">
                  <input
                    type="number"
                    value={stavka.cena || ""}
                    onChange={(e) =>
                      onUpdateStavka(
                        stavka.id,
                        "cena",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="text-fcrna bg-transparent border-none outline-none w-full text-center"
                  />
                </div>
                <div className="col-span-2 flex items-start justify-end pt-0.5">
                  <span className="text-fcrna font-bold text-sm">
                    {formatCurrency(stavka.kolicina * stavka.cena)}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end pt-0.5">
                  {onRemoveStavka ? (
                    <button
                      type="button"
                      onClick={() => onRemoveStavka(stavka.id)}
                      aria-label="Ukloni stavku"
                      className="p-1 text-[#94A3B8] hover:text-red-500 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </article>
            )
          )}

          <button
            type="button"
            onClick={onAddStavka}
            className="w-full px-4 sm:px-6 py-4 text-left text-sm text-fplava hover:bg-blue-50/40 transition-colors flex items-center gap-2 font-medium"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-fplava">
              +
            </span>
            Dodaj {tipMeta.naziv === "Otpremnica" ? "novu robu" : "novu stavku"}
          </button>
        </div>
      </div>
    </section>
  );
}
