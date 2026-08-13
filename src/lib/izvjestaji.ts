import type { FakturaListItem, FakturaStatus } from "@/lib/fakture";
import { formatIznosCijeli } from "@/lib/dokument/format";
import { jeFinansijskiDokument } from "@/lib/tipDokumenta";

export type IzvjestajPeriod =
  | "ovaj_mjesec"
  | "prosli_mjesec"
  | "zadnjih_6"
  | "ova_godina"
  | "prilagodjen";

export const IZVJESTAJ_PERIODI: { id: IzvjestajPeriod; label: string }[] = [
  { id: "ovaj_mjesec", label: "Ovaj mjesec" },
  { id: "prosli_mjesec", label: "Prošli mjesec" },
  { id: "zadnjih_6", label: "Zadnjih 6 mjeseci" },
  { id: "ova_godina", label: "Ova godina" },
  { id: "prilagodjen", label: "Od–do" },
];

export function parseIzvjestajPeriod(
  value: string | null | undefined
): IzvjestajPeriod {
  if (
    value === "ovaj_mjesec" ||
    value === "prosli_mjesec" ||
    value === "zadnjih_6" ||
    value === "ova_godina" ||
    value === "prilagodjen"
  ) {
    return value;
  }
  return "zadnjih_6";
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Lokalni YYYY-MM-DD bez UTC pomaka. */
export function toIsoDateLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export type PeriodRange = {
  period: IzvjestajPeriod;
  label: string;
  start: string;
  end: string;
};

export function periodRange(
  period: IzvjestajPeriod,
  today = new Date(),
  custom?: { start?: string; end?: string }
): PeriodRange {
  if (period === "prilagodjen" && custom?.start && custom?.end) {
    return {
      period,
      label: `${custom.start} – ${custom.end}`,
      start: custom.start,
      end: custom.end,
    };
  }
  const y = today.getFullYear();
  const m = today.getMonth();

  if (period === "ovaj_mjesec") {
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    return {
      period,
      label: "Ovaj mjesec",
      start: toIsoDateLocal(start),
      end: toIsoDateLocal(end),
    };
  }

  if (period === "prosli_mjesec") {
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    return {
      period,
      label: "Prošli mjesec",
      start: toIsoDateLocal(start),
      end: toIsoDateLocal(end),
    };
  }

  if (period === "ova_godina") {
    const start = new Date(y, 0, 1);
    const end = new Date(y, 11, 31);
    return {
      period,
      label: String(y),
      start: toIsoDateLocal(start),
      end: toIsoDateLocal(end),
    };
  }

  const start = new Date(y, m - 5, 1);
  const end = new Date(y, m + 1, 0);
  return {
    period: "zadnjih_6",
    label: "Zadnjih 6 mjeseci",
    start: toIsoDateLocal(start),
    end: toIsoDateLocal(end),
  };
}

export function uPeriodu(
  datumIzdavanja: string | null | undefined,
  range: PeriodRange
): boolean {
  if (!datumIzdavanja?.trim()) return false;
  const d = datumIzdavanja.trim().slice(0, 10);
  return d >= range.start && d <= range.end;
}

export function jeFinansijskaFaktura(f: FakturaListItem): boolean {
  return jeFinansijskiDokument(f.tipDokumenta);
}

export function filtrirajZaPeriod(
  fakture: FakturaListItem[],
  range: PeriodRange
): FakturaListItem[] {
  return fakture.filter(
    (f) => jeFinansijskaFaktura(f) && uPeriodu(f.datumIzdavanja, range)
  );
}

export type IzvjestajKpi = {
  fakturisano: number;
  placeno: number;
  naCekanju: number;
  kasni: number;
  brojFaktura: number;
};

export function izracunajKpi(fakture: FakturaListItem[]): IzvjestajKpi {
  let fakturisano = 0;
  let placeno = 0;
  let naCekanju = 0;
  let kasni = 0;

  for (const f of fakture) {
    fakturisano += f.iznos;
    if (f.status === "placeno") placeno += f.iznos;
    else if (f.status === "na_cekanju") naCekanju += f.iznos;
    else if (f.status === "kasni") kasni += f.iznos;
  }

  return {
    fakturisano,
    placeno,
    naCekanju,
    kasni,
    brojFaktura: fakture.length,
  };
}

export type MesecniBucket = {
  key: string;
  label: string;
  iznos: number;
};

function mesecLabel(key: string): string {
  const [y, mo] = key.split("-").map(Number);
  if (!y || !mo || mo < 1 || mo > 12) return key;
  const kratki = [
    "jan",
    "feb",
    "mar",
    "apr",
    "maj",
    "jun",
    "jul",
    "avg",
    "sep",
    "okt",
    "nov",
    "dec",
  ] as const;
  return `${kratki[mo - 1]} ${y}.`;
}

/** Prihod po mjesecu (samo plaćene fakture u periodu). */
export function prihodPoMesecu(
  fakture: FakturaListItem[],
  range: PeriodRange
): MesecniBucket[] {
  const map = new Map<string, number>();

  const [sy, sm] = range.start.split("-").map(Number);
  const [ey, em] = range.end.split("-").map(Number);
  let cy = sy;
  let cm = sm;
  while (cy < ey || (cy === ey && cm <= em)) {
    const key = `${cy}-${pad2(cm)}`;
    map.set(key, 0);
    cm += 1;
    if (cm > 12) {
      cm = 1;
      cy += 1;
    }
  }

  for (const f of fakture) {
    if (f.status !== "placeno") continue;
    const d = f.datumIzdavanja?.slice(0, 7);
    if (!d || !map.has(d)) continue;
    map.set(d, (map.get(d) ?? 0) + f.iznos);
  }

  return [...map.entries()].map(([key, iznos]) => ({
    key,
    label: mesecLabel(key),
    iznos,
  }));
}

export type TopKlijentRed = {
  naziv: string;
  iznos: number;
  brojFaktura: number;
};

export function topKlijenti(
  fakture: FakturaListItem[],
  limit = 8
): TopKlijentRed[] {
  const map = new Map<string, { iznos: number; broj: number }>();

  for (const f of fakture) {
    if (f.status !== "placeno") continue;
    const naziv = f.klijentNaziv?.trim() || "Bez klijenta";
    const cur = map.get(naziv) ?? { iznos: 0, broj: 0 };
    map.set(naziv, {
      iznos: cur.iznos + f.iznos,
      broj: cur.broj + 1,
    });
  }

  return [...map.entries()]
    .map(([naziv, v]) => ({
      naziv,
      iznos: v.iznos,
      brojFaktura: v.broj,
    }))
    .sort((a, b) => b.iznos - a.iznos)
    .slice(0, limit);
}

const NEPLACENI_STATUSI: FakturaStatus[] = ["na_cekanju", "kasni"];

export function neplaceneFakture(
  fakture: FakturaListItem[]
): FakturaListItem[] {
  return fakture
    .filter((f) => NEPLACENI_STATUSI.includes(f.status))
    .sort((a, b) => {
      const da = a.datumPlacanja || a.datumIzdavanja || "";
      const db = b.datumPlacanja || b.datumIzdavanja || "";
      return da.localeCompare(db);
    });
}

export type PdvPregled = {
  osnovica: number;
  pdvIznos: number;
  popust: number;
  ukupno: number;
  /** PDV koji treba uplatiti (približno = pdvIznos za izlazne fakture). */
  pdvZaUplatu: number;
};

/** Računa PDV iz ukupnog iznosa, stope i popusta. */
export function izracunajPdvOdUkupnog(
  ukupno: number,
  pdvProcenat: number,
  popust: number
): { osnovica: number; pdvIznos: number } {
  const faktor = 1 + Number(pdvProcenat) / 100;
  const osnovica =
    faktor > 0 ? (Number(ukupno) + Number(popust || 0)) / faktor : Number(ukupno);
  const pdvIznos = osnovica * (Number(pdvProcenat) / 100);
  return { osnovica, pdvIznos };
}

export type FakturaZaPdv = {
  iznos: number;
  pdvProcenat: number;
  popust: number;
  tipDokumenta: string;
  status: FakturaStatus;
  datumIzdavanja: string;
};

export function izracunajPdvPregled(
  fakture: FakturaZaPdv[],
  range: PeriodRange
): PdvPregled {
  let osnovica = 0;
  let pdvIznos = 0;
  let popust = 0;
  let ukupno = 0;

  for (const f of fakture) {
    if (f.tipDokumenta !== "faktura" && f.tipDokumenta !== "kreditna_nota") {
      continue;
    }
    if (f.status === "nacrt") continue;
    if (!uPeriodu(f.datumIzdavanja, range)) continue;

    const p = izracunajPdvOdUkupnog(f.iznos, f.pdvProcenat, f.popust);
    osnovica += p.osnovica;
    pdvIznos += p.pdvIznos;
    popust += Number(f.popust) || 0;
    ukupno += f.iznos;
  }

  return {
    osnovica,
    pdvIznos,
    popust,
    ukupno,
    pdvZaUplatu: pdvIznos,
  };
}

export type AgingBucketId = "tekuce" | "d30" | "d60" | "d90";

export type AgingBucket = {
  id: AgingBucketId;
  label: string;
  iznos: number;
  broj: number;
};

export function starenjePotrazivanja(
  fakture: FakturaListItem[],
  today = new Date()
): AgingBucket[] {
  const todayIso = toIsoDateLocal(today);
  const buckets: Record<AgingBucketId, AgingBucket> = {
    tekuce: { id: "tekuce", label: "Nije dospjelo", iznos: 0, broj: 0 },
    d30: { id: "d30", label: "1–30 dana", iznos: 0, broj: 0 },
    d60: { id: "d60", label: "31–60 dana", iznos: 0, broj: 0 },
    d90: { id: "d90", label: "61+ dana", iznos: 0, broj: 0 },
  };

  const open = fakture.filter(
    (f) =>
      jeFinansijskaFaktura(f) &&
      (f.status === "na_cekanju" || f.status === "kasni")
  );

  for (const f of open) {
    const due = (f.datumPlacanja || f.datumIzdavanja || "").slice(0, 10);
    const preostalo = Math.max(0, f.iznos - (f.placenoIznos || 0));
    if (preostalo <= 0) continue;
    let id: AgingBucketId = "tekuce";
    if (due && due < todayIso) {
      const days = Math.floor(
        (new Date(`${todayIso}T12:00:00`).getTime() -
          new Date(`${due}T12:00:00`).getTime()) /
          86400000
      );
      if (days <= 30) id = "d30";
      else if (days <= 60) id = "d60";
      else id = "d90";
    }
    buckets[id].iznos += preostalo;
    buckets[id].broj += 1;
  }

  return [buckets.tekuce, buckets.d30, buckets.d60, buckets.d90];
}

export type KifRed = {
  id: string;
  datum: string;
  broj: string;
  klijent: string;
  jib: string;
  osnovica: number;
  pdvIznos: number;
  ukupno: number;
  pdvProcenat: number;
};

export type FakturisanoVsNaplaceno = {
  key: string;
  label: string;
  fakturisano: number;
  naplaceno: number;
};

export function fakturisanoVsNaplaceno(
  fakture: FakturaListItem[],
  range: PeriodRange
): FakturisanoVsNaplaceno[] {
  const prihod = prihodPoMesecu(fakture, range);
  const map = new Map(prihod.map((p) => [p.key, { ...p, fakturisano: 0, naplaceno: p.iznos }]));
  for (const f of fakture) {
    if (!jeFinansijskaFaktura(f) || f.status === "nacrt") continue;
    const d = f.datumIzdavanja?.slice(0, 7);
    if (!d || !map.has(d)) continue;
    const cur = map.get(d)!;
    cur.fakturisano += f.iznos;
  }
  return [...map.values()].map((v) => ({
    key: v.key,
    label: v.label,
    fakturisano: v.fakturisano,
    naplaceno: v.naplaceno,
  }));
}

export type IzvjestajSnapshot = {
  range: PeriodRange;
  valuta: string;
  kpi: IzvjestajKpi;
  poMesecu: MesecniBucket[];
  topKlijenti: TopKlijentRed[];
  neplacene: FakturaListItem[];
  pdv: PdvPregled;
  aging: AgingBucket[];
  kif: KifRed[];
  vsNaplaceno: FakturisanoVsNaplaceno[];
  pdvPoStopi: { stopa: number; osnovica: number; pdvIznos: number }[];
};

export function buildIzvjestajSnapshot(
  sveFakture: FakturaListItem[],
  period: IzvjestajPeriod,
  valuta = "BAM",
  pdvUlaz: FakturaZaPdv[] = [],
  custom?: { start?: string; end?: string },
  kifUlaz: KifRed[] = []
): IzvjestajSnapshot {
  const range = periodRange(period, new Date(), custom);
  const uPerioduF = filtrirajZaPeriod(sveFakture, range);
  const pdvSource =
    pdvUlaz.length > 0
      ? pdvUlaz
      : uPerioduF.map((f) => ({
          iznos: f.iznos,
          pdvProcenat: 17,
          popust: 0,
          tipDokumenta: f.tipDokumenta,
          status: f.status,
          datumIzdavanja: f.datumIzdavanja,
        }));

  const pdvPoStopiMap = new Map<number, { osnovica: number; pdvIznos: number }>();
  for (const f of pdvSource) {
    if (f.status === "nacrt") continue;
    if (!uPeriodu(f.datumIzdavanja, range)) continue;
    const p = izracunajPdvOdUkupnog(f.iznos, f.pdvProcenat, f.popust);
    const cur = pdvPoStopiMap.get(f.pdvProcenat) ?? { osnovica: 0, pdvIznos: 0 };
    cur.osnovica += p.osnovica;
    cur.pdvIznos += p.pdvIznos;
    pdvPoStopiMap.set(f.pdvProcenat, cur);
  }

  return {
    range,
    valuta,
    kpi: izracunajKpi(uPerioduF),
    poMesecu: prihodPoMesecu(uPerioduF, range),
    topKlijenti: topKlijenti(uPerioduF),
    neplacene: neplaceneFakture(uPerioduF),
    pdv: izracunajPdvPregled(pdvSource, range),
    aging: starenjePotrazivanja(sveFakture),
    kif: kifUlaz.filter((r) => uPeriodu(r.datum, range)),
    vsNaplaceno: fakturisanoVsNaplaceno(uPerioduF, range),
    pdvPoStopi: [...pdvPoStopiMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([stopa, v]) => ({ stopa, ...v })),
  };
}

export function formatIzvjestajIznos(
  amount: number,
  valuta: string
): string {
  return `${formatIznosCijeli(amount)} ${valuta}`;
}
