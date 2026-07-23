"use client";

import { formatIzvjestajIznos, type MesecniBucket } from "@/lib/izvjestaji";

type Props = {
  poMesecu: MesecniBucket[];
  valuta: string;
};

export default function IzvjestajiPrihodChart({ poMesecu, valuta }: Props) {
  const max = Math.max(...poMesecu.map((b) => b.iznos), 1);

  if (poMesecu.every((b) => b.iznos === 0)) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 h-full min-h-[280px] flex items-center justify-center">
        <p className="text-sm text-[#64748B] text-center">
          Nema plaćenih faktura u ovom periodu za prikaz grafikona.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 h-full">
      <h2 className="text-lg font-semibold text-fcrna mb-1">Prihod po mjesecu</h2>
      <p className="text-sm text-[#64748B] mb-8">
        Zbir plaćenih faktura ({valuta})
      </p>

      <div
        className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-56"
        role="img"
        aria-label="Grafikon prihoda po mjesecu"
      >
        {poMesecu.map((b) => {
          const pct = Math.max(4, (b.iznos / max) * 100);
          return (
            <div
              key={b.key}
              className="flex flex-1 flex-col items-center justify-end gap-2 min-w-0 h-full"
            >
              <span
                className="text-[10px] sm:text-xs font-semibold text-[#64748B] tabular-nums text-center truncate w-full"
                title={formatIzvjestajIznos(b.iznos, valuta)}
              >
                {b.iznos > 0 ? formatIzvjestajIznos(b.iznos, "").trim() : ""}
              </span>
              <div
                className="w-full max-w-[48px] rounded-t-lg bg-[#137FEC]/90 transition-all"
                style={{ height: `${pct}%` }}
              />
              <span className="text-[10px] sm:text-xs text-[#64748B] text-center leading-tight truncate w-full">
                {b.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
