"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isPasswordStrongEnough } from "@/lib/passwordStrength";
import { ensureProTrialForUser } from "@/lib/pretplata.server";
import { getSiteUrl } from "@/lib/site";
import { createClient } from "@/utils/supabase/server";

export type SignupState = {
  error?: string;
  success?: string;
};

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "Nalog sa ovim emailom već postoji.";
  }
  if (lower.includes("password")) {
    return "Lozinka ne ispunjava bezbednosne zahteve.";
  }
  if (lower.includes("valid email")) {
    return "Unesite ispravnu email adresu.";
  }
  return "Registracija nije uspela. Pokušajte ponovo.";
}

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const terms = formData.get("terms") === "on";

  if (!fullName) {
    return { error: "Ime i prezime su obavezni." };
  }
  if (!email) {
    return { error: "Email adresa je obavezna." };
  }
  if (!password) {
    return { error: "Lozinka je obavezna." };
  }
  if (!isPasswordStrongEnough(password)) {
    return {
      error: "Lozinka mora imati najmanje 8 karaktera i srednju jačinu ili više.",
    };
  }
  if (!terms) {
    return { error: "Morate prihvatiti uslove korišćenja." };
  }

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? getSiteUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  if (data.session) {
    if (data.user?.id) {
      try {
        await ensureProTrialForUser(supabase, data.user.id);
      } catch {
        /* DB trigger takođe kreira pretplatu */
      }
    }
    revalidatePath("/dashboard");
    redirect("/izbor-firme");
  }

  return {
    success:
      "Nalog je kreiran. Proverite email i potvrdite adresu — dobijate 14 dana besplatnog Professional plana.",
  };
}
