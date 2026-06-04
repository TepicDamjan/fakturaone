export function fakturaPdfApiUrl(fakturaId: string): string {
  return `/api/fakture/${encodeURIComponent(fakturaId)}/pdf`;
}

export async function preuzmiDokumentPdf(
  fakturaId: string,
  downloadName: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(fakturaPdfApiUrl(fakturaId), {
      credentials: "include",
    });

    if (!res.ok) {
      let error = "PDF nije preuzet.";
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) error = body.error;
      } catch {
        /* ignore */
      }
      return { ok: false, error };
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName.endsWith(".pdf")
      ? downloadName
      : `${downloadName}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return { ok: true };
  } catch {
    return { ok: false, error: "Mrežna greška pri preuzimanju PDF-a." };
  }
}
