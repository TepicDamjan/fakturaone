import { formatIzvjestajIznos, type AgingBucket } from "@/lib/izvjestaji";

export default function IzvjestajiAging({
  buckets,
  valuta,
}: {
  buckets: AgingBucket[];
  valuta: string;
}) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-fcrna mb-4">Starenje potraživanja</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {buckets.map((b) => (
          <div key={b.id} className="rounded-lg bg-fsiva/60 p-3">
            <p className="text-xs text-[#64748B]">{b.label}</p>
            <p className="text-lg font-bold text-fcrna mt-1">
              {formatIzvjestajIznos(b.iznos, valuta)}
            </p>
            <p className="text-xs text-[#94A3B8]">{b.broj} dokumenata</p>
          </div>
        ))}
      </div>
    </section>
  );
}
