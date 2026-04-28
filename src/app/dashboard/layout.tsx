import DashboardSidebar from "@/app/components/DashboardSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen w-full bg-[#F8FAFC]">
            {/* Deljeni Sidebar za ceo /dashboard segment */}
            <DashboardSidebar />

            {/* Prostor za svaku pod-stranicu uključujući i njen unikatni Header */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                {children}
            </div>
        </div>
    )
}
