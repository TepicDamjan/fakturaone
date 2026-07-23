"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { kreirajFirmu } from "@/app/izbor-firme/actions";

type DodajFirmuModalProps = {
  otvoren: boolean;
  onClose: () => void;
};

function InputIcon({ children }: { children: ReactNode }) {
  return (
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
      {children}
    </span>
  );
}

export default function DodajFirmuModal({ otvoren, onClose }: DodajFirmuModalProps) {
  const [state, formAction, pending] = useActionState(kreirajFirmu, null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
      setPreview(null);
    };
  }, [otvoren, onClose]);

  if (!otvoren) return null;
  if (typeof document === "undefined") return null;

  const node = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dodaj-firmu-naslov"
      className="fixed inset-0 z-[10100] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-md p-4 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl ring-1 ring-black/5 max-h-[min(92vh,820px)] flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="dodaj-firmu-naslov" className="text-xl font-bold text-[#111827]">
                Dodaj novo preduzeće
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Unesite detalje u nastavku da registrujete novi entitet u sistemu.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zatvori"
              className="p-1.5 text-[#9CA3AF] hover:text-[#111827] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
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
        </div>

        <form action={formAction} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="shrink-0 w-full sm:w-28 h-28 rounded-xl border-2 border-dashed border-gray-200 bg-[#F8FAFC] flex flex-col items-center justify-center gap-1.5 text-[#64748B] hover:border-[#137FEC]/40 hover:bg-[#EFF6FF]/50 transition-colors overflow-hidden"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 16V8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-xs font-medium">Upload</span>
                </>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/jpg"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) {
                  setPreview(null);
                  return;
                }
                setPreview(URL.createObjectURL(file));
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#111827] text-sm">Logo preduzeća</p>
              <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                Otpremite sliku visoke rezolucije. Podržani formati: PNG, JPG (maks. 2MB).
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-3 inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-gray-50 transition-colors"
              >
                Izaberi fajl
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="naziv" className="block text-sm font-medium text-[#374151] mb-1.5">
              Naziv preduzeća <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <InputIcon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </InputIcon>
              <input
                id="naziv"
                name="naziv"
                required
                placeholder="npr. Acme Corporation"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm text-fcrna placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pib" className="block text-sm font-medium text-[#374151] mb-1.5">
                Poreski ID (PIB) <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <InputIcon>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M7 9h4M7 13h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </InputIcon>
                <input
                  id="pib"
                  name="pib"
                  required
                  placeholder="npr. 102938475"
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm text-fcrna placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-1.5">
                Kontakt Email
              </label>
              <div className="relative">
                <InputIcon>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M4 6h16v12H4zM4 7l8 6 8-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </InputIcon>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="billing@acme.com"
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm text-fcrna placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC]"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="adresa" className="block text-sm font-medium text-[#374151] mb-1.5">
              Adresa
            </label>
            <div className="relative">
              <InputIcon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 21s7-4.5 7-10a7 7 0 10-14 0c0 5.5 7 10 7 10z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="2" />
                </svg>
              </InputIcon>
              <input
                id="adresa"
                name="adresa"
                placeholder="123 Business Avenue"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm text-fcrna placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="grad" className="block text-sm font-medium text-[#374151] mb-1.5">
                Grad
              </label>
              <input
                id="grad"
                name="grad"
                placeholder="Metropolis"
                className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm text-fcrna placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC]"
              />
            </div>
            <div>
              <label htmlFor="postanskiBroj" className="block text-sm font-medium text-[#374151] mb-1.5">
                Poštanski broj
              </label>
              <input
                id="postanskiBroj"
                name="postanskiBroj"
                placeholder="10000"
                className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm text-fcrna placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC]"
              />
            </div>
          </div>

          {state?.error ? (
            <p className="text-sm text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-[#374151] hover:bg-gray-50 transition-colors"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#137FEC] text-white text-sm font-semibold px-5 py-2.5 shadow-sm hover:opacity-95 transition-opacity disabled:opacity-60"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {pending ? "Čuvanje..." : "Sačuvaj preduzeće"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
