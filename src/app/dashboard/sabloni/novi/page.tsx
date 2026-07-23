import DashboardHeader from "@/app/components/DashboardHeader";
import SablonForma from "@/app/dashboard/sabloni/SablonForma";
import { fetchKlijentiList } from "@/lib/klijenti.server";
import { createClient } from "@/utils/supabase/server";

export default async function NoviSablonPage() {
  const supabase = await createClient();
  let klijenti: { id: string; naziv: string }[] = [];
  try {
    const list = await fetchKlijentiList(supabase);
    klijenti = list.map((k) => ({ id: k.id, naziv: k.naziv }));
  } catch {
    klijenti = [];
  }

  return (
    <>
      <DashboardHeader title="Novi šablon" subtitle="Sačuvajte čest dokument za brzo kreiranje" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <SablonForma klijenti={klijenti} />
      </main>
    </>
  );
}
