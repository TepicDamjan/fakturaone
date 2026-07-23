import QRCode from "qrcode";
import { zaokruziNovac } from "@/lib/dokument/format";
import type { DokumentModel } from "@/lib/dokument/dokumentModel";
import { izracunajDokumentIznose } from "@/lib/dokument/dokumentModel";

/**
 * Jednostavan EPC / payment payload za QR na PDF-u.
 * Format: tekst sa bankovnim računom, iznosom i pozivom na broj.
 */
export function buildPaymentQrPayload(model: DokumentModel): string | null {
  const racun = model.bankovniRacun?.broj_racuna?.trim();
  if (!racun) return null;
  if (model.tipDokumenta === "otpremnica") return null;

  const { ukupno } = izracunajDokumentIznose(model);
  const iznos = zaokruziNovac(ukupno);
  const primalac =
    model.bankovniRacun?.na_ime?.trim() || model.izdavac.naziv || "";

  // Kompatibilan tekstualni payload (skenirati mobilnim bankingom / ručno)
  return [
    "FAKTURAONE PLACANJE",
    `Primalac: ${primalac}`,
    `Racun: ${racun}`,
    `Iznos: ${iznos.toFixed(2)} ${model.valuta}`,
    `Poziv na broj: ${model.broj}`,
    model.datumPlacanja ? `Rok: ${model.datumPlacanja}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generatePaymentQrDataUrl(
  model: DokumentModel
): Promise<string | null> {
  const payload = buildPaymentQrPayload(model);
  if (!payload) return null;
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 180,
      color: { dark: "#0F172A", light: "#FFFFFF" },
    });
  } catch {
    return null;
  }
}
