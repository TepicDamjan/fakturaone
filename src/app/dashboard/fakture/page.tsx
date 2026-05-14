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
            className="bg-[#137FEC] hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
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
            Kreiraj novu fakturu
          </Link>
        }
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <FaktureLista fakture={fakture} />
      </main>
    </>
  );
}
