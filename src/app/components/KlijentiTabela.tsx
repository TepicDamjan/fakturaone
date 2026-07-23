"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { obrisiKlijenta } from "@/app/dashboard/klijenti/actions";
import type { KlijentSaFakturisano } from "@/lib/klijenti";
import { formatIznosCijeli } from "@/lib/dokument/format";

type KlijentiTabelaProps = {
  klijenti: KlijentSaFakturisano[];
};

function formatFakturisano(n: number) {
  return `${formatIznosCijeli(n)} BAM`;
}

export default function KlijentiTabela({ klijenti }: KlijentiTabelaProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return klijenti;
    return klijenti.filter((k) => {
      const hay = [k.naziv, k.email ?? "", k.grad ?? "", k.pib ?? ""].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [klijenti, search]);

  const handleDelete = (k: KlijentSaFakturisano) => {
    if (
      !window.confirm(
        `Obrisati klijenta „${k.naziv}”? Ova radnja se ne može poništiti.`
      )
    ) {
      return;
    }
    setDeletingId(k.id);
    startTransition(async () => {
      const res = await obrisiKlijenta(k.id);
      setDeletingId(null);
      if (!res.ok) {
        window.alert(res.error);
        return;
      }
      router.refresh();
    });
  };

  const rowBusy = (id: string) => isPending && deletingId === id;

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
            <table className="w-full min-w-[900px] text-left text-sm">
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
                  <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right whitespace-nowrap">
                    Ukupno fakturisano
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right whitespace-nowrap">
                    Akcije
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
                    <td className="px-6 py-4 text-right font-bold text-[#0F172A] tabular-nums whitespace-nowrap">
                      {formatFakturisano(k.ukupnoFakturisano)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/klijenti/${k.id}/izmena`}
                          className="p-2 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-gray-100 transition-colors"
                          aria-label={`Izmeni klijenta ${k.naziv}`}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path
                              d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>
                        <button
                          type="button"
                          disabled={rowBusy(k.id)}
                          onClick={() => handleDelete(k)}
                          className="p-2 rounded-md text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                          aria-label={`Obriši klijenta ${k.naziv}`}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path
                              d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#F8FAFC] border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled
              className="px-3 py-1.5 text-sm font-medium text-[#94A3B8] rounded-lg border border-transparent"
            >
              Prethodno
            </button>
            <button
              type="button"
              disabled
              className="px-4 py-1.5 text-sm font-medium text-[#0F172A] bg-white border border-gray-200 rounded-lg shadow-sm opacity-60 cursor-not-allowed"
            >
              Sledeće
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
