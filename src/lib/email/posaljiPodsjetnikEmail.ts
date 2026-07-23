import { Resend } from "resend";
import { formatDokumentDatum, formatIznos } from "@/lib/dokument/format";
import { getEmailConfig } from "@/lib/email/config";

export type PodsjetnikEmailInput = {
  to: string;
  replyTo?: string;
  firmaNaziv: string;
  klijentNaziv: string;
  brojFakture: string;
  iznos: number;
  valuta: string;
  datumPlacanja: string | null;
  preostalo: number;
  vrsta: "prije" | "dospjelo";
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function posaljiPodsjetnikPlacanjaEmail(
  input: PodsjetnikEmailInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = getEmailConfig();
  if (!cfg.ok) return cfg;

  const jeDospjelo = input.vrsta === "dospjelo";
  const subject = jeDospjelo
    ? `Podsjetnik: faktura ${input.brojFakture} je dospjela — ${input.firmaNaziv}`
    : `Podsjetnik: faktura ${input.brojFakture} uskoro dospijeva — ${input.firmaNaziv}`;

  const naslov = jeDospjelo
    ? "Faktura je dospjela za plaćanje"
    : "Podsjetnik za plaćanje fakture";

  const tekst = jeDospjelo
    ? `Obavještavamo vas da faktura #${input.brojFakture} nije plaćena u roku.`
    : `Obavještavamo vas da faktura #${input.brojFakture} uskoro dospijeva.`;

  const html = `<!DOCTYPE html>
<html lang="bs">
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a;margin:0;padding:24px;background:#f8fafc">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8f0">
    <p style="margin:0 0 8px;font-size:13px;color:#64748b">${escapeHtml(input.firmaNaziv)}</p>
    <h1 style="margin:0 0 20px;font-size:20px">${escapeHtml(naslov)}</h1>
    <p style="margin:0 0 16px">Poštovani ${escapeHtml(input.klijentNaziv)},</p>
    <p style="margin:0 0 16px">${escapeHtml(tekst)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 20px">
      <tr><td style="padding:6px 0;color:#64748b">Broj</td><td style="padding:6px 0;text-align:right;font-weight:600">#${escapeHtml(input.brojFakture)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Iznos</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#137fec">${formatIznos(input.iznos)} ${escapeHtml(input.valuta)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Preostalo</td><td style="padding:6px 0;text-align:right;font-weight:700">${formatIznos(input.preostalo)} ${escapeHtml(input.valuta)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Rok plaćanja</td><td style="padding:6px 0;text-align:right">${escapeHtml(formatDokumentDatum(input.datumPlacanja))}</td></tr>
    </table>
    <p style="margin:0;font-size:13px;color:#64748b">Srdačan pozdrav,<br><strong>${escapeHtml(input.firmaNaziv)}</strong></p>
  </div>
</body>
</html>`;

  const resend = new Resend(cfg.config.apiKey);
  const { error } = await resend.emails.send({
    from: cfg.config.from,
    to: [input.to],
    replyTo: input.replyTo || undefined,
    subject,
    html,
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
