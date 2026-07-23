"use client";

import type { Toast, ToastTip } from "@/app/components/toast/ToastContext";

const TIP_STIL: Record<ToastTip, { boja: string; ikona: string }> = {
  uspeh: { boja: "border-emerald-200 bg-emerald-50 text-emerald-800", ikona: "✓" },
  greska: { boja: "border-red-200 bg-red-50 text-red-800", ikona: "✕" },
  info: { boja: "border-blue-200 bg-blue-50 text-blue-800", ikona: "i" },
};

export default function ToastContainer({
  toasts,
  onUkloni,
}: {
  toasts: Toast[];
  onUkloni: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      role="status"
      className="fixed bottom-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => {
        const stil = TIP_STIL[toast.tip];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${stil.boja}`}
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/70 text-xs font-bold"
            >
              {stil.ikona}
            </span>
            <p className="flex-1 text-sm font-medium">{toast.poruka}</p>
            <button
              type="button"
              onClick={() => onUkloni(toast.id)}
              aria-label="Zatvori obaveštenje"
              className="shrink-0 text-current opacity-60 transition-opacity hover:opacity-100"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
