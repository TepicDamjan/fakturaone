import type { FakturaListItem, FakturaStatus } from "@/lib/fakture";
import { formatIznosCijeli } from "@/lib/dokument/format";

export type IzvjestajPeriod =
  | "ovaj_mjesec"
  | "prosli_mjesec"
  | "zadnjih_6"
  | "ova_godina";

export const IZVJESTAJ_PERIODI: { id: IzvjestajPeriod; label: string }[] = [
  { id: "ovaj_mjesec", label: "Ovaj mjesec" },
  { id: "prosli_mjesec", label: "Prošli mjesec" },
  { id: "zadnjih_6", label: "Zadnjih 6 mjeseci" },
  { id: "ova_godina", label: "Ova godina" },
];

export function parseIzvjestajPeriod(
  value: string | null | undefined
): IzvjestajPeriod {
  if (
    value === "ovaj_mjesec" ||
    value === "prosli_mjesec" ||
    value === "zadnjih_6" ||
    value === "ova_godina"
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

export function periodRange(period: IzvjestajPeriod, today = new Date()): PeriodRange {
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
  return f.tipDokumenta === "faktura" || f.tipDokumenta === "kreditna_nota";
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

export type IzvjestajSnapshot = {
  range: PeriodRange;
  valuta: string;
  kpi: IzvjestajKpi;
  poMesecu: MesecniBucket[];
  topKlijenti: TopKlijentRed[];
  neplacene: FakturaListItem[];
  pdv: PdvPregled;
};

export function buildIzvjestajSnapshot(
  sveFakture: FakturaListItem[],
  period: IzvjestajPeriod,
  valuta = "BAM",
  pdvUlaz: FakturaZaPdv[] = []
): IzvjestajSnapshot {
  const range = periodRange(period);
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

  return {
    range,
    valuta,
    kpi: izracunajKpi(uPerioduF),
    poMesecu: prihodPoMesecu(uPerioduF, range),
    topKlijenti: topKlijenti(uPerioduF),
    neplacene: neplaceneFakture(uPerioduF),
    pdv: izracunajPdvPregled(pdvSource, range),
  };
}

export function formatIzvjestajIznos(
  amount: number,
  valuta: string
): string {
  return `${formatIznosCijeli(amount)} ${valuta}`;
}
