"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  otpremiLogoFirme,
  ukloniLogoFirme,
} from "@/app/dashboard/podesavanja/actions";

type Props = {
  initialLogoUrl: string | null;
};

const MAX_LOGO_BYTES = 1024 * 1024;
const DOZVOLJENI_TIPOVI = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

export default function PodesavanjaLogoFirme({ initialLogoUrl }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [greska, setGreska] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelect = (file: File) => {
    setGreska(null);

    if (file.size > MAX_LOGO_BYTES) {
      setGreska("Logo ne sme biti veći od 1 MB.");
      return;
    }
    if (!DOZVOLJENI_TIPOVI.includes(file.type)) {
      setGreska("Dozvoljeni formati su JPG, PNG, GIF, WEBP ili SVG.");
      return;
    }

    const formData = new FormData();
    formData.append("logo", file);

    startTransition(async () => {
      const res = await otpremiLogoFirme(formData);
      if (!res.ok) {
        setGreska(res.error);
        return;
      }
      setLogoUrl(res.logoUrl);
      router.refresh();
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleSelect(file);
    e.target.value = "";
  };

  const handleUkloni = () => {
    if (!window.confirm("Uklanjate logo firme. Da li ste sigurni?")) return;
    setGreska(null);
    startTransition(async () => {
      const res = await ukloniLogoFirme();
      if (!res.ok) {
        setGreska(res.error);
        return;
      }
      setLogoUrl(null);
      router.refresh();
    });
  };

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-fcrna">Logo firme</h2>
      <p className="text-sm text-[#64748B] mt-1">
        Ovaj logo će se pojaviti u zaglavlju vaših faktura.
      </p>

      <div className="mt-5 border-t border-gray-100 pt-5 flex flex-col sm:flex-row sm:items-start gap-5">
        <div className="w-20 h-20 rounded-xl border border-gray-200 bg-fsiva flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo firme"
              className="w-full h-full object-contain"
            />
          ) : (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              className="text-[#475569]"
            >
              <path
                d="M3 21V7a2 2 0 012-2h6v16M3 21h18M11 21h10V11h-4M7 9h.01M7 13h.01M7 17h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-lg border border-ftsiva bg-white px-4 py-2 text-sm font-semibold text-fcrna shadow-sm hover:bg-fsiva transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Otpremanje…" : logoUrl ? "Promeni" : "Otpremi logo"}
            </button>
            {logoUrl ? (
              <button
                type="button"
                onClick={handleUkloni}
                disabled={isPending}
                className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Ukloni
              </button>
            ) : null}
          </div>

          <p className="text-xs text-[#94A3B8] mt-2">
            JPG, GIF ili PNG. Maksimalno 1MB.
          </p>

          {greska ? (
            <p className="text-xs text-red-600 mt-2" role="alert">
              {greska}
            </p>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </section>
  );
}
