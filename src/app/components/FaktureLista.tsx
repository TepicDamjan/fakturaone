"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type FakturaListItem,
  type FakturaStatus,
  initialsFromName,
} from "@/lib/fakture";
import FakturaAkcijeMeni from "@/app/components/FakturaAkcijeMeni";

type FaktureListaProps = {
  fakture: FakturaListItem[];
};

const PAGE_SIZE = 5;

const STATUS_LABELS: Record<FakturaStatus, string> = {
  placeno: "Plaćeno",
  na_cekanju: "Na čekanju",
  kasni: "Kasni",
  nacrt: "Nacrt",
};

const STATUS_BADGE: Record<FakturaStatus, string> = {
  placeno:
    "bg-emerald-50 text-emerald-700 border border-emerald-100/80",
  na_cekanju:
    "bg-orange-50 text-orange-700 border border-orange-100/80",
  kasni: "bg-red-50 text-red-700 border border-red-100/80",
  nacrt: "bg-slate-100 text-slate-600 border border-slate-200/80",
};

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-indigo-500",
];

function hashColor(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function formatTableDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("bs-Latn-BA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatIznos(n: number) {
  return `${n.toLocaleString("bs-Latn-BA", { maximumFractionDigits: 0 })} BAM`;
}

type DatePreset = "7" | "30" | "90" | "all";

function withinPreset(iso: string, preset: DatePreset): boolean {
  if (preset === "all") return true;
  const days = preset === "7" ? 7 : preset === "30" ? 30 : 90;
  const issued = new Date(`${iso}T12:00:00`).getTime();
  const cutoff = Date.now() - days * 86400000;
  return issued >= cutoff;
}

export default function FaktureLista({ fakture }: FaktureListaProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("30");
  const [statusFilter, setStatusFilter] = useState<FakturaStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenuId) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      const wrap = document.querySelector(`[data-faktura-actions="${openMenuId}"]`);
      const dropdown = document.querySelector(`[data-faktura-dropdown="${openMenuId}"]`);
      if (wrap?.contains(t) || dropdown?.contains(t)) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [openMenuId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fakture.filter((f) => {
      if (statusFilter !== "all" && f.status !== statusFilter) return false;
      if (!withinPreset(f.datumIzdavanja, datePreset)) return false;
      if (!q) return true;
      const broj = f.broj.toLowerCase();
      const naziv = f.klijentNaziv.toLowerCase();
      const email = f.klijentEmail.toLowerCase();
      return (
        broj.includes(q) ||
        naziv.includes(q) ||
        email.includes(q) ||
        `#${broj}`.includes(q)
      );
    });
  }, [fakture, search, datePreset, statusFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);

  const resetFilters = () => {
    setSearch("");
    setDatePreset("30");
    setStatusFilter("all");
    setPage(1);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col xl:flex-row xl:items-end gap-4 xl:justify-between">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Pretraga
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                    <path d="M20 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Traži po broju fakture ili klijentu..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-[#137FEC]/15 transition-shadow"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Datum
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 10H21M8 3V7M16 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <select
                  value={datePreset}
                  onChange={(e) => {
                    setDatePreset(e.target.value as DatePreset);
                    setPage(1);
                  }}
                  className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna outline-none focus:border-fplava cursor-pointer"
                >
                  <option value="7">Poslednjih 7 dana</option>
                  <option value="30">Poslednjih 30 dana</option>
                  <option value="90">Poslednjih 90 dana</option>
                  <option value="all">Sva vremena</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Status
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M4 6H20M4 12H20M4 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as FakturaStatus | "all");
                    setPage(1);
                  }}
                  className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna outline-none focus:border-fplava cursor-pointer"
                >
                  <option value="all">Svi statusi</option>
                  <option value="placeno">Plaćeno</option>
                  <option value="na_cekanju">Na čekanju</option>
                  <option value="kasni">Kasni</option>
                  <option value="nacrt">Nacrt</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg border border-ftsiva bg-white px-4 py-2.5 text-sm font-medium text-fcrna hover:bg-fsiva transition-colors h-[42px] self-end xl:self-auto"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Filteri
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="bg-fsiva/80 border-b border-gray-100">
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Broj fakture
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Klijent
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                Datum izdavanja
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                Rok za uplatu
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">
                Iznos
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {slice.map((f) => (
              <FakturaRow
                key={f.id}
                f={f}
                menuOpen={openMenuId === f.id}
                onToggleMenu={() =>
                  setOpenMenuId((cur) => (cur === f.id ? null : f.id))
                }
                onCloseMenu={() => setOpenMenuId(null)}
                routerRefresh={() => router.refresh()}
              />
            ))}
          </tbody>
        </table>
      </div>

      {total === 0 ? (
        <div className="px-6 py-16 text-center text-[#64748B] text-sm">
          Nema faktura koje odgovaraju filterima. Pokušajte drugačiju pretragu ili
          resetujte filtere.
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-white">
        <p className="text-sm text-[#64748B]">
          {total === 0 ? (
            "Prikazano 0 rezultata"
          ) : (
            <>
              Prikazano{" "}
              <span className="font-medium text-fcrna">{start + 1}</span> do{" "}
              <span className="font-medium text-fcrna">
                {Math.min(start + PAGE_SIZE, total)}
              </span>{" "}
              od <span className="font-medium text-fcrna">{total}</span>{" "}
              rezultata
            </>
          )}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-lg border border-ftsiva text-sm font-medium text-fcrna disabled:opacity-40 disabled:cursor-not-allowed hover:bg-fsiva transition-colors"
          >
            Prethodno
          </button>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded-lg border border-ftsiva text-sm font-medium text-fcrna disabled:opacity-40 disabled:cursor-not-allowed hover:bg-fsiva transition-colors"
          >
            Sledeće
          </button>
        </div>
      </div>
    </div>
  );
}

function FakturaRow({
  f,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  routerRefresh,
}: {
  f: FakturaListItem;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  routerRefresh: () => void;
}) {
  const initials = initialsFromName(f.klijentNaziv);
  const avatarBg = hashColor(f.klijentNaziv);

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="font-semibold text-fcrna">#{f.broj}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarBg}`}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-fcrna truncate">{f.klijentNaziv}</p>
            <p className="text-xs text-[#64748B] truncate">{f.klijentEmail}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-[#64748B] whitespace-nowrap">
        {formatTableDate(f.datumIzdavanja)}
      </td>
      <td className="px-6 py-4 text-[#64748B] whitespace-nowrap">
        {formatTableDate(f.datumPlacanja)}
      </td>
      <td className="px-6 py-4 text-right font-bold text-fcrna tabular-nums whitespace-nowrap">
        {formatIznos(f.iznos)}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[f.status]}`}
        >
          {STATUS_LABELS[f.status]}
        </span>
      </td>
      <td className="px-2 py-4 text-right">
        <FakturaAkcijeMeni
          fakturaId={f.id}
          broj={f.broj}
          klijentEmail={f.klijentEmail}
          menuOpen={menuOpen}
          onToggleMenu={onToggleMenu}
          onCloseMenu={onCloseMenu}
          routerRefresh={routerRefresh}
        />
      </td>
    </tr>
  );
}
