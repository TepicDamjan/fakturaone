import type { FaktureFilter, FakturaStatus } from "@/lib/fakture";
import type { TipDokumenta } from "@/lib/tipDokumenta";

export type DatumPreset = "7" | "30" | "90" | "all";

export const DATUM_PRESET_DEFAULT: DatumPreset = "30";

const STATUSI: ReadonlySet<string> = new Set([
  "nacrt",
  "na_cekanju",
  "placeno",
  "kasni",
]);

const TIPOVI: ReadonlySet<string> = new Set([
  "faktura",
  "predracun",
  "otpremnica",
]);

const PRESETI: ReadonlySet<string> = new Set(["7", "30", "90", "all"]);

export type ParsedFaktureParams = {
  filter: FaktureFilter;
  q: string;
  status: FakturaStatus | "all";
  tip: TipDokumenta | "all";
  datum: DatumPreset;
  strana: number;
};

function datumOdZaPreset(preset: DatumPreset): string | undefined {
  if (preset === "all") return undefined;
  const dana = Number(preset);
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - dana);
  return d.toISOString().slice(0, 10);
}

/** Parsira i validira query parametre liste dokumenata; nevalidne ignoriše. */
export function parseFaktureParams(
  params: Record<string, string | string[] | undefined>
): ParsedFaktureParams {
  const first = (v: string | string[] | undefined): string | undefined =>
    Array.isArray(v) ? v[0] : v;

  const q = (first(params.q) ?? "").slice(0, 200);

  const statusRaw = first(params.status) ?? "all";
  const status = STATUSI.has(statusRaw)
    ? (statusRaw as FakturaStatus)
    : "all";

  const tipRaw = first(params.tip) ?? "all";
  const tip = TIPOVI.has(tipRaw) ? (tipRaw as TipDokumenta) : "all";

  const datumRaw = first(params.datum) ?? DATUM_PRESET_DEFAULT;
  const datum = PRESETI.has(datumRaw)
    ? (datumRaw as DatumPreset)
    : DATUM_PRESET_DEFAULT;

  const stranaRaw = Number(first(params.strana) ?? "1");
  const strana =
    Number.isFinite(stranaRaw) && stranaRaw >= 1
      ? Math.min(Math.floor(stranaRaw), 10000)
      : 1;

  const filter: FaktureFilter = {
    q: q.trim() || undefined,
    status: status === "all" ? undefined : status,
    tip: tip === "all" ? undefined : tip,
    datumOd: datumOdZaPreset(datum),
  };

  return { filter, q, status, tip, datum, strana };
}
