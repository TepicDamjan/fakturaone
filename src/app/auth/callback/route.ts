import { NextResponse } from "next/server";
import { ensureProTrialForUser } from "@/lib/pretplata.server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/izbor-firme";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (data.user?.id) {
        try {
          await ensureProTrialForUser(supabase, data.user.id);
        } catch {
          /* trigger u bazi */
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?greska=potvrda`);
}
