import { notFound } from "next/navigation";
import { fetchProizvodById } from "@/lib/proizvodi.server";
import { createClient } from "@/utils/supabase/server";
import IzmenaProizvodaForm from "./IzmenaProizvodaForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function IzmenaProizvodaPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const proizvod = await fetchProizvodById(supabase, id);
  if (!proizvod) notFound();

  return <IzmenaProizvodaForm proizvod={proizvod} />;
}
