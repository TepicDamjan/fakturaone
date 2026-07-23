import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { fetchFakturaSaStavkama } from "@/lib/fakture.server";
import PregledDokumentaClient from "@/app/dashboard/fakture/[id]/pregled/PregledDokumentaClient";

export default async function SacuvanaFakturaPregledPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let payload = null;
  let greska: string | null = null;

  try {
    const supabase = await createClient();
    payload = await fetchFakturaSaStavkama(supabase, id);
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
        <p className="text-fcrna font-medium text-center max-w-md">
          {greska === "Nije izabrano preduzeće."
            ? "Nije izabrano preduzeće. Vratite se na izbor firme pa otvorite dokument ponovo."
            : greska?.includes("column") || greska?.includes("schema cache")
              ? "Baza nije ažurirana. Pokrenite migracije 0019–0022 u Supabase, zatim osvježite stranicu."
              : "Dokument nije pronađen ili vam ne pripada."}
        </p>
        {greska &&
        greska !== "Nije izabrano preduzeće." &&
        !greska.includes("column") &&
        !greska.includes("schema cache") ? (
          <p className="text-sm text-[#64748B] text-center max-w-md">{greska}</p>
        ) : null}
        <Link
          href="/dashboard/fakture"
          className="text-fplava font-semibold hover:underline"
        >
          Nazad na listu
        </Link>
      </div>
    );
  }

  return <PregledDokumentaClient fakturaId={id} initial={payload} />;
}
