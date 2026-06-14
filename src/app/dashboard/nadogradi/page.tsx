import Link from "next/link";
import DashboardHeader from "@/app/components/DashboardHeader";
import NadogradiPlanovi from "@/app/dashboard/nadogradi/NadogradiPlanovi";
import { fetchPretplataPregled } from "@/lib/pretplata.server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function NadogradiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const pretplata = await fetchPretplataPregled(supabase, user.id);

  return (
    <>
      <DashboardHeader
        title="Planovi i pretplata"
        subtitle="Izaberite paket koji odgovara vašem poslovanju"
      />

      <main className="flex-1 p-6 sm:p-8 overflow-y-auto w-full max-w-6xl mx-auto">
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

        <NadogradiPlanovi trenutniPlan={pretplata.tier} />

        <p className="mt-8 text-center text-sm text-[#64748B]">
          Online plaćanje (Stripe) biće dostupno uskoro. Za Enterprise plan{" "}
          <Link href="/#kontakt" className="font-semibold text-fplava hover:text-blue-700">
            kontaktirajte nas
          </Link>
          .
        </p>
      </main>
    </>
  );
}
