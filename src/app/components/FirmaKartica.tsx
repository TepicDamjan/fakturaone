"use client";

import { useTransition } from "react";
import type { FirmaListItem } from "@/lib/firma";
import { initialsFromFirma } from "@/lib/firma";
import { postaviAktivnuFirmu } from "@/app/izbor-firme/actions";

type FirmaKarticaProps = {
  firma: FirmaListItem;
};

function avatarColorFromName(naziv: string): string {
  const colors = [
    "bg-[#DBEAFE] text-[#2563EB]",
    "bg-[#E0E7FF] text-[#4F46E5]",
    "bg-[#DCFCE7] text-[#16A34A]",
    "bg-[#FEF3C7] text-[#D97706]",
    "bg-[#FCE7F3] text-[#DB2777]",
  ];
  let h = 0;
  for (let i = 0; i < naziv.length; i++) h = naziv.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export default function FirmaKartica({ firma }: FirmaKarticaProps) {
  const [pending, startTransition] = useTransition();
  const initials = initialsFromFirma(firma.naziv);
  const avatarCls = avatarColorFromName(firma.naziv);

  const handleSelect = () => {
    startTransition(async () => {
      await postaviAktivnuFirmu(firma.id);
    });
  };

  return (
    <button
      type="button"
      onClick={handleSelect}
      disabled={pending}
      className="group text-left bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-6 flex flex-col min-h-[200px] hover:border-[#137FEC]/30 hover:shadow-[0_8px_24px_-8px_rgba(19,127,236,0.15)] transition-all disabled:opacity-60"
    >
      <div className="flex items-start gap-3 mb-auto">
        {firma.logoUrl ? (
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={firma.logoUrl} alt="" className="h-full w-full object-cover" />
          </span>
        ) : (
          <span
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${avatarCls}`}
          >
            {initials}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[#111827] text-base leading-snug truncate">
            {firma.naziv}
          </h3>
          <span className="inline-flex mt-2 items-center rounded-full bg-[#EFF6FF] text-[#137FEC] text-xs font-semibold px-2.5 py-0.5">
            Vlasnik
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-5 mt-4 border-t border-gray-50">
        <span className="inline-flex items-center gap-1.5 text-sm text-[#64748B]">
          <span className="h-2 w-2 rounded-full bg-[#22C55E]" aria-hidden />
          Aktivno
        </span>
        <svg
          className="text-[#94A3B8] group-hover:text-[#137FEC] transition-colors"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M9 18l6-6-6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
}
