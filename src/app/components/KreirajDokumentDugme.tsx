"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import IzborTipaDokumentaModal from "@/app/components/IzborTipaDokumentaModal";
import type { TipDokumenta } from "@/lib/tipDokumenta";

type KreirajDokumentDugmeProps = {
  /** Tekst dugmeta na većim ekranima. */
  labela?: string;
  /** Tekst dugmeta na mobilnim ekranima. */
  labelaMobile?: string;
};

export default function KreirajDokumentDugme({
  labela = "Kreiraj novi dokument",
  labelaMobile = "Novi",
}: KreirajDokumentDugmeProps) {
  const router = useRouter();
  const [otvorenModal, setOtvorenModal] = useState(false);

  const handleConfirm = (tip: TipDokumenta) => {
    setOtvorenModal(false);
    router.push(`/dashboard/fakture/novafakturaforma?tip=${tip}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOtvorenModal(true)}
        className="bg-[#137FEC] hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 sm:px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
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
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden sm:inline">{labela}</span>
        <span className="sm:hidden">{labelaMobile}</span>
      </button>

      <IzborTipaDokumentaModal
        otvoren={otvorenModal}
        onClose={() => setOtvorenModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
