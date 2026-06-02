import Link from "next/link";
import DashboardHeader from "@/app/components/DashboardHeader";
import KlijentiTabela from "@/app/components/KlijentiTabela";
import { fetchKlijentiSaFakturisano, type KlijentSaFakturisano } from "@/lib/klijenti.server";
import { createClient } from "@/utils/supabase/server";

export default async function Klijenti() {
    const supabase = await createClient();
    let klijenti: KlijentSaFakturisano[] = [];
    try {
        klijenti = await fetchKlijentiSaFakturisano(supabase);
    } catch {
        klijenti = [];
    }

    return (
        <>
            <DashboardHeader
                title="Klijenti"
                subtitle="Upravljanje vašom bazom klijenata"
                rightContent={
                    <>
                        <div className="hidden sm:block w-px h-6 bg-gray-200" />
                        <Link
                            href="/dashboard/klijenti/novi"
                            className="bg-[#137FEC] hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 sm:px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20 8V14M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="hidden sm:inline">Dodaj klijenta</span>
                            <span className="sm:hidden">Dodaj</span>
                        </Link>
                    </>
                }
            />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
                <KlijentiTabela klijenti={klijenti} />
            </main>
        </>
    )
}