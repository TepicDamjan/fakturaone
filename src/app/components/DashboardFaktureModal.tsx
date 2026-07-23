"use client";

import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { initialsFromName, type FakturaStatus } from "@/lib/fakture";
import { formatDatumKratki, formatIznosCijeli } from "@/lib/dokument/format";

export type DashboardFakturaRow = {
  id: string;
  broj: string;
  klijentNaziv: string;
  klijentEmail: string;
  datumIzdavanja: string;
  datumPlacanja: string;
  iznos: number;
  status: FakturaStatus;
};

export type DashboardKarticaTip = "ukupno" | "placeno" | "kasni";

type DashboardFaktureModalProps = {
  otvoren: boolean;
  tip: DashboardKarticaTip | null;
  fakture: DashboardFakturaRow[];
  onClose: () => void;
};

function daysLate(datumPlacanja: string): number {
  if (!datumPlacanja) return 0;
  const due = new Date(`${datumPlacanja}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function avatarClassFromInitials(initials: string): string {
  const colors = [
    "bg-red-100 text-red-600",
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
    "bg-indigo-100 text-indigo-600",
    "bg-emerald-100 text-emerald-600",
    "bg-amber-100 text-amber-700",
    "bg-cyan-100 text-cyan-700",
  ];
  let h = 0;
  for (let i = 0; i < initials.length; i++) h = initials.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function filterByTip(fakture: DashboardFakturaRow[], tip: DashboardKarticaTip): DashboardFakturaRow[] {
  switch (tip) {
    case "placeno":
      return fakture.filter((f) => f.status === "placeno");
    case "kasni":
      return fakture.filter((f) => f.status === "kasni");
    default:
      return fakture;
  }
}

function HeaderIcon({ tip }: { tip: DashboardKarticaTip }) {
  if (tip === "kasni") {
    return (
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (tip === "placeno") {
    return (
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="#16A34A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m8-6a8 8 0 11-16 0 8 8 0 0116 0z"
          stroke="#137FEC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

const META: Record<
  DashboardKarticaTip,
  { title: string; subtitle: string; showAlert: boolean; alertText?: string; primaryAction?: string }
> = {
  kasni: {
    title: "Pregled dospjelih faktura",
    subtitle: "Hitne radnje potrebne za sljedeće neplaćene stavke.",
    showAlert: true,
    alertText:
      "Ove fakture su dospjele više od 15 dana. Preporučuje se slanje automatskog podsjetnika klijentima.",
    primaryAction: "Pošalji podsjetnike svima",
  },
  placeno: {
    title: "Pregled plaćenih faktura",
    subtitle: "Lista svih faktura koje su uspješno naplaćene.",
    showAlert: false,
  },
  ukupno: {
    title: "Pregled svih faktura",
    subtitle: "Kompletan pregled fakturisanih iznosa i statusa.",
    showAlert: false,
  },
};

export default function DashboardFaktureModal({
  otvoren,
  tip,
  fakture,
  onClose,
}: DashboardFaktureModalProps) {
  const rows = useMemo(() => {
    if (!tip) return [];
    return filterByTip(fakture, tip);
  }, [fakture, tip]);

  useEffect(() => {
    if (!otvoren) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [otvoren, onClose]);

  if (!otvoren || !tip) return null;
  if (typeof document === "undefined") return null;

  const meta = META[tip];
  const showAlert = meta.showAlert && rows.length > 0;

  const posaljiPodsjetnike = () => {
    const emails = [
      ...new Set(
        rows.map((r) => r.klijentEmail.trim()).filter(Boolean)
      ),
    ];
    if (emails.length === 0) {
      window.alert("Nijedna faktura nema email adresu klijenta.");
      return;
    }
    const sub = encodeURIComponent("Podsjetnik: dospjela faktura");
    const body = encodeURIComponent(
      "Poštovani,\n\nPodsjećamo Vas da imate neplaćenu fakturu koja je dospjela. Molimo Vas da izvršite uplatu u najkraćem roku.\n\nHvala."
    );
    if (emails.length === 1) {
      window.location.href = `mailto:${emails[0]}?subject=${sub}&body=${body}`;
      return;
    }
    window.location.href = `mailto:?bcc=${encodeURIComponent(emails.join(","))}&subject=${sub}&body=${body}`;
  };

  const node = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-fakture-modal-title"
      className="fixed inset-0 z-[10100] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-md p-4 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl ring-1 ring-black/5 flex flex-col max-h-[min(90vh,720px)]">
        <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <HeaderIcon tip={tip} />
              <div className="min-w-0">
                <h2
                  id="dashboard-fakture-modal-title"
                  className="text-lg font-bold text-[#111827] leading-tight"
                >
                  {meta.title}
                </h2>
                <p className="mt-1 text-sm text-[#6B7280] leading-snug">{meta.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zatvori"
              className="p-1.5 text-[#9CA3AF] hover:text-[#111827] transition-colors shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {showAlert && meta.alertText ? (
          <div className="px-6 pt-4 shrink-0">
            <div className="flex gap-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA]/60 px-4 py-3">
              <svg
                className="shrink-0 mt-0.5"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2" />
                <path d="M12 8v5M12 16h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-sm text-[#B91C1C] leading-snug">{meta.alertText}</p>
            </div>
          </div>
        ) : null}

        <div className="overflow-y-auto flex-1 min-h-0 px-6 py-4">
          {rows.length === 0 ? (
            <p className="text-sm text-[#6B7280] py-8 text-center">Nema faktura za prikaz.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Klijent
                  </th>
                  <th className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    {tip === "kasni" ? "Dospijeće" : tip === "placeno" ? "Plaćeno" : "Datum"}
                  </th>
                  {tip === "ukupno" ? (
                    <th className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Status
                    </th>
                  ) : tip === "kasni" ? (
                    <th className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Kasni (dana)
                    </th>
                  ) : null}
                  <th className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF] text-right">
                    {tip === "kasni" ? "Dug" : "Iznos"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((f) => {
                  const initials = initialsFromName(f.klijentNaziv || "?");
                  const avatarCls = avatarClassFromInitials(initials);
                  const kasniDana = daysLate(f.datumPlacanja);
                  const statusLabel: Record<FakturaStatus, string> = {
                    placeno: "Plaćeno",
                    na_cekanju: "Na čekanju",
                    kasni: "Kasni",
                    nacrt: "Nacrt",
                  };

                  return (
                    <tr key={f.id} className="border-b border-[#F3F4F6] last:border-0">
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarCls}`}
                          >
                            {initials}
                          </span>
                          <span className="font-semibold text-[#111827] truncate">
                            {f.klijentNaziv || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-[#6B7280] whitespace-nowrap">
                        {tip === "ukupno"
                          ? formatDatumKratki(f.datumIzdavanja)
                          : formatDatumKratki(f.datumPlacanja || f.datumIzdavanja)}
                      </td>
                      {tip === "ukupno" ? (
                        <td className="py-4">
                          <span
                            className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${
                              f.status === "placeno"
                                ? "bg-[#DCFCE7] text-[#16A34A]"
                                : f.status === "kasni"
                                  ? "bg-[#FEE2E2] text-[#DC2626]"
                                  : f.status === "na_cekanju"
                                    ? "bg-[#FFEDD5] text-[#EA580C]"
                                    : "bg-[#F1F5F9] text-[#64748B]"
                            }`}
                          >
                            {statusLabel[f.status]}
                          </span>
                        </td>
                      ) : tip === "kasni" ? (
                        <td className="py-4 text-sm font-medium text-[#EF4444] whitespace-nowrap">
                          {kasniDana} {kasniDana === 1 ? "dan" : "dana"}
                        </td>
                      ) : null}
                      <td className="py-4 text-sm font-bold text-[#111827] text-right whitespace-nowrap">
                        {formatIznosCijeli(f.iznos)} BAM
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E5E7EB] flex justify-end items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-[#6B7280] px-3 py-2 hover:text-[#111827] transition-colors"
          >
            Otkaži
          </button>
          {meta.primaryAction ? (
            <button
              type="button"
              onClick={posaljiPodsjetnike}
              disabled={rows.length === 0}
              className="rounded-lg bg-[#EF4444] text-white text-sm font-semibold px-5 py-2.5 shadow-sm hover:bg-[#DC2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {meta.primaryAction}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
