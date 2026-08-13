import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardHeader from "@/app/components/DashboardHeader";
import { createClient } from "@/utils/supabase/server";
import { fetchKlijentById } from "@/lib/klijenti.server";
import { fetchFaktureLista } from "@/lib/fakture.server";
import { fetchPodesavanjaFirme } from "@/lib/firma.server";
import { formatKlijentAdresa } from "@/lib/klijenti";
import { formatDatumKratki, formatIznosValuta } from "@/lib/dokument/format";
import { jeFinansijskiDokument, metaZaTip } from "@/lib/tipDokumenta";

export default async function KlijentKarticaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const klijent = await fetchKlijentById(supabase, id);
  if (!klijent) notFound();

  let valuta = "BAM";
  try {
    const { firma } = await fetchPodesavanjaFirme(supabase);
    valuta = firma?.valuta?.trim() || "BAM";
  } catch {
    valuta = "BAM";
  }

  const sve = await fetchFaktureLista(supabase);
  const { data: veze } = await supabase
    .from("fakture")
    .select("id")
    .eq("klijent_id", klijent.id);
  const ids = new Set((veze ?? []).map((r) => r.id));
  const dokumenti = sve.filter((f) => ids.has(f.id));

  const finansijski = dokumenti.filter((f) =>
    jeFinansijskiDokument(f.tipDokumenta)
  );
  const fakturisano = finansijski.reduce((s, f) => s + f.iznos, 0);
  const placeno = finansijski
    .filter((f) => f.status === "placeno")
    .reduce((s, f) => s + f.iznos, 0);
  const dug = finansijski
    .filter((f) => f.status === "na_cekanju" || f.status === "kasni")
    .reduce((s, f) => s + Math.max(0, f.iznos - f.placenoIznos), 0);

  const adresa = formatKlijentAdresa(klijent);

  return (
    <>
      <DashboardHeader
        title={klijent.naziv}
        subtitle="Kartica klijenta"
        rightContent={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/klijenti/${klijent.id}/izmena`}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#64748B] hover:text-fcrna"
            >
              Izmijeni
            </Link>
            <Link
              href={`/dashboard/fakture/novafakturaforma?tip=faktura&klijent=${klijent.id}`}
              className="rounded-lg bg-[#137FEC] px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              Nova faktura
            </Link>
          </div>
        }
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <section className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-3">
              Podaci
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[#94A3B8]">JIB/PIB</dt>
                <dd className="font-medium text-fcrna">{klijent.pib || "—"}</dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">Matični broj</dt>
                <dd className="font-medium text-fcrna">
                  {klijent.maticni_broj || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">Email</dt>
                <dd className="font-medium text-fcrna">{klijent.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">Telefon</dt>
                <dd className="font-medium text-fcrna">
                  {klijent.telefon || "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[#94A3B8]">Adresa</dt>
                <dd className="font-medium text-fcrna">{adresa || "—"}</dd>
              </div>
            </dl>
          </section>
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-bold text-[#64748B] uppercase tracking-wider">
              Saldo
            </h2>
            <p className="flex justify-between text-sm">
              <span className="text-[#64748B]">Fakturisano</span>
              <span className="font-semibold">
                {formatIznosValuta(fakturisano, valuta, true)}
              </span>
            </p>
            <p className="flex justify-between text-sm">
              <span className="text-[#64748B]">Naplaćeno</span>
              <span className="font-semibold text-emerald-700">
                {formatIznosValuta(placeno, valuta, true)}
              </span>
            </p>
            <p className="flex justify-between text-sm border-t border-gray-100 pt-3">
              <span className="text-[#64748B]">Dug</span>
              <span className="font-bold text-fplava">
                {formatIznosValuta(dug, valuta, true)}
              </span>
            </p>
          </section>
        </div>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <header className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-fcrna">Dokumenti</h2>
          </header>
          {dokumenti.length === 0 ? (
            <p className="p-6 text-sm text-[#64748B]">Nema dokumenata za ovog klijenta.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-fsiva/60 text-left text-xs uppercase text-[#64748B]">
                    <th className="px-5 py-3">Broj</th>
                    <th className="px-5 py-3">Tip</th>
                    <th className="px-5 py-3">Datum</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Iznos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dokumenti.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-3">
                        <Link
                          href={`/dashboard/fakture/${f.id}/pregled`}
                          className="font-semibold text-fplava hover:underline"
                        >
                          {f.broj}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        {metaZaTip(f.tipDokumenta).naziv}
                      </td>
                      <td className="px-5 py-3 text-[#64748B]">
                        {formatDatumKratki(f.datumIzdavanja)}
                      </td>
                      <td className="px-5 py-3 text-[#64748B]">{f.status}</td>
                      <td className="px-5 py-3 text-right font-semibold">
                        {formatIznosValuta(f.iznos, valuta, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
