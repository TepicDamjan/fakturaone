import DashboardHeader from "@/app/components/DashboardHeader";
import PonavljajucaForma from "@/app/dashboard/ponavljajuce/PonavljajucaForma";
import { fetchKlijentiList } from "@/lib/klijenti.server";
import { createClient } from "@/utils/supabase/server";

export default async function NovaPonavljajucaPage() {
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
      <DashboardHeader
        title="Nova ponavljajuća faktura"
        subtitle="Automatsko izdavanje po rasporedu"
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <PonavljajucaForma klijenti={klijenti} />
      </main>
    </>
  );
}
