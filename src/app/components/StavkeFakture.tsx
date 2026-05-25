"use client";

import React from "react";

export type Stavka = {
  id: string;
  naziv: string;
  opis: string;
  kolicina: number;
  cena: number;
};

type StavkeFaktureProps = {
  stavke: Stavka[];
  onAddStavka: () => void;
  onUpdateStavka: (id: string, field: keyof Stavka, value: string | number) => void;
};

export default function StavkeFakture({
  stavke,
  onAddStavka,
  onUpdateStavka,
}: StavkeFaktureProps) {
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("bs-Latn-BA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <section className="bg-white rounded-lg mx-4 sm:m-8 border border-gray-100 shadow-sm overflow-hidden">
      <header className="p-4 sm:p-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center border-b border-gray-100">
        <h2 className="text-xl font-bold text-[#0F172A]">Stavke</h2>
        <button
          type="button"
          onClick={onAddStavka}
          className="text-[#137FEC] font-medium hover:underline flex items-center gap-1 transition-colors"
        >
          <span className="text-xl leading-none">+</span> Dodaj stavku
        </button>
      </header>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-12 gap-4 px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/30">
            <span className="col-span-5 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Opis
            </span>
            <span className="col-span-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-center">
              Kolicina
            </span>
            <span className="col-span-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-center">
              Cena
            </span>
            <span className="col-span-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-right">
              Ukupno
            </span>
          </div>

          {stavke.map((stavka) => (
            <article
              key={stavka.id}
              className="grid grid-cols-12 gap-4 px-4 sm:px-6 py-5 border-b border-gray-100 items-start hover:bg-gray-50/50 transition-colors"
            >
              <div className="col-span-5 flex flex-col gap-1.5">
                <input
                  type="text"
                  value={stavka.naziv}
                  onChange={(e) => onUpdateStavka(stavka.id, "naziv", e.target.value)}
                  placeholder="Naziv usluge/proizvoda"
                  className="text-[#0F172A] font-medium text-base bg-transparent border-none outline-none placeholder-gray-300 w-full"
                />
                <input
                  type="text"
                  value={stavka.opis}
                  onChange={(e) => onUpdateStavka(stavka.id, "opis", e.target.value)}
                  placeholder="Detaljniji opis"
                  className="text-[#64748B] text-sm bg-transparent border-none outline-none placeholder-gray-300 w-full"
                />
              </div>
              <div className="col-span-2 flex items-start justify-center pt-0.5">
                <input
                  type="number"
                  value={stavka.kolicina || ""}
                  onChange={(e) =>
                    onUpdateStavka(stavka.id, "kolicina", parseFloat(e.target.value) || 0)
                  }
                  className="text-[#0F172A] bg-transparent border-none outline-none w-full text-center"
                />
              </div>
              <div className="col-span-3 flex items-start justify-center pt-0.5">
                <input
                  type="number"
                  value={stavka.cena || ""}
                  onChange={(e) =>
                    onUpdateStavka(stavka.id, "cena", parseFloat(e.target.value) || 0)
                  }
                  className="text-[#0F172A] bg-transparent border-none outline-none w-full text-center"
                />
              </div>
              <div className="col-span-2 flex items-start justify-end pt-0.5">
                <span className="text-[#0F172A] font-bold">
                  {formatCurrency(stavka.kolicina * stavka.cena)}
                </span>
              </div>
            </article>
          ))}

          <button
            type="button"
            onClick={onAddStavka}
            className="w-full grid grid-cols-12 gap-4 px-4 sm:px-6 py-5 items-center text-left hover:bg-gray-50/50 transition-colors"
          >
            <span className="col-span-5 text-[#94A3B8] font-medium">Dodaj novu stavku...</span>
            <span className="col-span-2 text-center text-[#CBD5E1]">0</span>
            <span className="col-span-3 text-center text-[#CBD5E1]">0.00</span>
            <span className="col-span-2 text-right text-[#CBD5E1] font-bold">0,00</span>
          </button>
        </div>
      </div>
    </section>
  );
}
