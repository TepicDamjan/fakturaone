/**
 * Provera admin pristupa preko ADMIN_EMAILS env varijable.
 * Odvojen modul bez server-only zavisnosti da bi ga i middleware mogao koristiti.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowlist.includes(email.trim().toLowerCase());
}
