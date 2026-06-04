"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { obrisiFakturu, promeniStatusFakture } from "@/app/dashboard/fakture/actions";
import { posaljiFakturuEmail } from "@/app/dashboard/fakture/emailActions";
import { preuzmiDokumentPdf } from "@/lib/dokument/dokumentClient";
import { dokumentPdfFilenameZa } from "@/lib/dokument/dokumentModel";
import PosaljiDokumentModal from "@/app/components/PosaljiDokumentModal";
import { metaZaTip, parseTipDokumenta, type TipDokumenta } from "@/lib/tipDokumenta";

export type FakturaAkcijeMeniProps = {
  fakturaId: string;
  broj: string;
  tipDokumenta?: TipDokumenta;
  klijentEmail: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  routerRefresh: () => void;
  /** Tailwind klase za dugme (kebab) */
  triggerClassName?: string;
};

const DEFAULT_TRIGGER =
  "p-2 rounded-lg border-2 border-[#137FEC]/25 bg-sky-50/60 text-[#137FEC] hover:bg-sky-100/80 hover:border-[#137FEC]/40 transition-colors disabled:opacity-50";

export default function FakturaAkcijeMeni({
  fakturaId,
  broj,
  tipDokumenta: tipRaw,
  klijentEmail,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  routerRefresh,
  triggerClassName = DEFAULT_TRIGGER,
}: FakturaAkcijeMeniProps) {
  const tipDokumenta = parseTipDokumenta(tipRaw);
  const tipMeta = metaZaTip(tipDokumenta);
  const [busy, setBusy] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const MENU_WIDTH = 220;

  const syncMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    let left = r.right - MENU_WIDTH;
    left = Math.min(Math.max(8, left), vw - MENU_WIDTH - 8);
    setMenuPos({ top: r.bottom + 8, left });
  }, []);

  useLayoutEffect(() => {
    if (!menuOpen) {
      setMenuPos(null);
      return;
    }
    syncMenuPosition();
  }, [menuOpen, syncMenuPosition]);

  useEffect(() => {
    if (!menuOpen) return;
    syncMenuPosition();
    window.addEventListener("resize", syncMenuPosition);
    window.addEventListener("scroll", syncMenuPosition, true);
    return () => {
      window.removeEventListener("resize", syncMenuPosition);
      window.removeEventListener("scroll", syncMenuPosition, true);
    };
  }, [menuOpen, syncMenuPosition]);

  const runAction = async (
    fn: () => Promise<{ ok: true } | { ok: false; error: string }>
  ) => {
    setBusy(true);
    try {
      const res = await fn();
      onCloseMenu();
      if (!res.ok) {
        window.alert(res.error);
        return;
      }
      routerRefresh();
    } finally {
      setBusy(false);
    }
  };

  const dropdown =
    menuOpen && menuPos ? (
      <div
        data-faktura-dropdown={fakturaId}
        role="menu"
        className="fixed z-[10050] min-w-[220px] rounded-xl bg-white py-1 shadow-xl ring-1 ring-black/[0.08] text-left"
        style={{ top: menuPos.top, left: menuPos.left }}
      >
        <Link
          href={`/dashboard/fakture/${fakturaId}/pregled`}
          role="menuitem"
          onClick={onCloseMenu}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-fcrna hover:bg-fsiva transition-colors"
        >
          <svg
            className="shrink-0 text-[#64748B]"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
          Pregledaj
        </Link>
        <button
          type="button"
          role="menuitem"
          disabled={busy}
          onClick={async () => {
            onCloseMenu();
            const res = await preuzmiDokumentPdf(
              fakturaId,
              dokumentPdfFilenameZa(tipDokumenta, broj)
            );
            if (!res.ok) window.alert(res.error);
          }}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-fcrna hover:bg-fsiva transition-colors disabled:opacity-50"
        >
          <svg
            className="shrink-0 text-[#64748B]"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Preuzmi PDF
        </button>
        <button
          type="button"
          role="menuitem"
          disabled={!klijentEmail?.trim()}
          onClick={() => {
            if (!klijentEmail?.trim()) return;
            onCloseMenu();
            setEmailModal(true);
          }}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-fcrna hover:bg-fsiva transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            className="shrink-0 text-[#64748B]"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
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

        <div className="my-1 h-px bg-gray-100" role="separator" />

        <button
          type="button"
          role="menuitem"
          onClick={() => runAction(() => promeniStatusFakture(fakturaId, "na_cekanju"))}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-fcrna hover:bg-orange-50/90 transition-colors"
        >
          <svg
            className="shrink-0 text-orange-600"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Na čekanju
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => runAction(() => promeniStatusFakture(fakturaId, "placeno"))}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-fcrna hover:bg-emerald-50/80 transition-colors"
        >
          <svg
            className="shrink-0 text-emerald-600"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Plaćeno
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => runAction(() => promeniStatusFakture(fakturaId, "kasni"))}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-fcrna hover:bg-red-50/80 transition-colors"
        >
          <svg
            className="shrink-0 text-red-500"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Kasni
        </button>

        <div className="my-1 h-px bg-gray-100" role="separator" />

        <button
          type="button"
          role="menuitem"
          onClick={() => {
            if (
              !window.confirm(
                `Obrisati fakturu #${broj}? Ova radnja se ne može poništiti.`
              )
            ) {
              return;
            }
            runAction(() => obrisiFakturu(fakturaId));
          }}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg
            className="shrink-0"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Obriši
        </button>
      </div>
    ) : null;

  return (
    <>
      <PosaljiDokumentModal
        open={emailModal}
        onClose={() => setEmailModal(false)}
        onConfirm={async (poruka) => {
          const res = await posaljiFakturuEmail(fakturaId, poruka || null);
          if (res.ok) routerRefresh();
          return res;
        }}
        brojDokumenta={broj}
        primalacEmail={klijentEmail.trim()}
        nazivDokumenta={tipMeta.naziv.toLowerCase()}
      />
      <div className="inline-flex justify-end" data-faktura-actions={fakturaId}>
        <button
          ref={triggerRef}
          type="button"
          disabled={busy}
          onClick={() => onToggleMenu()}
          className={triggerClassName}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Akcije za fakturu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="12" cy="6" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="18" r="1.5" />
          </svg>
        </button>
      </div>
      {typeof document !== "undefined" && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </>
  );
}
