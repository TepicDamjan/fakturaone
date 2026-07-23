"use client";

import { useState, useTransition } from "react";
import type { PlanTier } from "@/lib/plans";
import { pokreniFreemiusPlacanje } from "@/app/dashboard/nadogradi/actions";

type Props = {
  planTier: PlanTier;
  label: string;
  highlighted?: boolean;
  disabled?: boolean;
};

export default function NadogradiCheckoutDugme({
  planTier,
  label,
  highlighted = false,
  disabled = false,
}: Props) {
  const [greska, setGreska] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => {
          setGreska(null);
          startTransition(async () => {
            const result = await pokreniFreemiusPlacanje(planTier);
            if (!result.ok) {
              setGreska(result.error);
              return;
            }
            window.location.href = result.url;
          });
        }}
        className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
          highlighted
            ? "bg-fplava text-white hover:bg-blue-600"
            : "border border-gray-200 text-fcrna hover:bg-fsiva"
        }`}
      >
        {pending ? "Preusmeravanje…" : label}
      </button>
      {greska ? <p className="mt-2 text-xs text-red-600">{greska}</p> : null}
    </div>
  );
}
