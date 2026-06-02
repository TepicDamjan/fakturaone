import { redirect } from "next/navigation";
import IzborFirmeSadrzaj from "@/app/components/IzborFirmeSadrzaj";
import { fetchFirmeLista, type FirmaListItem } from "@/lib/firma";
import { createClient } from "@/utils/supabase/server";

export default async function IzborFirmePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let firme: FirmaListItem[] = [];
  try {
    firme = await fetchFirmeLista(supabase);
  } catch {
    firme = [];
  }

  return <IzborFirmeSadrzaj firme={firme} />;
}
