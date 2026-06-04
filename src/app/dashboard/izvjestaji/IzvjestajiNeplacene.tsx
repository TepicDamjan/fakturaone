import Link from "next/link";
import type { FakturaListItem } from "@/lib/fakture";
import { formatIzvjestajIznos } from "@/lib/izvjestaji";

const STATUS_LABEL: Record<string, string> = {
  na_cekanju: "Na čekanju",
  kasni: "Kasni",
};

const STATUS_BADGE: Record<string, string> = {
  na_cekanju: "bg-orange-50 text-orange-700 border border-orange-100",
  kasni: "bg-red-50 text-red-700 border border-red-100",
};

function formatDatum(iso: string) {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("bs-Latn-BA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Props = {
  fakture: FakturaListItem[];
  valuta: string;
};

export default function IzvjestajiNeplacene({ fakture, valuta }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-fcrna">Neplaćene fakture</h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Na čekanju i kasne u izabranom periodu
          </p>
        </div>
        <Link
          href="/dashboard/fakture"
          className="text-sm font-semibold text-fplava hover:text-blue-700"
        >
          Sve fakture →
        </Link>
      </div>

      {fakture.length === 0 ? (
        <p className="px-6 py-10 text-sm text-[#64748B]">
          Nema neplaćenih faktura u periodu — odlično!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] text-left text-xs font-bold text-[#64748B] uppercase tracking-wide">
                <th className="px-6 py-3">Broj</th>
                <th className="px-6 py-3">Klijent</th>
                <th className="px-6 py-3">Rok</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Iznos</th>
              </tr>
            </thead>
            <tbody>
              {fakture.map((f) => (
                <tr
                  key={f.id}
                  className="border-t border-gray-50 hover:bg-[#F8FAFC]/80"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/fakture/${f.id}/pregled`}
                      className="font-semibold text-fplava hover:underline"
                    >
                      #{f.broj}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-fcrna">
                    {f.klijentNaziv || "—"}
                  </td>
                  <td className="px-6 py-4 text-[#64748B]">
                    {formatDatum(f.datumPlacanja)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[f.status] ?? ""}`}
                    >
                      {STATUS_LABEL[f.status] ?? f.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold tabular-nums text-fcrna">
                    {formatIzvjestajIznos(f.iznos, valuta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
