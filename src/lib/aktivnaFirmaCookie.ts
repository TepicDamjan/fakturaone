export const AKTIVNA_FIRMA_COOKIE = "aktivna_firma_id";

/** Za middleware — čita cookie iz NextRequest. */
export function getAktivnaFirmaIdFromRequest(
  request: { cookies: { get: (name: string) => { value: string } | undefined } }
): string | null {
  const value = request.cookies.get(AKTIVNA_FIRMA_COOKIE)?.value?.trim();
  return value || null;
}
