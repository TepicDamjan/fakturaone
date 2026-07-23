"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Proizvod } from "@/lib/proizvodi";
import { obrisiProizvod } from "@/app/dashboard/proizvodi/actions";
import { useToast } from "@/app/components/toast/ToastContext";

function formatCena(n: number) {
  return n.toLocaleString("bs-Latn-BA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ProizvodiTabela({
  proizvodi,
}: {
  proizvodi: Proizvod[];
}) {
  const router = useRouter();
  const { prikaziToast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleObrisi = async (proizvod: Proizvod) => {
    if (
      !window.confirm(
        `Obrisati proizvod „${proizvod.naziv}“? Ova radnja se ne može poništiti.`
      )
    ) {
      return;
    }
    setBusyId(proizvod.id);
    try {
      const res = await obrisiProizvod(proizvod.id);
      if (!res.ok) {
        prikaziToast({ tip: "greska", poruka: res.error });
        return;
      }
      prikaziToast({ tip: "uspeh", poruka: `Proizvod „${proizvod.naziv}“ je obrisan.` });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="bg-fsiva/80 border-b border-gray-100">
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Naziv
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Jedinica
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">
                Cena
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {proizvodi.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-semibold text-fcrna">{p.naziv}</p>
                  {p.opis ? (
                    <p className="text-xs text-[#64748B] truncate max-w-md">{p.opis}</p>
                  ) : null}
                </td>
                <td className="px-6 py-4 text-[#64748B]">{p.jedinica}</td>
                <td className="px-6 py-4 text-right font-bold text-fcrna tabular-nums whitespace-nowrap">
                  {formatCena(Number(p.cena))}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/proizvodi/${p.id}/izmena`}
                      className="px-3 py-1.5 rounded-lg border border-ftsiva text-xs font-medium text-fcrna hover:bg-fsiva transition-colors"
                    >
                      Izmeni
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => handleObrisi(p)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Obriši
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {proizvodi.length === 0 ? (
        <div className="px-6 py-16 text-center text-[#64748B] text-sm">
          Još nemate proizvoda u katalogu. Dodajte proizvode i usluge da biste
          brže popunjavali stavke faktura.
        </div>
      ) : null}
    </div>
  );
}
