import DashboardHeader from "@/app/components/DashboardHeader";
import { logout } from '@/app/login/actions';

export default function Podesavanja() {
    return (
        <>
            <DashboardHeader
                title="Podešavanja"
                subtitle="Upravljajte informacijama o nalogu i firmi"
                rightContent={
                    <>
                        <div className="w-px h-6 bg-gray-200"></div>
                        <form action={logout}>
                            <button type="submit" className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">
                                Odjavi se
                            </button>
                        </form>
                    </>
                }
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