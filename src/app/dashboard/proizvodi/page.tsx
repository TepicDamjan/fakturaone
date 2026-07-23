import Link from "next/link";
import DashboardHeader from "@/app/components/DashboardHeader";
import ProizvodiTabela from "@/app/components/ProizvodiTabela";
import { fetchProizvodiList } from "@/lib/proizvodi.server";
import type { Proizvod } from "@/lib/proizvodi";
import { createClient } from "@/utils/supabase/server";

export default async function Proizvodi() {
  const supabase = await createClient();
  let proizvodi: Proizvod[] = [];
  try {
    proizvodi = await fetchProizvodiList(supabase);
  } catch {
    proizvodi = [];
  }

  return (
    <>
      <DashboardHeader
        title="Proizvodi i usluge"
        subtitle="Vaš katalog za brže fakturisanje"
        rightContent={
          <>
            <div className="hidden sm:block w-px h-6 bg-gray-200" />
            <Link
              href="/dashboard/proizvodi/novi"
              className="bg-[#137FEC] hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 sm:px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Dodaj proizvod</span>
              <span className="sm:hidden">Dodaj</span>
            </Link>
          </>
        }
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
        <ProizvodiTabela proizvodi={proizvodi} />
      </main>
    </>
  );
}
