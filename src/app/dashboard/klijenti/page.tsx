import DashboardHeader from "@/app/components/DashboardHeader";

export default function Klijenti() {
    return (
        <>
            <DashboardHeader
                title="Klijenti"
                subtitle="Upravljanje vašom bazom klijenata"
            />

            {/* Glavni sadržaj */}
            <main className="flex-1 p-8 overflow-y-auto">
                <p className="text-gray-500">
                    Ovo je glavni sadržaj dashboard-a za pregled klijenata.
                </p>
            </main>
        </>
    )
}