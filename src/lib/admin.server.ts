import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/adminEmails";
import { createClient } from "@/utils/supabase/server";

export { isAdminEmail } from "@/lib/adminEmails";

/** Vraća ulogovanog admina ili null (za server akcije). */
export async function getAdminUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

/** Za admin stranice — redirect ako korisnik nije admin. */
export async function requireAdmin(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  return user;
}
