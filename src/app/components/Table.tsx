"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FakturaAkcijeMeni from "@/app/components/FakturaAkcijeMeni";

export interface Invoice {
  /** UUID fakture u bazi */
  id: string;
  /** Prikaz u koloni „ID fakture“ (npr. #INV-12) */
  displayBroj: string;
  /** Broj bez # — za potvrdu brisanja i subject mejla */
  broj: string;
  clientEmail: string;
  clientInitials: string;
  clientName: string;
  date: string;
  amount: string;
  status: "Plaćeno" | "Na čekanju" | "Kasni" | "Nacrt";
}

interface TableProps {
  invoices: Invoice[];
  /** Tekst ispod tabele (npr. „Prikazano 1 do 5 od 12 rezultata”). */
  footerSummary?: string;
}

function avatarClassFromInitials(initials: string): string {
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
    "bg-indigo-100 text-indigo-600",
    "bg-emerald-100 text-emerald-600",
    "bg-amber-100 text-amber-700",
    "bg-cyan-100 text-cyan-700",
    "bg-violet-100 text-violet-700",
  ];
  let h = 0;
  for (let i = 0; i < initials.length; i++) h = initials.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export default function Table({ invoices, footerSummary }: TableProps) {
  const router = useRouter();
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

  const getStatusStyles = (status: Invoice["status"]) => {
    switch (status) {
      case "Plaćeno":
        return "bg-[#DCFCE7] text-[#16A34A]";
      case "Na čekanju":
        return "bg-[#FFEDD5] text-[#EA580C]";
      case "Kasni":
        return "bg-[#FEE2E2] text-[#DC2626]";
      case "Nacrt":
        return "bg-[#F1F5F9] text-[#64748B]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAvatarColor = (initials: string) => avatarClassFromInitials(initials);

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-gray-100">
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-sm font-semibold text-[#64748B] whitespace-nowrap">
                ID Fakture
              </th>
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-sm font-semibold text-[#64748B] whitespace-nowrap">
                Naziv klijenta
              </th>
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-sm font-semibold text-[#64748B] whitespace-nowrap">
                Datum
              </th>
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-sm font-semibold text-[#64748B] whitespace-nowrap">
                Iznos
              </th>
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-sm font-semibold text-[#64748B] whitespace-nowrap">
                Status
              </th>
              <th className="py-4 px-6 text-sm font-semibold text-[#64748B] text-right whitespace-nowrap">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 px-6 text-center text-sm text-[#64748B]">
                  Još nema faktura. Kreirajte prvu fakturu da bi se pojavila ovde.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-sm font-bold text-[#0F172A] whitespace-nowrap">
                    {invoice.displayBroj}
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(invoice.clientInitials)}`}
                      >
                        {invoice.clientInitials}
                      </div>
                      <span className="text-sm font-medium text-[#475569]">{invoice.clientName}</span>
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-sm font-medium text-[#64748B] whitespace-nowrap">
                    {invoice.date}
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-sm font-bold text-[#0F172A] whitespace-nowrap">
                    {invoice.amount}
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(invoice.status)}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-right whitespace-nowrap">
                    <FakturaAkcijeMeni
                      fakturaId={invoice.id}
                      broj={invoice.broj}
                      klijentEmail={invoice.clientEmail}
                      menuOpen={openMenuId === invoice.id}
                      onToggleMenu={() =>
                        setOpenMenuId((cur) => (cur === invoice.id ? null : invoice.id))
                      }
                      onCloseMenu={() => setOpenMenuId(null)}
                      routerRefresh={() => router.refresh()}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-[#F8FAFC] border-t border-gray-100 px-4 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-[#64748B]">
          {footerSummary ?? "Prikazano 1 do 5 od 12 rezultata"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-sm font-medium text-[#94A3B8] bg-transparent border border-transparent rounded-lg hover:text-[#64748B] transition-colors disabled:opacity-50"
            disabled
          >
            Prethodno
          </button>
          <button
            type="button"
            className="px-4 py-1.5 text-sm font-medium text-[#0F172A] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Sledeće
          </button>
        </div>
      </div>
    </div>
  );
}
