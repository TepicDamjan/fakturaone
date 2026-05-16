import DashboardHeader from "@/app/components/DashboardHeader";
import PodesavanjaFirmaForm from "@/app/dashboard/podesavanja/PodesavanjaFirmaForm";
import { logout } from "@/app/login/actions";
import { fetchPodesavanjaFirme } from "@/lib/firma";
import { createClient } from "@/utils/supabase/server";

export default async function Podesavanja() {
  const supabase = await createClient();
  let firma = null;
  let racuni: Awaited<ReturnType<typeof fetchPodesavanjaFirme>>["racuni"] = [];

  try {
    const data = await fetchPodesavanjaFirme(supabase);
    firma = data.firma;
    racuni = data.racuni;
  } catch {
    firma = null;
    racuni = [];
  }

  return (
    <>
      <DashboardHeader
        title="Podešavanja"
        subtitle="Upravljajte informacijama o nalogu i firmi"
        rightContent={
          <>
            <div className="w-px h-6 bg-gray-200" />
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                Odjavi se
              </button>
            </form>
          </>
        }
      />

      <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-6xl">
        <PodesavanjaFirmaForm initialFirma={firma} initialRacuni={racuni} />
      </main>
    </>
  );
}
