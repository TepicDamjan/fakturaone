"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { azurirajFakturu, sacuvajFakturu, ucitajFakturuSaStavkama } from "@/app/dashboard/fakture/actions";
import { ucitajSablon } from "@/app/dashboard/sabloni/actions";
import { useToast } from "@/app/components/toast/ToastContext";
import { ucitajKlijentiList } from "@/app/dashboard/klijenti/actions";
import { ucitajProizvodiList } from "@/app/dashboard/proizvodi/actions";
import type { Proizvod } from "@/lib/proizvodi";
import StavkeFakture, { type Stavka } from "@/app/components/StavkeFakture";
import OtpremnicaLogistika from "@/app/components/OtpremnicaLogistika";
import PredracunSumaSidebar from "@/app/components/PredracunSumaSidebar";
import { saveFakturaPregledSesija } from "@/lib/fakturaPregledSession";
import type { Klijent } from "@/lib/klijenti";
import KlijentBrzaPretraga from "@/app/components/KlijentBrzaPretraga";
import {
  metaZaTip,
  parseTipDokumenta,
  type TipDokumenta,
} from "@/lib/tipDokumenta";
import type { FakturaStatus } from "@/lib/fakture";

const NACINI_TRANSPORTA = [
  "Kamion (Sopstveno vozilo)",
  "Kamion (Eksterni prevoznik)",
  "Kombi",
  "Putničko vozilo",
  "Lično preuzimanje",
];

function initialStavkeZaTip(tip: TipDokumenta): Stavka[] {
  if (tip === "otpremnica") {
    return [
      {
        id: "1",
        naziv: "",
        opis: "",
        kolicina: 0,
        cena: 0,
        jedinica: "kom",
      },
    ];
  }
  return [
    {
      id: "1",
      naziv: "",
      opis: "",
      kolicina: 1,
      cena: 0,
      jedinica: "kom",
    },
  ];
}

export default function NovaFakturaPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-[#64748B]">Učitavanje forme…</div>
      }
    >
      <NovaFakturaForma />
    </Suspense>
  );
}

