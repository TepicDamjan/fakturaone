import { NextResponse } from "next/server";
import { ucitajDokumentModel } from "@/lib/dokument/ucitajDokument";
import { dokumentPdfFilename } from "@/lib/dokument/dokumentModel";
import { generateDokumentPdf } from "@/lib/pdf/generateDokumentPdf";
import { createClient } from "@/utils/supabase/server";
import { fetchPretplataPregled } from "@/lib/pretplata.server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id?.trim()) {
    return NextResponse.json({ error: "Nedostaje ID dokumenta." }, { status: 400 });
  }

  const loaded = await ucitajDokumentModel(id);
  if (!loaded.ok) {
    return NextResponse.json({ error: loaded.error }, { status: loaded.status });
  }

  let watermark = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const pregled = await fetchPretplataPregled(supabase, user.id);
      watermark = pregled.limits.pdfWatermark;
    }
  } catch {
    watermark = false;
  }

  try {
    const pdf = await generateDokumentPdf(loaded.model, { watermark });
    const filename = dokumentPdfFilename(loaded.model);

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Greška pri generisanju PDF-a.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
