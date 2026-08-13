import QRCode from "qrcode";
import { zaokruziNovac } from "@/lib/dokument/format";
import type { DokumentModel } from "@/lib/dokument/dokumentModel";
import { izracunajDokumentIznose } from "@/lib/dokument/dokumentModel";

function samoCifre(s: string): string {
  return s.replace(/\D/g, "");
}

/**
 * IPS-stil platni nalog (regionalni format koji banke prepoznaju).
 * BAM/RSD → IPS; EUR → EPC/SEPA SCT.
 */
export function buildPaymentQrPayload(model: DokumentModel): string | null {
  const racun = model.bankovniRacun?.broj_racuna?.trim();
  if (!racun) return null;
  if (model.tipDokumenta === "otpremnica") return null;

  const { ukupno } = izracunajDokumentIznose(model);
  const iznos = zaokruziNovac(Math.abs(ukupno));
  if (iznos <= 0) return null;

  const primalac =
    model.bankovniRacun?.na_ime?.trim() || model.izdavac.naziv || "";
  const valuta = (model.valuta || "BAM").toUpperCase();
  const svrha = `Uplata ${model.broj}`.slice(0, 35);
  const poziv = model.broj.replace(/\s+/g, "").slice(0, 25);

  if (valuta === "EUR") {
    const iban = racun.replace(/\s+/g, "").toUpperCase();
    return [
      "BCD",
      "002",
      "1",
      "SCT",
      (model.bankovniRacun?.swift || "").trim().toUpperCase(),
      primalac.slice(0, 70),
      iban,
      `EUR${iznos.toFixed(2)}`,
      "",
      poziv,
      svrha,
    ].join("\n");
  }

  const racunCist = samoCifre(racun) || racun.replace(/\s+/g, "");
  return [
    "K:PR",
    "V:01",
    "C:1",
    `R:${racunCist}`,
    `N:${primalac.slice(0, 70)}`,
    `I:${valuta}${iznos.toFixed(2)}`,
    "SF:221",
    `S:${svrha}`,
    `RO:${poziv}`,
  ].join("|");
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
