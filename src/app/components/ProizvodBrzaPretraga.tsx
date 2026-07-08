"use client";

import { useEffect, useRef, useState } from "react";
import type { Proizvod } from "@/lib/proizvodi";

function formatCena(n: number) {
  return n.toLocaleString("bs-Latn-BA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Input za naziv stavke sa padajućom listom proizvoda iz kataloga.
 * Slobodan unos i dalje radi — izbor iz kataloga je opcioni.
 */
export default function ProizvodBrzaPretraga({
  value,
  onChange,
  onSelect,
  proizvodi,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (proizvod: Proizvod) => void;
  proizvodi: Proizvod[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const q = value.trim().toLowerCase();
  const filtrirani = (
    q
      ? proizvodi.filter(
          (p) =>
            p.naziv.toLowerCase().includes(q) ||
            (p.opis ?? "").toLowerCase().includes(q)
        )
      : proizvodi
  ).slice(0, 8);

  const prikaziListu = open && filtrirani.length > 0;

  return (
    <div ref={wrapRef} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (proizvodi.length > 0) setOpen(true);
        }}
        placeholder={placeholder}
        className={className}
      />
      {prikaziListu ? (
        <div className="absolute left-0 top-full z-30 mt-1 w-full min-w-[260px] rounded-lg border border-gray-100 bg-white py-1 shadow-xl">
          {filtrirani.map((p) => (
            <button
              key={p.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(p);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-fsiva transition-colors"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-fcrna">
                  {p.naziv}
                </span>
                {p.opis ? (
                  <span className="block truncate text-xs text-[#94A3B8]">
                    {p.opis}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-xs font-semibold text-[#64748B] tabular-nums">
                {formatCena(Number(p.cena))} / {p.jedinica}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
