import Link from "next/link";
import { formatDatumKratki, formatIznosValuta } from "@/lib/dokument/format";
import type { KifRed } from "@/lib/izvjestaji";

export default function IzvjestajiKif({
  redovi,
  valuta,
}: {
  redovi: KifRed[];
  valuta: string;
}) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <header className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-bold text-fcrna">Knjiga izlaznih faktura (KIF)</h2>
      </header>
      {redovi.length === 0 ? (
        <p className="p-6 text-sm text-[#64748B]">Nema izlaznih dokumenata u periodu.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-fsiva/60 text-left text-xs uppercase text-[#64748B]">
                <th className="px-4 py-3">Datum</th>
                <th className="px-4 py-3">Broj</th>
                <th className="px-4 py-3">Klijent</th>
                <th className="px-4 py-3">JIB</th>
                <th className="px-4 py-3 text-right">Osnovica</th>
                <th className="px-4 py-3 text-right">PDV</th>
                <th className="px-4 py-3 text-right">Ukupno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {redovi.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2.5 text-[#64748B]">
                    {formatDatumKratki(r.datum)}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/dashboard/fakture/${r.id}/pregled`}
                      className="font-semibold text-fplava hover:underline"
                    >
                      {r.broj}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">{r.klijent}</td>
                  <td className="px-4 py-2.5 text-[#64748B]">{r.jib}</td>
                  <td className="px-4 py-2.5 text-right">
                    {formatIznosValuta(r.osnovica, valuta)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {formatIznosValuta(r.pdvIznos, valuta)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold">
                    {formatIznosValuta(r.ukupno, valuta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
