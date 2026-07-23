import { renderToBuffer } from "@react-pdf/renderer";
import DokumentPdfDocument from "@/lib/pdf/DokumentPdfDocument";
import type { DokumentModel } from "@/lib/dokument/dokumentModel";

export async function generateDokumentPdf(
  model: DokumentModel
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <DokumentPdfDocument model={model} />
  );
  return Buffer.from(buffer);
}
