"use client";

import { useState } from "react";
import { metaZaTip, type TipDokumenta } from "@/lib/tipDokumenta";
import { formatIznos } from "@/lib/dokument/format";

type IznosSidebarProps = {
  osnovica: number;
  pdvProcenat: number;
  onPdvProcenatChange: (value: number) => void;
  popust: number;
  onPopustChange: (value: number) => void;
  tipDokumenta?: Extract<TipDokumenta, "faktura" | "predracun">;
};

function formatBam(amount: number) {
  return formatIznos(amount);
}

const STATUS_PORUKA: Record<"faktura" | "predracun", string> = {
  faktura: "Faktura je spremna za slanje.",
  predracun: "Predračun je spreman za slanje.",
};

export default function PredracunSumaSidebar({
  osnovica,
  pdvProcenat,
  onPdvProcenatChange,
  popust,
  onPopustChange,
  tipDokumenta = "predracun",
}: IznosSidebarProps) {
  const [popustEdit, setPopustEdit] = useState(false);
  const pdvIznos = osnovica * (pdvProcenat / 100);
  const ukupno = osnovica + pdvIznos - popust;
  const tipMeta = metaZaTip(tipDokumenta);

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center gap-4">
            <span className="text-[#64748B]">Međuzbir:</span>
            <span className="text-fcrna font-medium tabular-nums">
              {formatBam(osnovica)} BAM
            </span>
          </div>

          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-[#64748B]">
              <span>PDV</span>
              <div className="flex items-center rounded-md border border-ftsiva bg-fsiva px-1.5 py-0.5">
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
                  className="w-10 bg-transparent text-fcrna text-xs text-center outline-none tabular-nums"
                />
                <span className="text-[#94A3B8] text-xs">%</span>
              </div>
              <span className="text-[#64748B]">:</span>
            </div>
            <span className="text-fcrna font-medium tabular-nums">
              {formatBam(pdvIznos)} BAM
            </span>
          </div>

          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#64748B]">Popust:</span>
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
                  className="w-24 rounded-md border border-ftsiva bg-fsiva px-2 py-1 text-fcrna text-sm outline-none focus:border-fplava"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPopustEdit(true)}
                  className="text-fplava text-xs font-medium hover:underline"
                >
                  Izmeni
                </button>
              )}
            </div>
            <span className="text-fcrna font-medium tabular-nums">
              -{formatBam(popust)} BAM
            </span>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-between items-end gap-4">
            <span className="text-fcrna font-bold">{tipMeta.totalLabel}:</span>
            <span className="text-fplava text-2xl font-bold tabular-nums tracking-tight">
              {formatBam(ukupno)} BAM
            </span>
          </div>
        </div>
      </section>

      <section className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-sm text-emerald-800 font-medium">
          {STATUS_PORUKA[tipDokumenta]}
        </span>
      </section>
    </div>
  );
}
