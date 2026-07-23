"use client";

import { useEffect, useId, useState } from "react";
import { formatIznos } from "@/lib/dokument/format";

type Props = {
  open: boolean;
  onClose: () => void;
  brojDokumenta: string;
  ukupno: number;
  placenoIznos: number;
  onConfirm: (
    iznos: number
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export default function EvidentirajPlacanjeModal({
  open,
  onClose,
  brojDokumenta,
  ukupno,
  placenoIznos,
  onConfirm,
}: Props) {
  const titleId = useId();
  const preostalo = Math.max(0, Math.round((ukupno - placenoIznos) * 100) / 100);
  const [iznos, setIznos] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setIznos(preostalo > 0 ? preostalo.toFixed(2) : "");
    setError(null);
    setBusy(false);
  }, [open, preostalo]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(String(iznos).replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) {
      setError("Unesite ispravan iznos uplate.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await onConfirm(n);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[10060] flex items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-6"
      >
        <h2 id={titleId} className="text-lg font-bold text-fcrna">
          Evidentiraj uplatu
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Faktura #{brojDokumenta}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-[#94A3B8] text-xs font-medium">Ukupno</dt>
            <dd className="font-semibold text-fcrna">{formatIznos(ukupno)}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-[#94A3B8] text-xs font-medium">Već plaćeno</dt>
            <dd className="font-semibold text-fcrna">
              {formatIznos(placenoIznos)}
            </dd>
          </div>
          <div className="rounded-lg bg-sky-50 px-3 py-2 col-span-2">
            <dt className="text-[#64748B] text-xs font-medium">Preostalo</dt>
            <dd className="font-semibold text-fplava">{formatIznos(preostalo)}</dd>
          </div>
        </dl>

        <label className="mt-4 block text-sm font-medium text-fcrna">
          Iznos uplate
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            max={preostalo || undefined}
            value={iznos}
            onChange={(e) => setIznos(e.target.value)}
            disabled={busy || preostalo <= 0}
            className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5 text-fcrna focus:outline-none focus:ring-2 focus:ring-fplava/30"
            autoFocus
          />
        </label>

        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-lg border border-ftsiva bg-white px-4 py-2.5 text-sm font-medium text-fcrna hover:bg-fsiva disabled:opacity-50"
          >
            Otkaži
          </button>
          <button
            type="submit"
            disabled={busy || preostalo <= 0}
            className="rounded-lg bg-fplava px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
          >
            {busy ? "Čuvanje…" : "Sačuvaj uplatu"}
          </button>
        </div>
      </form>
    </div>
  );
}