function NovaFakturaForma() {
  const router = useRouter();
  const { prikaziToast } = useToast();
  const searchParams = useSearchParams();
  const editId = (searchParams.get("id") ?? "").trim();
  const sablonId = (searchParams.get("sablon") ?? "").trim();
  const jeIzmjena = Boolean(editId);
  const tipFromQuery = parseTipDokumenta(searchParams.get("tip"));

  const [tipDokumenta, setTipDokumenta] = useState<TipDokumenta>(tipFromQuery);
  const tipMeta = metaZaTip(tipDokumenta);
  const jeOtpremnica = tipDokumenta === "otpremnica";

  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [ucitavanje, setUcitavanje] = useState(jeIzmjena || Boolean(sablonId));
  const [postojeciStatus, setPostojeciStatus] = useState<FakturaStatus>("nacrt");
  const [stavke, setStavke] = useState<Stavka[]>(() =>
    initialStavkeZaTip(tipFromQuery)
  );
  const [klijentId, setKlijentId] = useState("");
  const [klijenti, setKlijenti] = useState<Klijent[]>([]);
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [brojFakture, setBrojFakture] = useState("");
  const [referenca, setReferenca] = useState("");
  const [datumIzdavanja, setDatumIzdavanja] = useState("");
  const [datumPlacanja, setDatumPlacanja] = useState("");
  const [napomene, setNapomene] = useState("");
  const [pdvProcenat, setPdvProcenat] = useState(17);
  const [popust, setPopust] = useState(0);

  const [nacinTransporta, setNacinTransporta] = useState(NACINI_TRANSPORTA[0]);
  const [adresaDostave, setAdresaDostave] = useState("");
  const [registracijaVozila, setRegistracijaVozila] = useState("");
  const [vozac, setVozac] = useState("");

  useEffect(() => {
    ucitajKlijentiList()
      .then(setKlijenti)
      .catch(() => setKlijenti([]));
    ucitajProizvodiList()
      .then(setProizvodi)
      .catch(() => setProizvodi([]));
  }, []);

  useEffect(() => {
    if (!editId) {
      if (!sablonId) setUcitavanje(false);
      return;
    }
    let cancelled = false;
    setUcitavanje(true);
    ucitajFakturuSaStavkama(editId)
      .then((payload) => {
        if (cancelled) return;
        if (!payload) {
          setSaveError("Dokument nije pronađen ili vam ne pripada.");
          setUcitavanje(false);
          return;
        }
        const f = payload.faktura;
        const tip = parseTipDokumenta(f.tip_dokumenta);
        setTipDokumenta(tip);
        setPostojeciStatus(f.status);
        setKlijentId(f.klijent_id ?? "");
        setBrojFakture(f.broj ?? "");
        setReferenca(f.referenca ?? "");
        setDatumIzdavanja(f.datum_izdavanja ?? "");
        setDatumPlacanja(f.datum_placanja ?? "");
        setNapomene(f.napomene ?? "");
        setPdvProcenat(Number(f.pdv_procenat) || 0);
        setPopust(Number(f.popust) || 0);
        setNacinTransporta(f.nacin_transporta || NACINI_TRANSPORTA[0]);
        setAdresaDostave(f.adresa_dostave ?? "");
        setRegistracijaVozila(f.registracija_vozila ?? "");
        setVozac(f.vozac ?? "");
        setStavke(
          payload.stavke.length > 0
            ? payload.stavke.map((s) => ({
                id: s.id,
                naziv: s.naziv,
                opis: s.opis ?? "",
                kolicina: Number(s.kolicina),
                cena: Number(s.cena),
                jedinica: s.jedinica || "kom",
              }))
            : initialStavkeZaTip(tip)
        );
        setUcitavanje(false);
      })
      .catch(() => {
        if (cancelled) return;
        setSaveError("Greška pri učitavanju dokumenta.");
        setUcitavanje(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editId]);

  useEffect(() => {
    if (editId || !sablonId) return;
    let cancelled = false;
    setUcitavanje(true);
    ucitajSablon(sablonId)
      .then((sablon) => {
        if (cancelled) return;
        if (!sablon) {
          setSaveError("Šablon nije pronađen.");
          setUcitavanje(false);
          return;
        }
        setTipDokumenta(sablon.tipDokumenta);
        setKlijentId(sablon.klijentId);
        setReferenca(sablon.referenca);
        setNapomene(sablon.napomene);
        setPdvProcenat(sablon.pdvProcenat);
        setPopust(sablon.popust);
        setStavke(
          sablon.stavke.length > 0
            ? sablon.stavke.map((s) => ({
                id: crypto.randomUUID(),
                naziv: s.naziv,
                opis: s.opis,
                kolicina: s.kolicina,
                cena: s.cena,
                jedinica: s.jedinica,
              }))
            : initialStavkeZaTip(sablon.tipDokumenta)
        );
        setUcitavanje(false);
      })
      .catch(() => {
        if (cancelled) return;
        setSaveError("Greška pri učitavanju šablona.");
        setUcitavanje(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editId, sablonId]);

  const osnovica = useMemo(
    () => stavke.reduce((sum, s) => sum + s.kolicina * s.cena, 0),
    [stavke]
  );

  const handleAddStavka = () => {
    const newStavka: Stavka = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9),
      naziv: "",
      opis: "",
      kolicina: jeOtpremnica ? 0 : 1,
      cena: 0,
      jedinica: "kom",
    };
    setStavke((prev) => [...prev, newStavka]);
  };

  const handleUpdateStavka = (
    id: string,
    field: keyof Stavka,
    value: string | number
  ) => {
    setStavke((prev) =>
      prev.map((stavka) =>
        stavka.id === id ? { ...stavka, [field]: value } : stavka
      )
    );
  };

  const handleRemoveStavka = (id: string) => {
    setStavke((prev) => prev.filter((s) => s.id !== id));
  };

  const handlePregledStampa = () => {
    saveFakturaPregledSesija({
      stavke,
      klijentId,
      brojFakture,
      referenca,
      datumIzdavanja,
      datumPlacanja,
      napomene,
      pdvProcenat,
      popust,
      tipDokumenta,
    });
    router.push("/dashboard/fakture/pregled");
  };

  const sacuvajPayload = () => ({
    klijentId,
    brojFakture,
    referenca,
    datumIzdavanja,
    datumPlacanja,
    napomene,
    pdvProcenat,
    popust,
    tipDokumenta,
    nacinTransporta: jeOtpremnica ? nacinTransporta : "",
    adresaDostave: jeOtpremnica ? adresaDostave : "",
    registracijaVozila: jeOtpremnica ? registracijaVozila : "",
    vozac: jeOtpremnica ? vozac : "",
    stavke: stavke.map((s) => ({
      naziv: s.naziv,
      opis: s.opis,
      kolicina: s.kolicina,
      cena: jeOtpremnica ? 0 : s.cena,
      jedinica: s.jedinica,
    })),
  });

  const handleSacuvajNacrt = () => {
    setSaveError(null);
    startTransition(async () => {
      const rez = jeIzmjena
        ? await azurirajFakturu(editId, {
            ...sacuvajPayload(),
            status: "nacrt",
          })
        : await sacuvajFakturu({
            ...sacuvajPayload(),
            status: "nacrt",
          });
      if (!rez.ok) {
        setSaveError(rez.error);
        return;
      }
      prikaziToast({
        tip: "uspeh",
        poruka: jeIzmjena ? "Izmjene su sačuvane." : "Nacrt je sačuvan.",
      });
      router.push(jeIzmjena ? `/dashboard/fakture/${rez.id}/pregled` : "/dashboard/fakture");
    });
  };

  const handleIzdaj = () => {
    setSaveError(null);
    startTransition(async () => {
      const status: FakturaStatus =
        jeIzmjena && postojeciStatus !== "nacrt"
          ? postojeciStatus
          : "na_cekanju";
      const rez = jeIzmjena
        ? await azurirajFakturu(editId, {
            ...sacuvajPayload(),
            status,
          })
        : await sacuvajFakturu({
            ...sacuvajPayload(),
            status: "na_cekanju",
          });
      if (!rez.ok) {
        setSaveError(rez.error);
        return;
      }
      const porukaUspeha = jeIzmjena
        ? "Izmjene su sačuvane."
        : jeOtpremnica
          ? "Otpremnica je uspešno sačuvana."
          : tipDokumenta === "predracun"
            ? "Predračun je uspešno izdat."
            : "Faktura je uspešno izdata.";
      prikaziToast({ tip: "uspeh", poruka: porukaUspeha });
      router.push(jeIzmjena ? `/dashboard/fakture/${rez.id}/pregled` : "/dashboard/fakture");
    });
  };

  const sacuvajLabela = jeIzmjena
    ? "Sačuvaj izmjene"
    : jeOtpremnica
      ? "Sačuvaj Otpremnicu"
      : tipDokumenta === "predracun"
        ? "Izdaj Predračun"
        : "Izdaj Fakturu";

  const naslov = jeIzmjena
    ? `Izmjena — ${tipMeta.naziv}`
    : jeOtpremnica
      ? "Nova Otpremnica"
      : tipDokumenta === "predracun"
        ? "Kreiranje Predračuna"
        : "Nova Faktura";

  const podnaslov = jeIzmjena
    ? `Uredite podatke dokumenta #${brojFakture || "…"}.`
    : jeOtpremnica
      ? "Otpremnica koja prati isporuku robe ili usluga."
      : tipDokumenta === "predracun"
        ? "Popunite detalje za novi pro-forma dokument."
        : "Popunite detalje ispod kako biste generisali novu fakturu.";

  if (ucitavanje) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-8">
        <p className="text-[#64748B]">Učitavanje dokumenta…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <nav
              aria-label="Breadcrumb"
              className="text-xs text-[#64748B] mb-1 flex items-center gap-1.5"
            >
              <Link href="/dashboard/fakture" className="hover:text-fcrna">
                Dokumenti
              </Link>
              <span className="text-[#CBD5E1]">›</span>
              <span className="text-fcrna font-medium">{naslov}</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-bold text-fcrna">
              {naslov}
            </h1>
            <p className="text-sm text-[#64748B] mt-1">{podnaslov}</p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                router.push(
                  jeIzmjena
                    ? `/dashboard/fakture/${editId}/pregled`
                    : "/dashboard/fakture"
                )
              }
              disabled={isPending}
              className="rounded-lg border border-ftsiva bg-white px-4 py-2.5 text-sm font-medium text-fcrna hover:bg-fsiva transition-colors disabled:opacity-50"
            >
              Otkaži
            </button>
            {!jeOtpremnica && (!jeIzmjena || postojeciStatus === "nacrt") ? (
              <button
                type="button"
                onClick={handleSacuvajNacrt}
                disabled={isPending}
                className="rounded-lg border border-ftsiva bg-white px-4 py-2.5 text-sm font-medium text-fcrna hover:bg-fsiva transition-colors disabled:opacity-50"
              >
                {jeIzmjena ? "Sačuvaj kao nacrt" : "Sačuvaj kao nacrt"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleIzdaj}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-fplava px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-colors disabled:opacity-60"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isPending ? "Čuvanje…" : sacuvajLabela}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {saveError ? (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {saveError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Levo: glavni sadržaj */}
          <div className="lg:col-span-2 space-y-6">
            <DetaljiKartica
              tipDokumenta={tipDokumenta}
              klijenti={klijenti}
              klijentId={klijentId}
              onKlijentChange={setKlijentId}
              brojFakture={brojFakture}
              onBrojChange={setBrojFakture}
              referenca={referenca}
              onReferencaChange={setReferenca}
              datumIzdavanja={datumIzdavanja}
              onDatumIzdavanjaChange={setDatumIzdavanja}
              datumPlacanja={datumPlacanja}
              onDatumPlacanjaChange={setDatumPlacanja}
              nacinTransporta={nacinTransporta}
              onNacinTransportaChange={setNacinTransporta}
              adresaDostave={adresaDostave}
              onAdresaDostaveChange={setAdresaDostave}
              tipMetaNaziv={tipMeta.naziv}
              tipMetaPrefiks={tipMeta.brojPrefiks}
              tipMetaRokLabel={tipMeta.rokLabel}
            />

            <StavkeFakture
              stavke={stavke}
              onAddStavka={handleAddStavka}
              onUpdateStavka={handleUpdateStavka}
              onRemoveStavka={handleRemoveStavka}
              tipDokumenta={tipDokumenta}
              proizvodi={proizvodi}
              inGrid
            />

            {!jeOtpremnica ? (
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <label className="block text-sm font-bold text-fcrna mb-3">
                  Napomene
                </label>
                <textarea
                  value={napomene}
                  onChange={(e) => setNapomene(e.target.value)}
                  rows={4}
                  placeholder="Unesite dodatne informacije, uslove plaćanja ili uputstva..."
                  className="w-full rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 px-3 py-2.5 resize-y min-h-[120px]"
                />
                {tipDokumenta === "predracun" ? (
                  <p className="mt-2 text-xs text-[#94A3B8] flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      <path
                        d="M12 8v4m0 4h.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Ovaj dokument je informativnog karaktera i služi kao ponuda.
                  </p>
                ) : null}
              </section>
            ) : null}

            {!jeOtpremnica ? (
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handlePregledStampa}
                  className="text-fplava font-medium text-sm flex items-center gap-2 hover:underline"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Pogledaj pregled PDF-a
                </button>
              </div>
            ) : null}

            {jeOtpremnica ? (
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-wrap justify-between items-center gap-3 text-sm">
                <div className="text-[#64748B]">
                  Ukupno stavki:{" "}
                  <span className="font-bold text-fcrna">{stavke.length}</span>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    Ukupna količina
                  </p>
                  <p className="text-fplava text-xl font-bold tabular-nums">
                    {stavke
                      .reduce((s, x) => s + (x.kolicina || 0), 0)
                      .toLocaleString("bs-Latn-BA", {
                        maximumFractionDigits: 2,
                      })}
                  </p>
                </div>
              </section>
            ) : null}
          </div>

          {/* Desno: sidebar */}
          <div className="lg:col-span-1">
            {jeOtpremnica ? (
              <OtpremnicaLogistika
                registracijaVozila={registracijaVozila}
                onRegistracijaChange={setRegistracijaVozila}
                vozac={vozac}
                onVozacChange={setVozac}
                napomene={napomene}
                onNapomeneChange={setNapomene}
              />
            ) : (
              <PredracunSumaSidebar
                osnovica={osnovica}
                pdvProcenat={pdvProcenat}
                onPdvProcenatChange={setPdvProcenat}
                popust={popust}
                onPopustChange={setPopust}
                tipDokumenta={
                  tipDokumenta === "predracun" ? "predracun" : "faktura"
                }
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

type DetaljiKarticaProps = {
  tipDokumenta: TipDokumenta;
  klijenti: Klijent[];
  klijentId: string;
  onKlijentChange: (value: string) => void;
  brojFakture: string;
  onBrojChange: (value: string) => void;
  referenca: string;
  onReferencaChange: (value: string) => void;
  datumIzdavanja: string;
  onDatumIzdavanjaChange: (value: string) => void;
  datumPlacanja: string;
  onDatumPlacanjaChange: (value: string) => void;
  nacinTransporta: string;
  onNacinTransportaChange: (value: string) => void;
  adresaDostave: string;
  onAdresaDostaveChange: (value: string) => void;
  tipMetaNaziv: string;
  tipMetaPrefiks: string;
  tipMetaRokLabel: string;
};

function DetaljiKartica({
  tipDokumenta,
  klijenti,
  klijentId,
  onKlijentChange,
  brojFakture,
  onBrojChange,
  referenca,
  onReferencaChange,
  datumIzdavanja,
  onDatumIzdavanjaChange,
  datumPlacanja,
  onDatumPlacanjaChange,
  nacinTransporta,
  onNacinTransportaChange,
  adresaDostave,
  onAdresaDostaveChange,
  tipMetaNaziv,
  tipMetaRokLabel,
}: DetaljiKarticaProps) {
  const jeOtpremnica = tipDokumenta === "otpremnica";
  const jePredracun = tipDokumenta === "predracun";

  const klijentLabel = jeOtpremnica ? "Klijent / primalac" : "Klijent";
  const brojLabel = `Broj ${tipMetaNaziv.toLowerCase()}`;
  const datumLabel = jeOtpremnica
    ? "Datum isporuke"
    : jePredracun
      ? "Datum dokumenta"
      : "Datum izdavanja";

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Polje label={klijentLabel}>
          <div className="space-y-3">
            <KlijentBrzaPretraga
              placeholder="Pretraži klijente i firme..."
              uputstvo="Odaberite klijenta iz baze da biste ga povezali sa dokumentom."
              odabraniNaziv={
                klijenti.find((k) => k.id === klijentId)?.naziv ?? ""
              }
              onOdaberi={(stavka) => {
                if (stavka.tip === "klijent") {
                  const uListi = klijenti.find((k) => k.id === stavka.podaci.id);
                  if (uListi) {
                    onKlijentChange(uListi.id);
                    return;
                  }
                }

                const pib = stavka.podaci.pib?.trim();
                const naziv = stavka.podaci.naziv.trim();
                const poPibu = pib
                  ? klijenti.find((k) => k.pib?.trim() === pib)
                  : undefined;
                const poNazivu = klijenti.find(
                  (k) => k.naziv.trim().toLowerCase() === naziv.toLowerCase()
                );
                const match = poPibu ?? poNazivu;
                if (match) {
                  onKlijentChange(match.id);
                }
              }}
            />
            <div className="relative">
              <select
                value={klijentId}
                onChange={(e) => onKlijentChange(e.target.value)}
                className="w-full appearance-none rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 px-3 py-2.5 pr-9 cursor-pointer"
              >
                <option value="">Izaberi klijenta...</option>
                {klijenti.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.naziv}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
          {!jeOtpremnica ? (
            <Link
              href="/dashboard/klijenti/novi"
              className="mt-1.5 inline-flex items-center gap-1 text-xs text-fplava hover:underline"
            >
              <span className="text-sm leading-none">+</span> Dodaj novog
              klijenta
            </Link>
          ) : null}
        </Polje>

        <Polje label={brojLabel}>
          <input
            type="text"
            value={brojFakture}
            onChange={(e) => onBrojChange(e.target.value)}
            placeholder="Ostavite prazno za automatski broj"
            className="w-full rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 px-3 py-2.5"
          />
        </Polje>

        <Polje label={datumLabel}>
          <input
            type="date"
            value={datumIzdavanja}
            onChange={(e) => onDatumIzdavanjaChange(e.target.value)}
            className="w-full rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 px-3 py-2.5"
          />
        </Polje>

        {jeOtpremnica ? (
          <Polje label="Način transporta">
            <div className="relative">
              <select
                value={nacinTransporta}
                onChange={(e) => onNacinTransportaChange(e.target.value)}
                className="w-full appearance-none rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 px-3 py-2.5 pr-9 cursor-pointer"
              >
                {NACINI_TRANSPORTA.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </Polje>
        ) : (
          <Polje label={tipMetaRokLabel}>
            <input
              type="date"
              value={datumPlacanja}
              onChange={(e) => onDatumPlacanjaChange(e.target.value)}
              className="w-full rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 px-3 py-2.5"
            />
          </Polje>
        )}

        {jeOtpremnica ? (
          <div className="sm:col-span-2">
            <Polje label="Adresa dostave">
              <textarea
                value={adresaDostave}
                onChange={(e) => onAdresaDostaveChange(e.target.value)}
                rows={2}
                placeholder="Ulica, broj, grad i poštanski broj..."
                className="w-full rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 px-3 py-2.5 resize-y min-h-[72px]"
              />
            </Polje>
          </div>
        ) : (
          <div className="sm:col-span-2">
            <Polje label="Referenca (opcionalno)">
              <input
                type="text"
                value={referenca}
                onChange={(e) => onReferencaChange(e.target.value)}
                placeholder="Npr. PO-12345"
                className="w-full rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 px-3 py-2.5"
              />
            </Polje>
          </div>
        )}
      </div>
    </section>
  );
}

function Polje({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
