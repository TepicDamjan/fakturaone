import DashboardSidebar from "@/app/components/DashboardSidebar";

export default function Dashboard() {
    return (
        <div className="flex h-screen w-full bg-[#F8FAFC]">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Glavni sadržaj */}
            <main className="flex-1 p-8 overflow-y-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Komandna tabla</h1>
                <p className="text-gray-500">
                    Ovo je glavni sadržaj dashboard-a. Uskoro će ovde biti prikazani najnoviji podaci.
                </p>
            </main>
        </div>
    )
}