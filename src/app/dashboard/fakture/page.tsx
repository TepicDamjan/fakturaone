import DashboardHeader from "@/app/components/DashboardHeader";
import FaktureLista from "@/app/components/FaktureLista";
import KreirajDokumentDugme from "@/app/components/KreirajDokumentDugme";
import { createClient } from "@/utils/supabase/server";
import { fetchFakturePage } from "@/lib/fakture.server";
import { parseFaktureParams } from "@/lib/faktureFilter";
import { fetchPodesavanjaFirme } from "@/lib/firma.server";

export default async function Fakture({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseFaktureParams(await searchParams);
  const supabase = await createClient();
  const page = await fetchFakturePage(supabase, params.filter, params.strana);
  let valuta = "BAM";
  try {
    const { firma } = await fetchPodesavanjaFirme(supabase);
    valuta = firma?.valuta?.trim() || "BAM";
  } catch {
    valuta = "BAM";
  }

  return (
    <>
      <DashboardHeader
        title="Dokumenti"
        subtitle="Upravljajte svim svojim fakturama, predračunima i otpremnicama"
        rightContent={<KreirajDokumentDugme />}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
        <FaktureLista
          fakture={page.items}
          ukupno={page.ukupno}
          strana={page.strana}
          poStrani={page.poStrani}
          q={params.q}
          status={params.status}
          tip={params.tip}
          datum={params.datum}
          valuta={valuta}
        />
      </main>
    </>
  );
}
