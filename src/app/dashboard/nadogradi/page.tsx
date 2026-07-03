import Link from "next/link";
import DashboardHeader from "@/app/components/DashboardHeader";
import NadogradiPlanovi from "@/app/dashboard/nadogradi/NadogradiPlanovi";
import { freemiusConfigured } from "@/lib/freemius";
import { fetchPretplataPregled } from "@/lib/pretplata.server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ uspesno?: string; greska?: string }>;
};

const GRESKA_PORUKE: Record<string, string> = {
  nevalidan_potpis: "Verifikacija uplate nije uspela. Kontaktirajte podršku ako je uplata prošla.",
  nedostaju_podataci: "Nedostaju podaci o kupovini. Pokušajte ponovo ili sačekajte webhook.",
  sync: "Uplata je primljena, ali sinhronizacija naloga nije uspela. Obratite nam se.",
  server: "Došlo je do greške na serveru. Pokušajte ponovo.",
  placanje_nije_podeseno: "Plaćanje još nije aktivirano na serveru.",
};

export default async function NadogradiPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const pretplata = await fetchPretplataPregled(supabase, user.id);
  const sp = await searchParams;
  const placanjeAktivno = freemiusConfigured();

  return (
    <>
      <DashboardHeader
        title="Planovi i pretplata"
        subtitle="Izaberite paket koji odgovara vašem poslovanju"
      />

      <main className="flex-1 p-6 sm:p-8 overflow-y-auto w-full max-w-6xl mx-auto">
        {sp.uspesno === "1" ? (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="text-sm text-emerald-800 font-medium">
              Plaćanje je uspešno! Vaš plan je ažuriran.
            </p>
          </div>
        ) : null}

        {sp.greska ? (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm text-amber-900">
              {GRESKA_PORUKE[sp.greska] ?? "Došlo je do greške pri obradi uplate."}
            </p>
          </div>
        ) : null}

        {pretplata.isTrial ? (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
            <p className="text-sm text-[#1E3A8A]">
              Trenutno ste u{" "}
              <span className="font-semibold">probnom periodu ({pretplata.tierLabel})</span>.
              {pretplata.trialDaysLeft != null ? (
                <>
                  {" "}
                  Preostalo je{" "}
                  <span className="font-semibold">
                    {pretplata.trialDaysLeft}{" "}
                    {pretplata.trialDaysLeft === 1 ? "dan" : "dana"}
                  </span>
                  .
                </>
              ) : null}{" "}
              Posle isteka vraćate se na Starter plan sa ograničenjima.
            </p>
          </div>
        ) : null}

        <NadogradiPlanovi
          trenutniPlan={pretplata.tier}
          placanjeAktivno={placanjeAktivno}
        />

        <p className="mt-8 text-center text-sm text-[#64748B]">
          Plaćanje se obrađuje preko{" "}
          <span className="font-semibold text-fcrna">Freemius</span> (kartica, PayPal). Za
          Enterprise plan{" "}
          <Link href="/#kontakt" className="font-semibold text-fplava hover:text-blue-700">
            kontaktirajte nas
          </Link>
          .
        </p>
      </main>
    </>
  );
}
