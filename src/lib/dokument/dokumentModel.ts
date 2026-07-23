import type { FakturaSaStavkama } from "@/lib/fakture";
import {
  izdavalacIzPodesavanja,
  podrazumevaniBankovniRacun,
  type BankovniRacunRow,
  type IzdavalacPrikaz,
  type PodesavanjaFirme,
} from "@/lib/firma";
import { formatKlijentAdresa } from "@/lib/klijenti";
import { metaZaTip, parseTipDokumenta, type TipDokumenta } from "@/lib/tipDokumenta";

export type DokumentStavka = {
  naziv: string;
  opis: string | null;
  kolicina: number;
  cena: number;
  jedinica: string;
};

export type DokumentPrimalac = {
  naziv: string;
  adresa: string | null;
  email: string | null;
};

export type DokumentModel = {
  tipDokumenta: TipDokumenta;
  broj: string;
  referenca: string | null;
  datumIzdavanja: string | null;
  datumPlacanja: string | null;
  napomene: string | null;
  pdvProcenat: number;
  popust: number;
  valuta: string;
  izdavac: IzdavalacPrikaz;
  bankovniRacun: BankovniRacunRow | null;
  primalac: DokumentPrimalac | null;
  stavke: DokumentStavka[];
  nacinTransporta: string | null;
  adresaDostave: string | null;
  registracijaVozila: string | null;
  vozac: string | null;
};

export type DokumentIznosi = {
  osnovica: number;
  pdvIznos: number;
  ukupno: number;
};

export function izracunajDokumentIznose(model: DokumentModel): DokumentIznosi {
  const osnovica = model.stavke.reduce(
    (s, x) => s + x.kolicina * x.cena,
    0
  );
  const pdvIznos = osnovica * (model.pdvProcenat / 100);
  const ukupno = osnovica + pdvIznos - model.popust;
  return { osnovica, pdvIznos, ukupno };
}

export function buildDokumentModel(
  payload: FakturaSaStavkama,
  podesavanja: PodesavanjaFirme
): DokumentModel {
  const f = payload.faktura;
  const tipDokumenta = parseTipDokumenta(f.tip_dokumenta);
  const tipMeta = metaZaTip(tipDokumenta);
  const izdavac = izdavalacIzPodesavanja(podesavanja);
  const bankovniRacun = podrazumevaniBankovniRacun(podesavanja.racuni);
  const valuta = podesavanja.firma?.valuta?.trim() || "BAM";

  const k = payload.klijent;
  const primalac: DokumentPrimalac | null = k
    ? {
        naziv: k.naziv,
        adresa: formatKlijentAdresa(k) || null,
        email: k.email?.trim() || null,
      }
    : null;

  return {
    tipDokumenta,
    broj: f.broj?.trim() || "—",
    referenca: f.referenca?.trim() || null,
    datumIzdavanja: f.datum_izdavanja,
    datumPlacanja: f.datum_placanja,
    napomene: f.napomene?.trim() || tipMeta.defaultNapomena,
    pdvProcenat: Number(f.pdv_procenat),
    popust: Number(f.popust),
    valuta,
    izdavac,
    bankovniRacun,
    primalac,
    stavke: payload.stavke.map((s) => ({
      naziv: s.naziv || "—",
      opis: s.opis?.trim() || null,
      kolicina: Number(s.kolicina),
      cena: Number(s.cena),
      jedinica: s.jedinica?.trim() || "kom",
    })),
    nacinTransporta: f.nacin_transporta?.trim() || null,
    adresaDostave: f.adresa_dostave?.trim() || null,
    registracijaVozila: f.registracija_vozila?.trim() || null,
    vozac: f.vozac?.trim() || null,
  };
}

export function dokumentPdfFilename(model: DokumentModel): string {
  return dokumentPdfFilenameZa(model.tipDokumenta, model.broj);
}

export function dokumentPdfFilenameZa(
  tipDokumenta: TipDokumenta,
  broj: string
): string {
  const prefiks = metaZaTip(tipDokumenta).brojPrefiks;
  const safe = broj.replace(/[^\w.-]+/g, "_").replace(/_+/g, "_") || "dokument";
  return `${prefiks}-${safe}.pdf`;
}
