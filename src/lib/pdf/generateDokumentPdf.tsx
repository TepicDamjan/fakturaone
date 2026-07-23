import { renderToBuffer } from "@react-pdf/renderer";
import DokumentPdfDocument from "@/lib/pdf/DokumentPdfDocument";
import type { DokumentModel } from "@/lib/dokument/dokumentModel";
import { generatePaymentQrDataUrl } from "@/lib/pdf/paymentQr";

export async function generateDokumentPdf(
  model: DokumentModel
): Promise<Buffer> {
  const qrDataUrl = await generatePaymentQrDataUrl(model);
  const buffer = await renderToBuffer(
    <DokumentPdfDocument model={model} qrDataUrl={qrDataUrl} />
  );
  return Buffer.from(buffer);
}
