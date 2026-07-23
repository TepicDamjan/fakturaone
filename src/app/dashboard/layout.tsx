import type { Metadata } from "next";
import DashboardShell from "@/app/components/DashboardShell";
import { NOINDEX_ROBOTS } from "@/lib/site";
import { fetchPodesavanjaFirme } from "@/lib/firma.server";
import {
  defaultPretplataPregled,
  fetchPretplataPregled,
  type PretplataPregled,
} from "@/lib/pretplata.server";
import { createClient } from "@/utils/supabase/server";
import type { AktivnaFirmaPregled } from "@/app/components/DashboardSidebar";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    let aktivnaFirma: AktivnaFirmaPregled = null;
    let pretplata: PretplataPregled = defaultPretplataPregled();

    try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { firma } = await fetchPodesavanjaFirme(supabase);
        if (firma?.naziv?.trim()) {
            aktivnaFirma = {
                naziv: firma.naziv.trim(),
                logoUrl: firma.logo_url,
            };
        }

        if (user) {
          try {
            pretplata = await fetchPretplataPregled(supabase, user.id);
          } catch {
            /* tabela pretplate možda nije migrirana */
          }
        }
    } catch {
        aktivnaFirma = null;
    }

    return (
      <DashboardShell aktivnaFirma={aktivnaFirma} pretplata={pretplata}>
        {children}
      </DashboardShell>
    );
}
