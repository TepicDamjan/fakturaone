import { cookies } from "next/headers";
import { AKTIVNA_FIRMA_COOKIE } from "@/lib/aktivnaFirmaCookie";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export async function getAktivnaFirmaId(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(AKTIVNA_FIRMA_COOKIE)?.value?.trim();
  return value || null;
}

export async function setAktivnaFirmaId(firmaId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AKTIVNA_FIRMA_COOKIE, firmaId, COOKIE_OPTS);
}

export async function clearAktivnaFirmaId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AKTIVNA_FIRMA_COOKIE);
}

/** Vraća ID aktivne firme ili baca grešku (dashboard rute). */
export async function requireAktivnaFirmaId(): Promise<string> {
  const id = await getAktivnaFirmaId();
  if (!id) {
    throw new Error("Nije izabrano preduzeće.");
  }
  return id;
}
