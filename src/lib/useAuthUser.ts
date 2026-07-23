"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

function metaText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function prikaznoIme(user: User): string {
  const meta = user.user_metadata ?? {};
  const ime =
    metaText(meta.full_name) ||
    metaText(meta.name) ||
    metaText(meta.display_name);
  if (ime) return ime;
  if (user.email) return user.email.split("@")[0];
  return "Korisnik";
}

export function dicebearAvatar(seed: string): string {
  const safeSeed = encodeURIComponent(seed || "korisnik");
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${safeSeed}&backgroundColor=FFC107`;
}

export function userAvatarUrl(user: User | null | undefined): string {
  if (!user) return dicebearAvatar("korisnik");
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const custom = metaText(meta?.avatar_url);
  if (custom) return custom;
  return dicebearAvatar(user.email ?? user.id);
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
    avatarUrl: userAvatarUrl(user),
  };
}
