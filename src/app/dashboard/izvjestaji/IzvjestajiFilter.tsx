"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IZVJESTAJ_PERIODI,
  type IzvjestajPeriod,
} from "@/lib/izvjestaji";

type Props = {
  aktivni: IzvjestajPeriod;
  periodLabel: string;
};

export default function IzvjestajiFilter({ aktivni, periodLabel }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <p className="text-sm text-[#64748B]">
        Period:{" "}
        <span className="font-semibold text-fcrna">{periodLabel}</span>
        <span className="mx-2 text-ftsiva">·</span>
        Samo fakture (bez predračuna i otpremnica)
      </p>
      <div className="flex flex-wrap gap-2">
        {IZVJESTAJ_PERIODI.map((p) => {
          const active = p.id === aktivni;
          return (
            <Link
              key={p.id}
              href={`${pathname}?period=${p.id}`}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#137FEC] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-[#64748B] hover:text-fcrna hover:border-gray-300"
              }`}
            >
              {p.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
