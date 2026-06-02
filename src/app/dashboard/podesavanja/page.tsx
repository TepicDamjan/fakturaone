import DashboardHeader from "@/app/components/DashboardHeader";
import PodesavanjaTabs from "@/app/dashboard/podesavanja/PodesavanjaTabs";
import { logout } from "@/app/login/actions";
import { fetchPodesavanjaFirme } from "@/lib/firma.server";
import { createClient } from "@/utils/supabase/server";

function metaText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function prikaznoIme(meta: Record<string, unknown>, email: string | null): string {
  const ime =
    metaText(meta.full_name) ||
    metaText(meta.name) ||
    metaText(meta.display_name);
  if (ime.trim()) return ime.trim();
  if (email) return email.split("@")[0];
  return "";
}

export default async function Podesavanja() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let firma = null;
  let racuni: Awaited<ReturnType<typeof fetchPodesavanjaFirme>>["racuni"] = [];

  try {
    const data = await fetchPodesavanjaFirme(supabase);
    firma = data.firma;
    racuni = data.racuni;
  } catch {
    firma = null;
    racuni = [];
  }

  const meta = (user?.user_metadata as Record<string, unknown> | undefined) ?? {};
  const avatarUrl = metaText(meta.avatar_url);
  const korisnik = {
    ime: prikaznoIme(meta, user?.email ?? null),
    email: user?.email ?? "",
    telefon: metaText(meta.telefon),
    pozicija: metaText(meta.pozicija),
    avatarUrl: avatarUrl || null,
  };

  return (
    <>
      <DashboardHeader
        title="Podešavanja"
        subtitle="Upravljajte informacijama o nalogu i firmi"
        rightContent={
          <>
            <div className="hidden sm:block w-px h-6 bg-gray-200" />
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                Odjavi se
              </button>
            </form>
          </>
        }
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-6xl mx-auto">
        <PodesavanjaTabs
          initialFirma={firma}
          initialRacuni={racuni}
          korisnik={korisnik}
        />
      </main>
    </>
  );
}
