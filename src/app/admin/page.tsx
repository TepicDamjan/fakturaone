import { PLANS_ORDER, planLabel } from "@/lib/plans";
import { fetchAdminKorisnici } from "@/app/admin/data";

export const dynamic = "force-dynamic";

function StatKartica({ label, vrednost }: { label: string; vrednost: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <p className="text-sm text-[#64748B]">{label}</p>
      <p className="mt-1 text-3xl font-bold text-fcrna">{vrednost}</p>
    </div>
  );
}

export default async function AdminPregledPage() {
  const korisnici = await fetchAdminKorisnici();

  const pre30Dana = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const ukupno = korisnici.length;
  const noviMesecno = korisnici.filter(
    (k) => new Date(k.registrovan).getTime() >= pre30Dana
  ).length;
  const aktivniTrialovi = korisnici.filter((k) => k.isTrial).length;
  const placenePretplate = korisnici.filter(
    (k) => !k.isTrial && k.efektivniPlan !== "starter" && !k.rucniGrant
  ).length;
  const rucniGrantovi = korisnici.filter(
    (k) => k.rucniGrant && k.efektivniPlan !== "starter"
  ).length;

  const poPlanu = PLANS_ORDER.map((tier) => ({
    tier,
    label: planLabel(tier),
    broj: korisnici.filter((k) => k.efektivniPlan === tier).length,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-fcrna">Pregled</h1>
      <p className="mt-1 text-sm text-[#64748B]">
        Osnovne statistike korisnika i pretplata.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatKartica label="Ukupno korisnika" vrednost={ukupno} />
        <StatKartica label="Novi (30 dana)" vrednost={noviMesecno} />
        <StatKartica label="Aktivni trialovi" vrednost={aktivniTrialovi} />
        <StatKartica label="Plaćene pretplate" vrednost={placenePretplate} />
        <StatKartica label="Ručno dodeljeni planovi" vrednost={rucniGrantovi} />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-fcrna">
        Raspodela po efektivnom planu
      </h2>
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {poPlanu.map((p) => (
          <div
            key={p.tier}
            className="rounded-xl border border-slate-200 bg-white px-5 py-4"
          >
            <p className="text-sm text-[#64748B]">{p.label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-fcrna">{p.broj}</p>
              <p className="text-xs text-[#94A3B8]">
                {ukupno > 0 ? Math.round((p.broj / ukupno) * 100) : 0}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
