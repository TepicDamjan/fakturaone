import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron: dnevno označava dospele fakture svih korisnika kao "kasni".
 * Vercel automatski šalje "Authorization: Bearer ${CRON_SECRET}" kada je
 * CRON_SECRET podešen u projektu.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron oznaci-dospjele] CRON_SECRET nije podešen.");
    return NextResponse.json({ error: "nije_podeseno" }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "neautorizovano" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("oznaci_dospjele_fakture_sve");

  if (error) {
    console.error("[cron oznaci-dospjele]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ azurirano: data ?? 0 });
}
