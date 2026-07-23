import { Resend } from "resend";
import { formatDokumentDatum, formatIznos } from "@/lib/dokument/format";
import {
  dokumentPdfFilename,
  izracunajDokumentIznose,
  type DokumentModel,
} from "@/lib/dokument/dokumentModel";
import { generateDokumentPdf } from "@/lib/pdf/generateDokumentPdf";
import { getEmailConfig } from "@/lib/email/config";
import { metaZaTip } from "@/lib/tipDokumenta";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmailHtml(model: DokumentModel, poruka: string | null): string {
  const tipMeta = metaZaTip(model.tipDokumenta);
  const { ukupno } = izracunajDokumentIznose(model);
  const primalac = model.primalac?.naziv ?? "poštovani klijent";
  const porukaHtml = poruka?.trim()
    ? `<p style="margin:0 0 16px;color:#334155;white-space:pre-wrap">${escapeHtml(poruka.trim())}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="bs">
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a;margin:0;padding:24px;background:#f8fafc">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8f0">
    <p style="margin:0 0 8px;font-size:13px;color:#64748b">${escapeHtml(model.izdavac.naziv)}</p>
    <h1 style="margin:0 0 20px;font-size:20px">${escapeHtml(tipMeta.naziv)} #${escapeHtml(model.broj)}</h1>
    <p style="margin:0 0 16px">Poštovani ${escapeHtml(primalac)},</p>
    ${porukaHtml}
    <p style="margin:0 0 16px">U prilogu se nalazi PDF dokument.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 20px">
      <tr><td style="padding:6px 0;color:#64748b">Iznos</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#137fec">${formatIznos(ukupno)} ${escapeHtml(model.valuta)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">${escapeHtml(tipMeta.rokLabel)}</td><td style="padding:6px 0;text-align:right">${escapeHtml(formatDokumentDatum(model.datumPlacanja))}</td></tr>
    </table>
    <p style="margin:0;font-size:13px;color:#64748b">Srdačan pozdrav,<br><strong>${escapeHtml(model.izdavac.naziv)}</strong></p>
  </div>
</body>
</html>`;
}

export async function posaljiDokumentEmail(
  model: DokumentModel,
  opcionaPoruka?: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const emailTo = model.primalac?.email?.trim();
  if (!emailTo) {
    return {
      ok: false,
      error: "Klijent nema email adresu. Dodajte je u podacima klijenta.",
    };
  }

  const cfg = getEmailConfig();
  if (!cfg.ok) return cfg;

  const tipMeta = metaZaTip(model.tipDokumenta);
  const subject = `${tipMeta.naziv} ${model.broj} — ${model.izdavac.naziv}`;

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateDokumentPdf(model);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Nepoznata greška";
    return { ok: false, error: `PDF nije generisan: ${msg}` };
  }

  const resend = new Resend(cfg.config.apiKey);
  const replyTo = model.izdavac.email?.trim() || undefined;

  const { error } = await resend.emails.send({
    from: cfg.config.from,
    to: [emailTo],
    replyTo,
    subject,
    html: buildEmailHtml(model, opcionaPoruka ?? null),
    attachments: [
      {
        filename: dokumentPdfFilename(model),
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    return {
      ok: false,
      error: error.message || "Email nije poslat. Proverite Resend podešavanja.",
    };
  }

  return { ok: true };
}
