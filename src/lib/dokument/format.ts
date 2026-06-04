export function formatIznos(amount: number): string {
  return amount.toLocaleString("bs-Latn-BA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDokumentDatum(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("bs-Latn-BA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function sanitizePdfFilename(broj: string): string {
  const safe = broj.replace(/[^\w.-]+/g, "_").replace(/_+/g, "_");
  return safe || "dokument";
}
