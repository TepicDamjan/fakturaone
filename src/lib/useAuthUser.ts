"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

function prikaznoIme(user: User): string {
  const meta = user.user_metadata ?? {};
  const ime =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    (typeof meta.display_name === "string" && meta.display_name.trim());
  if (ime) return ime;
  if (user.email) return user.email.split("@")[0];
  return "Korisnik";
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const ucitaj = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setLoading(false);
    };

    void ucitaj();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    ime: user ? prikaznoIme(user) : null,
    email: user?.email ?? null,
  };
}
