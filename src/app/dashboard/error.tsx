"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 max-w-md w-full">
        <h2 className="text-lg font-bold text-fcrna mb-2">
          Došlo je do greške
        </h2>
        <p className="text-sm text-[#94A3B8] mb-6">
          Nešto nije u redu. Pokušajte ponovo — ako se greška ponavlja,
          osvežite stranicu ili se ponovo prijavite.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-lg bg-fplava px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Pokušaj ponovo
        </button>
      </div>
    </div>
  );
}
