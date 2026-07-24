import { fetchAdminKorisnici, type AdminKorisnik } from "@/app/admin/data";
import PlanAkcije from "@/app/admin/korisnici/PlanAkcije";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

function formatDatum(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("sr-Latn", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function StatusBadge({ korisnik }: { korisnik: AdminKorisnik }) {
  if (korisnik.isTrial) {
    return (
      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#1E3A8A]">
        Trial
      </span>
    );
  }

  if (korisnik.efektivniPlan !== "starter") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        {korisnik.rucniGrant ? "Ručno dodeljen" : "Aktivna pretplata"}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-[#64748B]">
      Starter
    </span>
  );
}

export default async function AdminKorisniciPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const upit = (sp.q ?? "").trim().toLowerCase();

  const svi = await fetchAdminKorisnici();
  const korisnici = upit
    ? svi.filter(
        (k) =>
          k.email.toLowerCase().includes(upit) ||
          (k.ime ?? "").toLowerCase().includes(upit)
      )
    : svi;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fcrna">Korisnici</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            {korisnici.length} {korisnici.length === 1 ? "korisnik" : "korisnika"}
            {upit ? ` za pretragu "${sp.q}"` : ""}
          </p>
        </div>

        <form className="flex gap-2" action="/admin/korisnici" method="get">
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Pretraga po emailu ili imenu..."
            className="w-72 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-fcrna placeholder:text-[#94A3B8] focus:border-fplava focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-fplava px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Traži
          </button>
        </form>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-[#64748B]">
              <th className="px-4 py-3 font-semibold">Korisnik</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Ističe</th>
              <th className="px-4 py-3 font-semibold">Registrovan</th>
              <th className="px-4 py-3 font-semibold text-right">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {korisnici.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#64748B]">
                  Nema korisnika za zadatu pretragu.
                </td>
              </tr>
            ) : (
              korisnici.map((k) => (
                <tr
                  key={k.id}
                  className="border-b border-slate-100 last:border-0 align-top"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-fcrna">{k.email}</p>
                    {k.ime ? <p className="text-xs text-[#64748B]">{k.ime}</p> : null}
                  </td>
                  <td className="px-4 py-3 font-medium text-fcrna">
                    {k.efektivniPlanLabel}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge korisnik={k} />
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {formatDatum(k.istice)}
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {formatDatum(k.registrovan)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PlanAkcije
                      userId={k.id}
                      imaPlan={!k.isTrial && k.efektivniPlan !== "starter"}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
