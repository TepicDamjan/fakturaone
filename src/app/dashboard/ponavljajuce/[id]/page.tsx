import { notFound } from "next/navigation";
import DashboardHeader from "@/app/components/DashboardHeader";
import PonavljajucaForma from "@/app/dashboard/ponavljajuce/PonavljajucaForma";
import { createClient } from "@/utils/supabase/server";
import { requireAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import { fetchKlijentiList } from "@/lib/klijenti.server";
import { parseStavkeJson, type FrekvencijaPonavljanja } from "@/lib/sabloni";

type Props = { params: Promise<{ id: string }> };

export default async function IzmenaPonavljajucePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const firmaId = await requireAktivnaFirmaId();

  const { data } = await supabase
    .from("ponavljajuce_fakture")
    .select("*")
    .eq("id", id)
    .eq("firma_id", firmaId)
    .maybeSingle();

  if (!data) notFound();

  let klijenti: { id: string; naziv: string }[] = [];
  try {
    const list = await fetchKlijentiList(supabase);
    klijenti = list.map((k) => ({ id: k.id, naziv: k.naziv }));
  } catch {
    klijenti = [];
  }

  return (
    <>
      <DashboardHeader title="Izmjena rasporeda" subtitle={data.naziv} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <PonavljajucaForma
          klijenti={klijenti}
          initial={{
            id: data.id,
            naziv: data.naziv,
            klijentId: data.klijent_id,
            referenca: data.referenca ?? "",
            napomene: data.napomene ?? "",
            pdvProcenat: Number(data.pdv_procenat),
            popust: Number(data.popust),
            stavke: parseStavkeJson(data.stavke),
            frekvencija: data.frekvencija as FrekvencijaPonavljanja,
            rokPlacanjaDana: Number(data.rok_placanja_dana),
            sljedeciDatum: data.sljedeci_datum,
            aktivan: data.aktivan,
          }}
        />
      </main>
    </>
  );
}
