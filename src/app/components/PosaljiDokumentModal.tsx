"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (poruka: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  brojDokumenta: string;
  primalacEmail: string;
  nazivDokumenta: string;
};

export default function PosaljiDokumentModal({
  open,
  onClose,
  onConfirm,
  brojDokumenta,
  primalacEmail,
  nazivDokumenta,
}: Props) {
  const [poruka, setPoruka] = useState("");
  const [busy, setBusy] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPoruka("");
    setGreska(null);
    setBusy(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open || typeof document === "undefined") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setGreska(null);
    const res = await onConfirm(poruka);
    setBusy(false);
    if (!res.ok) {
      setGreska(res.error);
      return;
    }
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10060] flex items-center justify-center p-4 bg-black/40 text-left whitespace-normal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="posalji-dokument-title"
      onClick={() => !busy && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100 p-6"
      >
        <h2
          id="posalji-dokument-title"
          className="text-lg font-bold text-fcrna"
        >
          Pošalji {nazivDokumenta}
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          #{brojDokumenta} →{" "}
          <span className="font-medium text-fcrna">{primalacEmail}</span>
        </p>
        <p className="mt-2 text-xs text-[#64748B]">
          PDF dokument se šalje u prilogu putem email servisa.
        </p>

        <label className="block mt-4 text-sm font-medium text-fcrna">
          Poruka (opciono)
          <textarea
            value={poruka}
            onChange={(e) => setPoruka(e.target.value)}
            rows={4}
            disabled={busy}
            placeholder="Kratak tekst za klijenta…"
            className="mt-1.5 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-fcrna placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-fplava/30 focus:border-fplava disabled:opacity-60"
          />
        </label>

        {greska ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {greska}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-fcrna hover:bg-fsiva transition-colors disabled:opacity-50"
          >
            Otkaži
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-fplava px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {busy ? "Slanje…" : "Pošalji email"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
