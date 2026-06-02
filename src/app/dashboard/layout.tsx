import DashboardShell from "@/app/components/DashboardShell";
import { fetchPodesavanjaFirme } from "@/lib/firma.server";
import { createClient } from "@/utils/supabase/server";
import type { AktivnaFirmaPregled } from "@/app/components/DashboardSidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    let aktivnaFirma: AktivnaFirmaPregled = null;

    try {
        const supabase = await createClient();
        const { firma } = await fetchPodesavanjaFirme(supabase);
        if (firma?.naziv?.trim()) {
            aktivnaFirma = {
                naziv: firma.naziv.trim(),
                logoUrl: firma.logo_url,
            };
        }
    } catch {
        aktivnaFirma = null;
    }

    return <DashboardShell aktivnaFirma={aktivnaFirma}>{children}</DashboardShell>;
}
