import DashboardHeader from "@/app/components/DashboardHeader";

export default function Fakture() {
    return (
        <>
            <DashboardHeader
                title="Fakture"
                subtitle="Upravljajte svim svojim fakturama na jednom mestu"
                rightContent={
                    <button className="bg-[#137FEC] hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Kreiraj novu fakturu
                    </button>
                }
            />

            {/* Glavni sadržaj */}
            <main className="flex-1 p-8 overflow-y-auto">
                <p className="text-gray-500">
                    Ovde će se uskoro naći tabela sa tvojim fakturama.
                </p>
            </main>
        </>
    )
}