import { notFound } from "next/navigation";
import DashboardHeader from "@/app/components/DashboardHeader";
import SablonForma from "@/app/dashboard/sabloni/SablonForma";
import { ucitajSablon } from "@/app/dashboard/sabloni/actions";
import { fetchKlijentiList } from "@/lib/klijenti.server";
import { createClient } from "@/utils/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function IzmenaSablonaPage({ params }: Props) {
  const { id } = await params;
  const sablon = await ucitajSablon(id);
  if (!sablon) notFound();

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
      <DashboardHeader title="Izmjena šablona" subtitle={sablon.naziv} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <SablonForma initial={sablon} klijenti={klijenti} />
      </main>
    </>
  );
}
