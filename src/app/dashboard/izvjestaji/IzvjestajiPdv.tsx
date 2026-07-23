import { formatIzvjestajIznos, type PdvPregled } from "@/lib/izvjestaji";

type Props = {
  pdv: PdvPregled;
  valuta: string;
};

export default function IzvjestajiPdv({ pdv, valuta }: Props) {
  const redovi = [
    { label: "Osnovica (bez PDV-a)", iznos: pdv.osnovica },
    { label: "PDV", iznos: pdv.pdvIznos },
    { label: "Popust", iznos: pdv.popust },
    { label: "Ukupno fakturisano", iznos: pdv.ukupno },
  ];

  return (
    <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-fcrna">PDV pregled</h2>
      <p className="mt-1 text-sm text-[#64748B]">
        Izlazni PDV za izabrani period (fakture i kreditne note, bez nacrta).
      </p>
      <dl className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {redovi.map((r) => (
          <div key={r.label} className="rounded-lg bg-[#F8FAFC] px-4 py-3">
            <dt className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">
              {r.label}
            </dt>
            <dd className="mt-1 text-lg font-bold text-fcrna tabular-nums">
              {formatIzvjestajIznos(r.iznos, valuta)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-[#64748B]">
        PDV za uplatu (izlazni):{" "}
        <span className="font-semibold text-fplava tabular-nums">
          {formatIzvjestajIznos(pdv.pdvZaUplatu, valuta)}
        </span>
      </p>
    </section>
  );
}
