"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Klijent } from "@/lib/klijenti";

type KlijentiTabelaProps = {
  klijenti: Klijent[];
};

export default function KlijentiTabela({ klijenti }: KlijentiTabelaProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return klijenti;
    return klijenti.filter((k) => {
      const hay = [
        k.naziv,
        k.email ?? "",
        k.grad ?? "",
        k.pib ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [klijenti, search]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pretraži klijente..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC] transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-[#64748B] text-sm mb-4">
            {klijenti.length === 0
              ? "Još nema sačuvanih klijenata. Dodajte prvog klijenta."
              : "Nema rezultata za ovu pretragu."}
          </p>
          {klijenti.length === 0 ? (
            <Link
              href="/dashboard/klijenti/novi"
              className="inline-flex items-center gap-2 text-fplava font-semibold text-sm hover:underline"
            >
              Dodaj klijenta
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="bg-fsiva/80 border-b border-gray-100">
                  <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Naziv
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Grad
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                    PIB
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-fcrna">{k.naziv}</td>
                    <td className="px-6 py-4 text-[#64748B]">{k.email ?? "—"}</td>
                    <td className="px-6 py-4 text-[#64748B]">{k.grad ?? "—"}</td>
                    <td className="px-6 py-4 text-[#64748B] tabular-nums">{k.pib ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
