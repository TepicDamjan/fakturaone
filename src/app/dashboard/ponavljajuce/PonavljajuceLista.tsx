"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  obrisiPonavljajucu,
  promeniAktivnostPonavljajuce,
} from "@/app/dashboard/sabloni/actions";
import { useToast } from "@/app/components/toast/ToastContext";

type Red = {
  id: string;
  naziv: string;
  klijentNaziv: string;
  frekvencijaLabel: string;
  sljedeciDatum: string;
  aktivan: boolean;
};

export default function PonavljajuceLista({ items }: { items: Red[] }) {
  const router = useRouter();
  const { prikaziToast } = useToast();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-[#F8FAFC] border-b border-gray-100">
          <tr>
            <th className="px-4 py-3 text-sm font-semibold text-[#64748B]">Naziv</th>
            <th className="px-4 py-3 text-sm font-semibold text-[#64748B]">Klijent</th>
            <th className="px-4 py-3 text-sm font-semibold text-[#64748B]">Frekvencija</th>
            <th className="px-4 py-3 text-sm font-semibold text-[#64748B]">Sljedeći</th>
            <th className="px-4 py-3 text-sm font-semibold text-[#64748B]">Status</th>
            <th className="px-4 py-3 text-sm font-semibold text-[#64748B] text-right">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-t border-gray-50">
              <td className="px-4 py-3 font-medium text-fcrna">{r.naziv}</td>
              <td className="px-4 py-3 text-sm text-[#64748B]">{r.klijentNaziv}</td>
              <td className="px-4 py-3 text-sm text-[#64748B]">{r.frekvencijaLabel}</td>
              <td className="px-4 py-3 text-sm text-[#64748B]">{r.sljedeciDatum}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    r.aktivan
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {r.aktivan ? "Aktivan" : "Pauziran"}
                </span>
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <Link
                  href={`/dashboard/ponavljajuce/${r.id}`}
                  className="text-sm font-medium text-fplava hover:underline"
                >
                  Uredi
                </Link>
                <button
                  type="button"
                  className="text-sm font-medium text-[#64748B] hover:text-fcrna"
                  onClick={async () => {
                    const rez = await promeniAktivnostPonavljajuce(r.id, !r.aktivan);
                    if (!rez.ok) {
                      prikaziToast({ tip: "greska", poruka: rez.error });
                      return;
                    }
                    router.refresh();
                  }}
                >
                  {r.aktivan ? "Pauziraj" : "Aktiviraj"}
                </button>
                <button
                  type="button"
                  className="text-sm font-medium text-red-600"
                  onClick={async () => {
                    if (!window.confirm(`Obrisati „${r.naziv}“?`)) return;
                    const rez = await obrisiPonavljajucu(r.id);
                    if (!rez.ok) {
                      prikaziToast({ tip: "greska", poruka: rez.error });
                      return;
                    }
                    prikaziToast({ tip: "uspeh", poruka: "Obrisano." });
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
