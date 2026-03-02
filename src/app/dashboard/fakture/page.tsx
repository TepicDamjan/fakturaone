import DashboardHeader from "@/app/components/DashboardHeader";

export default function Fakture() {
    return (
        <>
            <DashboardHeader
                title="Fakture"
                subtitle="Upravljajte svim svojim fakturama na jednom mestu"
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