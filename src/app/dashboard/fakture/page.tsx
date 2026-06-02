import DashboardHeader from "@/app/components/DashboardHeader";
import FaktureLista from "@/app/components/FaktureLista";
import KreirajDokumentDugme from "@/app/components/KreirajDokumentDugme";
import { createClient } from "@/utils/supabase/server";
import { fetchFaktureLista } from "@/lib/fakture.server";

export default async function Fakture() {
  const supabase = await createClient();
  const fakture = await fetchFaktureLista(supabase);

  return (
    <>
      <DashboardHeader
        title="Dokumenti"
        subtitle="Upravljajte svim svojim fakturama, predračunima i otpremnicama"
        rightContent={<KreirajDokumentDugme />}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
        <FaktureLista fakture={fakture} />
      </main>
    </>
  );
}
