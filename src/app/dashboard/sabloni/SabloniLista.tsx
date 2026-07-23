"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { obrisiSablon } from "@/app/dashboard/sabloni/actions";
import { useToast } from "@/app/components/toast/ToastContext";

type Red = {
  id: string;
  naziv: string;
  tipNaziv: string;
  tipDokumenta: string;
  klijentNaziv: string;
  brojStavki: number;
};

export default function SabloniLista({ sabloni }: { sabloni: Red[] }) {
  const router = useRouter();
  const { prikaziToast } = useToast();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-[#F8FAFC] border-b border-gray-100">
          <tr>
            <th className="px-4 py-3 text-sm font-semibold text-[#64748B]">Naziv</th>
            <th className="px-4 py-3 text-sm font-semibold text-[#64748B]">Tip</th>
            <th className="px-4 py-3 text-sm font-semibold text-[#64748B]">Klijent</th>
            <th className="px-4 py-3 text-sm font-semibold text-[#64748B]">Stavke</th>
            <th className="px-4 py-3 text-sm font-semibold text-[#64748B] text-right">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {sabloni.map((s) => (
            <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50/50">
              <td className="px-4 py-3 font-medium text-fcrna">{s.naziv}</td>
              <td className="px-4 py-3 text-sm text-[#64748B]">{s.tipNaziv}</td>
              <td className="px-4 py-3 text-sm text-[#64748B]">
                {s.klijentNaziv || "—"}
              </td>
              <td className="px-4 py-3 text-sm text-[#64748B]">{s.brojStavki}</td>
              <td className="px-4 py-3 text-right space-x-2">
                <Link
                  href={`/dashboard/fakture/novafakturaforma?tip=${s.tipDokumenta}&sablon=${s.id}`}
                  className="text-sm font-semibold text-fplava hover:underline"
                >
                  Koristi
                </Link>
                <Link
                  href={`/dashboard/sabloni/${s.id}`}
                  className="text-sm font-medium text-[#64748B] hover:text-fcrna"
                >
                  Uredi
                </Link>
                <button
                  type="button"
                  className="text-sm font-medium text-red-600 hover:underline"
                  onClick={async () => {
                    if (!window.confirm(`Obrisati šablon „${s.naziv}“?`)) return;
                    const rez = await obrisiSablon(s.id);
                    if (!rez.ok) {
                      prikaziToast({ tip: "greska", poruka: rez.error });
                      return;
                    }
                    prikaziToast({ tip: "uspeh", poruka: "Šablon obrisan." });
                    router.refresh();
                  }}
                >
                  Obriši
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
