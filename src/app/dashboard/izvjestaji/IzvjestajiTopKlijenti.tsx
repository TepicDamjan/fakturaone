import Link from "next/link";
import { formatIzvjestajIznos, type TopKlijentRed } from "@/lib/izvjestaji";

type Props = {
  redovi: TopKlijentRed[];
  valuta: string;
};

export default function IzvjestajiTopKlijenti({ redovi, valuta }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-fcrna">Top klijenti</h2>
        <p className="text-sm text-[#64748B] mt-0.5">
          Po naplaćenom iznosu u periodu
        </p>
      </div>

      {redovi.length === 0 ? (
        <p className="px-6 py-10 text-sm text-[#64748B]">
          Nema plaćenih faktura sa klijentima u periodu.
        </p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {redovi.map((r, i) => (
            <li
              key={`${r.naziv}-${i}`}
              className="flex items-center justify-between gap-4 px-6 py-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-bold text-[#137FEC]">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-fcrna truncate">{r.naziv}</p>
                  <p className="text-xs text-[#64748B]">
                    {r.brojFaktura}{" "}
                    {r.brojFaktura === 1 ? "faktura" : "fakture"}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-fcrna tabular-nums shrink-0">
                {formatIzvjestajIznos(r.iznos, valuta)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="px-6 py-3 bg-[#F8FAFC] border-t border-gray-100">
        <Link
          href="/dashboard/klijenti"
          className="text-sm font-semibold text-fplava hover:text-blue-700"
        >
          Svi klijenti →
        </Link>
      </div>
    </div>
  );
}
