import Link from "next/link";
import DashboardHeader from "@/app/components/DashboardHeader";
import FaktureLista from "@/app/components/FaktureLista";
import { createClient } from "@/utils/supabase/server";
import { fetchFaktureLista } from "@/lib/fakture";

export default async function Fakture() {
  const supabase = await createClient();
  const fakture = await fetchFaktureLista(supabase);

  return (
    <>
      <DashboardHeader
        title="Fakture"
        subtitle="Upravljajte svim svojim fakturama na jednom mestu"
        rightContent={
          <Link
            href="/dashboard/fakture/novafakturaforma"
            className="bg-[#137FEC] hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 sm:px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">Kreiraj novu fakturu</span>
            <span className="sm:hidden">Nova</span>
          </Link>
        }
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
        <FaktureLista fakture={fakture} />
      </main>
    </>
  );
}
