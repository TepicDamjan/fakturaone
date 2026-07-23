"use client";

import { useState } from "react";
import { metaZaTip, type TipDokumenta } from "@/lib/tipDokumenta";

function formatCurrency(amount: number) {
  return amount.toLocaleString("bs-Latn-BA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type FakturaPregledProps = {
  osnovica: number;
  pdvProcenat: number;
  onPdvProcenatChange: (value: number) => void;
  popust: number;
  onPopustChange: (value: number) => void;
  onPregledStampa?: () => void;
  onSacuvajNacrt?: () => void;
  onPosalji?: () => void;
  /** Kada je true, dugmad za čuvanje/slanje su onemogućena (npr. tokom server akcije). */
  akcijeDisabled?: boolean;
  /** Tip dokumenta — koristi se za prilagođavanje labela (npr. "Ukupno za uplatu" vs "Ukupan iznos ponude"). */
  tipDokumenta?: TipDokumenta;
};

export default function FakturaPregled({
  osnovica,
  pdvProcenat,
  onPdvProcenatChange,
  popust,
  onPopustChange,
  onPregledStampa,
  onSacuvajNacrt,
  onPosalji,
  akcijeDisabled = false,
  tipDokumenta = "faktura",
}: FakturaPregledProps) {
  const tipMeta = metaZaTip(tipDokumenta);
  const [popustEdit, setPopustEdit] = useState(false);

  const pdvIznos = osnovica * (pdvProcenat / 100);
  const ukupno = osnovica + pdvIznos - popust;

  return (
    <div className="mx-4 sm:m-8 space-y-4">
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold text-fcrna mb-5">Pregled</h2>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center gap-4">
              <span className="text-[#64748B]">Osnovica</span>
              <span className="text-fcrna font-medium tabular-nums">
                {formatCurrency(osnovica)}
              </span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-[#64748B] shrink-0">
                <span>PDV (%)</span>
                <div className="flex items-center rounded-md border border-ftsiva bg-fsiva px-2 py-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={pdvProcenat}
                    onChange={(e) =>
                      onPdvProcenatChange(
                        Math.min(100, Math.max(0, Number(e.target.value) || 0))
                      )
                    }
                    className="w-10 bg-transparent text-fcrna text-sm text-center outline-none tabular-nums"
                  />
                  <span className="text-[#94A3B8] text-sm">%</span>
                </div>
              </div>
              <span className="text-fcrna font-medium tabular-nums">
                {formatCurrency(pdvIznos)}
              </span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[#64748B]">Popust</span>
                {popustEdit ? (
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={popust || ""}
                    onChange={(e) =>
                      onPopustChange(Math.max(0, Number(e.target.value) || 0))
                    }
                    onBlur={() => setPopustEdit(false)}
                    autoFocus
                    className="w-28 rounded-md border border-ftsiva bg-fsiva px-2 py-1 text-fcrna text-sm outline-none focus:border-fplava"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPopustEdit(true)}
                    className="text-fplava text-sm font-medium hover:underline"
                  >
                    Izmeni
                  </button>
                )}
              </div>
              <span className="text-fcrna font-medium tabular-nums">
                -{formatCurrency(popust)}
              </span>
            </div>
          </div>

          <div className="my-6 border-t border-gray-100" />

          <div className="flex justify-between items-end gap-4">
            <span className="text-[#64748B] text-base font-medium">
              {tipMeta.totalLabel}
            </span>
            <span className="text-fcrna text-3xl font-bold tabular-nums tracking-tight">
              {formatCurrency(ukupno)}
            </span>
          </div>
        </div>

        <div className="bg-fsiva border-t border-ftsiva px-4 py-3 text-center">
          <p className="text-xs text-[#64748B]">
            Iznosi su prikazani u BAM
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onPregledStampa}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-fplava text-white font-semibold py-3.5 px-4 shadow-sm hover:opacity-95 transition-opacity"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Pregled i štampa
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onSacuvajNacrt}
            disabled={akcijeDisabled}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-ftsiva bg-white text-fcrna font-medium py-3 px-3 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sačuvaj kao nacrt
          </button>
          <button
            type="button"
            onClick={onPosalji}
            disabled={akcijeDisabled}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-ftsiva bg-white text-fcrna font-medium py-3 px-3 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Pošalji
          </button>
        </div>
      </div>
    </div>
  );
}
