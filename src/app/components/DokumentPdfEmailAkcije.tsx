"use client";

import { useCallback, useState } from "react";
import { preuzmiDokumentPdf } from "@/lib/dokument/dokumentClient";
import {
  dokumentPdfFilenameZa,
  type DokumentModel,
} from "@/lib/dokument/dokumentModel";
import { metaZaTip } from "@/lib/tipDokumenta";
import PosaljiDokumentModal from "@/app/components/PosaljiDokumentModal";
import { posaljiFakturuEmail } from "@/app/dashboard/fakture/emailActions";

type Props = {
  fakturaId: string;
  broj: string;
  tipDokumenta: DokumentModel["tipDokumenta"];
  primalacEmail: string | null | undefined;
  /** Klasa za primarno dugme (PDF) */
  primaryClassName?: string;
  /** Klasa za sekundarno dugme (email) */
  secondaryClassName?: string;
  /** Prikaži i print dugme */
  showPrint?: boolean;
  onPrint?: () => void;
};

const DEFAULT_PRIMARY =
  "inline-flex items-center gap-2 rounded-lg bg-fplava px-3.5 py-2 text-sm font-semibold text-white hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";

const DEFAULT_SECONDARY =
  "inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-medium text-fcrna hover:bg-[#F8FAFC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

export default function DokumentPdfEmailAkcije({
  fakturaId,
  broj,
  tipDokumenta,
  primalacEmail,
  primaryClassName = DEFAULT_PRIMARY,
  secondaryClassName = DEFAULT_SECONDARY,
  showPrint = false,
  onPrint,
}: Props) {
  const [pdfBusy, setPdfBusy] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const tipMeta = metaZaTip(tipDokumenta);
  const email = primalacEmail?.trim() ?? "";

  const handlePdf = useCallback(async () => {
    setPdfBusy(true);
    const filename = dokumentPdfFilenameZa(tipDokumenta, broj);
    const res = await preuzmiDokumentPdf(fakturaId, filename);
    setPdfBusy(false);
    if (!res.ok) window.alert(res.error);
  }, [fakturaId, broj, tipDokumenta]);

  const handleEmailConfirm = useCallback(
    async (poruka: string) => posaljiFakturuEmail(fakturaId, poruka || null),
    [fakturaId]
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {showPrint && onPrint ? (
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-fcrna transition-colors print:hidden"
          >
            Štampaj
          </button>
        ) : null}
        <button
          type="button"
          onClick={handlePdf}
          disabled={pdfBusy}
          className={primaryClassName}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {pdfBusy ? "Generisanje…" : "PDF"}
        </button>
        <button
          type="button"
          onClick={() => setEmailModal(true)}
          disabled={!email}
          title={!email ? "Klijent nema email adresu" : undefined}
          className={secondaryClassName}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          E-mail
        </button>
      </div>

      <PosaljiDokumentModal
        open={emailModal}
        onClose={() => setEmailModal(false)}
        onConfirm={handleEmailConfirm}
        brojDokumenta={broj}
        primalacEmail={email}
        nazivDokumenta={tipMeta.naziv.toLowerCase()}
      />
    </>
  );
}
