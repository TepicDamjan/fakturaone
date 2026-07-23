import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getAktivnaFirmaId } from "@/lib/aktivnaFirma.server";
import { fetchFakturaSaStavkama } from "@/lib/fakture.server";
import PregledDokumentaClient from "@/app/dashboard/fakture/[id]/pregled/PregledDokumentaClient";

function porukaZaGresku(greska: string | null): string {
  if (!greska) return "Dokument nije pronađen ili vam ne pripada.";
  if (greska === "Nije izabrano preduzeće.") {
    return "Nije izabrano preduzeće. Vratite se na izbor firme pa otvorite dokument ponovo.";
  }
  if (/column|schema cache|does not exist/i.test(greska)) {
    return "Baza nije ažurirana. U Supabase SQL Editoru pokrenite migracije 0019–0022, zatim osvježite schema cache (Settings → API → Reload).";
  }
  return greska;
}

export default async function SacuvanaFakturaPregledPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aktivnaFirmaId = await getAktivnaFirmaId();

  let payload = null;
  let greska: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      greska = "Niste prijavljeni. Osvežite stranicu ili se ponovo prijavite.";
    } else {
      payload = await fetchFakturaSaStavkama(supabase, id);
    }
  } catch (err) {
    const msg =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : null;
    greska = msg || "Greška pri učitavanju dokumenta.";
  }

  if (!payload) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8FAFC] p-8">
        <p className="text-fcrna font-medium text-center max-w-lg">
          {porukaZaGresku(greska)}
        </p>
        <div className="text-xs text-[#94A3B8] text-center max-w-lg space-y-1 font-mono">
          <p>id: {id || "(prazno)"}</p>
          <p>aktivna_firma: {aktivnaFirmaId ? "da" : "ne"}</p>
          {greska ? <p className="break-all">detail: {greska}</p> : null}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/dashboard/fakture"
            className="text-fplava font-semibold hover:underline"
          >
            Nazad na listu
          </Link>
          <Link
            href="/izbor-firme"
            className="text-[#64748B] font-medium hover:underline"
          >
            Izbor firme
          </Link>
        </div>
      </div>
    );
  }

  return <PregledDokumentaClient fakturaId={id} initial={payload} />;
}
