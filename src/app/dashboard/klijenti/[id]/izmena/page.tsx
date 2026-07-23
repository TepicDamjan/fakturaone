import { notFound } from "next/navigation";
import { fetchKlijentById } from "@/lib/klijenti.server";
import { createClient } from "@/utils/supabase/server";
import IzmenaKlijentaForm from "./IzmenaKlijentaForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function IzmenaKlijentaPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const klijent = await fetchKlijentById(supabase, id);
  if (!klijent) notFound();

  return <IzmenaKlijentaForm klijent={klijent} />;
}
