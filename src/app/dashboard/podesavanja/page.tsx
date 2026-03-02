import DashboardHeader from "@/app/components/DashboardHeader";

export default function Podesavanja() {
    return (
        <>
            <DashboardHeader
                title="Podešavanja"
                subtitle="Upravljajte informacijama o nalogu i firmi"
            />

            {/* Glavni sadržaj */}
            <main className="flex-1 p-8 overflow-y-auto">
                <p className="text-gray-500">
                    Forme za podešavanje sistema i naloga biće smeštene ovde.
                </p>
            </main>
        </>
    )
}