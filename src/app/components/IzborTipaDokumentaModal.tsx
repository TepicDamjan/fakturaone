"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  TIP_DOKUMENTA_META,
  TIPOVI_DOKUMENATA,
  type TipDokumenta,
} from "@/lib/tipDokumenta";

type IzborTipaDokumentaModalProps = {
  otvoren: boolean;
  onClose: () => void;
  onConfirm: (tip: TipDokumenta) => void;
  defaultTip?: TipDokumenta;
};

type TipZaKreiranje = (typeof TIPOVI_DOKUMENATA)[number];

const ICONS: Record<TipZaKreiranje, ReactNode> = {
  faktura: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke="#137FEC"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6M8 13h8M8 17h5"
        stroke="#137FEC"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  predracun: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke="#F59E0B"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6"
        stroke="#F59E0B"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 11v6M9 14l3 3 3-3"
        stroke="#F59E0B"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  otpremnica: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M1 3h13v13H1zM14 8h4l3 3v5h-7M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
        stroke="#10B981"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const BG_ICON: Record<TipZaKreiranje, string> = {
  faktura: "bg-blue-50",
  predracun: "bg-amber-50",
  otpremnica: "bg-emerald-50",
};

export default function IzborTipaDokumentaModal({
  otvoren,
  onClose,
  onConfirm,
  defaultTip = "faktura",
}: IzborTipaDokumentaModalProps) {
  const [izabran, setIzabran] = useState<TipDokumenta>(defaultTip);

  useEffect(() => {
    if (otvoren) setIzabran(defaultTip);
  }, [otvoren, defaultTip]);

  useEffect(() => {
    if (!otvoren) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [otvoren, onClose]);

  if (!otvoren) return null;
  if (typeof document === "undefined") return null;

  const node = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="izbor-tipa-naslov"
      className="fixed inset-0 z-[10100] flex items-center justify-center bg-fcrna/55 backdrop-blur-[2px] p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="izbor-tipa-naslov"
              className="text-xl font-bold text-fcrna"
            >
              Izaberite tip dokumenta
            </h2>
            <p className="mt-1 text-sm text-[#64748B] leading-snug">
              Odaberite vrstu dokumenta koju želite da kreirate kako biste
              nastavili.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori"
            className="p-1 text-[#94A3B8] hover:text-fcrna transition-colors -mr-1 -mt-1"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div
          role="radiogroup"
          aria-labelledby="izbor-tipa-naslov"
          className="mt-5 space-y-3"
        >
          {TIPOVI_DOKUMENATA.map((tip) => {
            const meta = TIP_DOKUMENTA_META[tip];
            const isActive = izabran === tip;
            return (
              <label
                key={tip}
                className={`group flex items-center gap-3 rounded-xl border-2 p-3.5 cursor-pointer transition-all ${
                  isActive
                    ? "border-fplava bg-blue-50/40 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-lg ${BG_ICON[tip]}`}
                >
                  {ICONS[tip]}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-fcrna">
                    {meta.naziv}
                  </span>
                  <span className="block text-xs text-[#64748B] mt-0.5 leading-snug">
                    {meta.opis}
                  </span>
                </span>
                <input
                  type="radio"
                  name="tip-dokumenta"
                  value={tip}
                  checked={isActive}
                  onChange={() => setIzabran(tip)}
                  className="h-4 w-4 accent-fplava cursor-pointer"
                  aria-label={meta.naziv}
                />
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onConfirm(izabran)}
            className="w-full rounded-lg bg-fplava text-white font-semibold py-3 px-4 shadow-sm hover:opacity-95 transition-opacity"
          >
            Nastavi
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-sm font-medium text-[#64748B] py-2 hover:text-fcrna transition-colors"
          >
            Otkaži
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
