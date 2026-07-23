"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  type FakturaListItem,
  type FakturaStatus,
  initialsFromName,
} from "@/lib/fakture";
import { DATUM_PRESET_DEFAULT, type DatumPreset } from "@/lib/faktureFilter";
import FakturaAkcijeMeni from "@/app/components/FakturaAkcijeMeni";
import {
  TIP_DOKUMENTA_META,
  type TipDokumenta,
} from "@/lib/tipDokumenta";
import { formatDatumKratki } from "@/lib/dokument/format";

type FaktureListaProps = {
  fakture: FakturaListItem[];
  ukupno: number;
  strana: number;
  poStrani: number;
  q: string;
  status: FakturaStatus | "all";
  tip: TipDokumenta | "all";
  datum: DatumPreset;
};

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

const TIP_BADGE: Record<TipDokumenta, string> = {
  faktura: "bg-blue-50 text-blue-700 border border-blue-100/80",
  predracun: "bg-amber-50 text-amber-700 border border-amber-100/80",
  otpremnica: "bg-emerald-50 text-emerald-700 border border-emerald-100/80",
  kreditna_nota: "bg-rose-50 text-rose-700 border border-rose-100/80",
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

function formatIznos(n: number) {
  return `${n.toLocaleString("bs-Latn-BA", { maximumFractionDigits: 0 })} BAM`;
}

function buildQueryString(params: {
  q: string;
  status: FakturaStatus | "all";
  tip: TipDokumenta | "all";
  datum: DatumPreset;
  strana: number;
}): string {
  const sp = new URLSearchParams();
  if (params.q.trim()) sp.set("q", params.q.trim());
  if (params.status !== "all") sp.set("status", params.status);
  if (params.tip !== "all") sp.set("tip", params.tip);
  if (params.datum !== DATUM_PRESET_DEFAULT) sp.set("datum", params.datum);
  if (params.strana > 1) sp.set("strana", String(params.strana));
  return sp.toString();
}

export default function FaktureLista({
  fakture,
  ukupno,
  strana,
  poStrani,
  q,
  status,
  tip,
  datum,
}: FaktureListaProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(q);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const navigate = (next: {
    q?: string;
    status?: FakturaStatus | "all";
    tip?: TipDokumenta | "all";
    datum?: DatumPreset;
    strana?: number;
  }) => {
    const qs = buildQueryString({
      q: next.q ?? search,
      status: next.status ?? status,
      tip: next.tip ?? tip,
      datum: next.datum ?? datum,
      // Promena bilo kog filtera vraća na prvu stranu.
      strana: next.strana ?? 1,
    });
    startTransition(() => {
      router.replace(`/dashboard/fakture${qs ? `?${qs}` : ""}`);
    });
  };

  const onSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      navigate({ q: value });
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

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

  const total = ukupno;
  const totalPages = Math.max(1, Math.ceil(total / poStrani));
  const safePage = Math.min(strana, totalPages);
  const start = (safePage - 1) * poStrani;

  const izvozQs = buildQueryString({ q: search, status, tip, datum, strana: 1 });
  const izvozHref = `/api/fakture/izvoz${izvozQs ? `?${izvozQs}` : ""}`;

  const resetFilters = () => {
    setSearch("");
    navigate({ q: "", status: "all", tip: "all", datum: DATUM_PRESET_DEFAULT });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col xl:flex-row xl:items-end gap-4 xl:justify-between">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
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
                  onChange={(e) => onSearchChange(e.target.value)}
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
                  value={datum}
                  onChange={(e) => navigate({ datum: e.target.value as DatumPreset })}
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
                  value={status}
                  onChange={(e) =>
                    navigate({ status: e.target.value as FakturaStatus | "all" })
                  }
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
            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Tip dokumenta
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <select
                  value={tip}
                  onChange={(e) =>
                    navigate({ tip: e.target.value as TipDokumenta | "all" })
                  }
                  className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna outline-none focus:border-fplava cursor-pointer"
                >
                  <option value="all">Svi tipovi</option>
                  <option value="faktura">Faktura</option>
                  <option value="predracun">Predračun</option>
                  <option value="otpremnica">Otpremnica</option>
                  <option value="kreditna_nota">Kreditna nota</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 self-end xl:self-auto">
            <a
              href={izvozHref}
              download
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg border border-ftsiva bg-white px-4 py-2.5 text-sm font-medium text-fcrna hover:bg-fsiva transition-colors h-[42px]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Izvezi CSV
            </a>
            <button
              type="button"
              onClick={resetFilters}
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg border border-ftsiva bg-white px-4 py-2.5 text-sm font-medium text-fcrna hover:bg-fsiva transition-colors h-[42px]"
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
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="bg-fsiva/80 border-b border-gray-100">
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Dokument
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Klijent
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                Datum izdavanja
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                Rok / važi
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
            {fakture.map((f) => (
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
                {Math.min(start + fakture.length, total)}
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
            onClick={() => navigate({ strana: Math.max(1, safePage - 1) })}
            className="px-4 py-2 rounded-lg border border-ftsiva text-sm font-medium text-fcrna disabled:opacity-40 disabled:cursor-not-allowed hover:bg-fsiva transition-colors"
          >
            Prethodno
          </button>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => navigate({ strana: Math.min(totalPages, safePage + 1) })}
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

  const tipMeta = TIP_DOKUMENTA_META[f.tipDokumenta];

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-fcrna">#{f.broj}</span>
          <span
            className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TIP_BADGE[f.tipDokumenta]}`}
          >
            {tipMeta.naziv}
          </span>
        </div>
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
        {formatDatumKratki(f.datumIzdavanja)}
      </td>
      <td className="px-6 py-4 text-[#64748B] whitespace-nowrap">
        {formatDatumKratki(f.datumPlacanja)}
      </td>
      <td className="px-6 py-4 text-right font-bold text-fcrna tabular-nums whitespace-nowrap">
        <div className="flex flex-col items-end gap-0.5">
          <span>{formatIznos(f.iznos)}</span>
          {f.tipDokumenta === "faktura" &&
          f.placenoIznos > 0 &&
          f.status !== "placeno" ? (
            <span className="text-[11px] font-medium text-emerald-600">
              Plaćeno {formatIznos(f.placenoIznos)}
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[f.status]}`}
        >
          {f.tipDokumenta === "faktura" &&
          f.placenoIznos > 0 &&
          f.status !== "placeno"
            ? "Djelimično"
            : STATUS_LABELS[f.status]}
        </span>
      </td>
      <td className="px-2 py-4 text-right">
        <FakturaAkcijeMeni
          fakturaId={f.id}
          broj={f.broj}
          tipDokumenta={f.tipDokumenta}
          klijentEmail={f.klijentEmail}
          iznos={f.iznos}
          placenoIznos={f.placenoIznos}
          status={f.status}
          menuOpen={menuOpen}
          onToggleMenu={onToggleMenu}
          onCloseMenu={onCloseMenu}
          routerRefresh={routerRefresh}
        />
      </td>
    </tr>
  );
}
