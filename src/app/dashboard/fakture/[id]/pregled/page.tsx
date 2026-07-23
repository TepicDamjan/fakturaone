"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import DokumentPdfEmailAkcije from "@/app/components/DokumentPdfEmailAkcije";
import {
  type FakturaSaStavkama,
  type FakturaStatus,
} from "@/lib/fakture";
import {
  konvertujPredracunUFakturu,
  evidentirajPlacanje,
  stornirajFakturu,
  ucitajFakturuSaStavkama,
} from "@/app/dashboard/fakture/actions";
import {
  FakturaDetaljiPlacanja,
  FakturaIzdavalacKolona,
  FakturaLogoZaglavlje,
} from "@/app/components/FakturaFirmaNaFakturi";
import EvidentirajPlacanjeModal from "@/app/components/EvidentirajPlacanjeModal";
import { formatKlijentAdresa } from "@/lib/klijenti";
import { usePodesavanjaFirme } from "@/lib/usePodesavanjaFirme";
import { metaZaTip, parseTipDokumenta } from "@/lib/tipDokumenta";
import { useToast } from "@/app/components/toast/ToastContext";
import {
  formatDatumDugi,
  formatDatumKratki,
  zaokruziNovac,
} from "@/lib/dokument/format";

function formatIznos(amount: number) {
  return amount.toLocaleString("bs-Latn-BA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const STATUS_LABELS: Record<FakturaStatus, string> = {
  placeno: "Plaćeno",
  na_cekanju: "Na čekanju",
  kasni: "Kasni",
  nacrt: "Nacrt",
};

const STATUS_BADGE: Record<FakturaStatus, string> = {
  placeno: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  na_cekanju: "bg-orange-50 text-orange-700 border border-orange-200",
  kasni: "bg-red-50 text-red-700 border border-red-200",
  nacrt: "bg-slate-100 text-slate-600 border border-slate-200",
};

export default function SacuvanaFakturaPregledPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const { prikaziToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [placanjeModal, setPlacanjeModal] = useState(false);

  const [payload, setPayload] = useState<FakturaSaStavkama | null | undefined>(
    undefined
  );
  const { izdavac, bankovniRacun } = usePodesavanjaFirme();

  useEffect(() => {
    if (!id) {
      setPayload(null);
      return;
    }
    ucitajFakturuSaStavkama(id)
      .then(setPayload)
      .catch(() => setPayload(null));
  }, [id]);

  const f = payload?.faktura;
  const brojFakture = f?.broj?.trim() || "—";
  const tipDokumenta = parseTipDokumenta(f?.tip_dokumenta);
  const tipMeta = metaZaTip(tipDokumenta);
  const jePredracun = tipDokumenta === "predracun";
  const mozeStorno = tipDokumenta === "faktura" && f?.status !== "nacrt";

  const handleStorno = () => {
    if (
      !window.confirm(
        `Kreirati kreditnu notu (storno) za fakturu #${brojFakture}? Originalna faktura ostaje sačuvana.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await stornirajFakturu(id);
      if (!res.ok) {
        prikaziToast({ tip: "greska", poruka: res.error });
        return;
      }
      prikaziToast({ tip: "uspeh", poruka: "Kreditna nota je kreirana." });
      router.push(`/dashboard/fakture/${res.id}/pregled`);
    });
  };

  const osnovica = useMemo(() => {
    if (!payload?.stavke?.length) return 0;
    return payload.stavke.reduce(
      (s, x) => s + Number(x.kolicina) * Number(x.cena),
      0
    );
  }, [payload]);

  const pdvProcenat = f ? Number(f.pdv_procenat) : 17;
  const popust = f ? Number(f.popust) : 0;
  const pdvIznos = osnovica * (pdvProcenat / 100);
  const ukupno = zaokruziNovac(osnovica + pdvIznos - popust);
  const placenoIznos = f ? zaokruziNovac(Number(f.placeno_iznos ?? 0)) : 0;
  const preostalo = zaokruziNovac(Math.max(0, ukupno - placenoIznos));
  const mozeUplata =
    tipDokumenta === "faktura" &&
    f != null &&
    f.status !== "nacrt" &&
    f.status !== "placeno" &&
    preostalo > 0.001;

  const primalac = payload?.klijent ?? null;

  const reload = () => {
    if (!id) return;
    ucitajFakturuSaStavkama(id)
      .then(setPayload)
      .catch(() => setPayload(null));
  };

  const handleIzdajFakturu = () => {
    if (
      !window.confirm(
        `Kreirati nacrt fakture od predračuna #${brojFakture}? Stavke i klijent će biti kopirani.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await konvertujPredracunUFakturu(id);
      if (!res.ok) {
        prikaziToast({ tip: "greska", poruka: res.error });
        return;
      }
      prikaziToast({
        tip: "uspeh",
        poruka: res.vecPostojala
          ? "Faktura od ovog predračuna već postoji."
          : "Nacrt fakture je kreiran.",
      });
      router.push(`/dashboard/fakture/${res.id}/pregled`);
    });
  };

  if (payload === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-8">
        <p className="text-[#64748B]">Učitavanje…</p>
      </div>
    );
  }

  if (payload === null || !f) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8FAFC] p-8">
        <p className="text-fcrna font-medium text-center max-w-md">
          Dokument nije pronađen ili vam ne pripada.
        </p>
        <Link
          href="/dashboard/fakture"
          className="text-fplava font-semibold hover:underline"
        >
          Nazad na listu
        </Link>
      </div>
    );
  }

  const stavke = payload.stavke;
  const izvor = payload.izvor;

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-16 print:bg-white print:pb-0">
      <header className="print:hidden border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-fcrna">
                {tipMeta.naziv} #{brojFakture}
              </h1>
              <span
                className={`rounded-full px-3 py-0.5 text-sm font-semibold ${
                  tipDokumenta === "faktura" &&
                  placenoIznos > 0 &&
                  f.status !== "placeno"
                    ? "bg-sky-50 text-sky-700 border border-sky-200"
                    : STATUS_BADGE[f.status]
                }`}
              >
                {tipDokumenta === "faktura" &&
                placenoIznos > 0 &&
                f.status !== "placeno"
                  ? "Djelimično"
                  : STATUS_LABELS[f.status]}
              </span>
            </div>
            <p className="mt-1 text-sm text-[#64748B]">
              Izdato {formatDatumKratki(f.datum_izdavanja)} • {tipMeta.rokLabel}{" "}
              {formatDatumKratki(f.datum_placanja)}
            </p>
            {izvor ? (
              <p className="mt-1 text-sm text-[#64748B]">
                {tipDokumenta === "kreditna_nota"
                  ? "Storno fakture "
                  : "Nastala od predračuna "}
                <Link
                  href={`/dashboard/fakture/${izvor.id}/pregled`}
                  className="font-medium text-fplava hover:underline"
                >
                  #{izvor.broj}
                </Link>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/dashboard/fakture"
              className="inline-flex items-center gap-2 rounded-lg border border-ftsiva bg-white px-4 py-2.5 text-sm font-medium text-fcrna hover:bg-fsiva transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M19 12H5M12 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Nazad
            </Link>
            <Link
              href={`/dashboard/fakture/novafakturaforma?id=${id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-ftsiva bg-white px-4 py-2.5 text-sm font-medium text-fcrna hover:bg-fsiva transition-colors"
            >
              Izmijeni
            </Link>
            {jePredracun ? (
              <button
                type="button"
                disabled={isPending}
                onClick={handleIzdajFakturu}
                className="inline-flex items-center gap-2 rounded-lg bg-fplava px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                {isPending ? "Kreiranje…" : "Izdaj fakturu"}
              </button>
            ) : null}
            {mozeUplata ? (
              <button
                type="button"
                onClick={() => setPlacanjeModal(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                Evidentiraj uplatu
              </button>
            ) : null}
            {mozeStorno ? (
              <button
                type="button"
                disabled={isPending}
                onClick={handleStorno}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50"
              >
                Storniraj
              </button>
            ) : null}
            <DokumentPdfEmailAkcije
              fakturaId={id}
              broj={brojFakture}
              tipDokumenta={tipDokumenta}
              primalacEmail={primalac?.email}
              showPrint
              onPrint={() => window.print()}
            />
          </div>
        </div>
      </header>

      <EvidentirajPlacanjeModal
        open={placanjeModal}
        onClose={() => setPlacanjeModal(false)}
        brojDokumenta={brojFakture}
        ukupno={ukupno}
        placenoIznos={placenoIznos}
        onConfirm={async (uplata) => {
          const res = await evidentirajPlacanje(id, uplata);
          if (!res.ok) return res;
          prikaziToast({
            tip: "uspeh",
            poruka:
              res.preostalo <= 0.001
                ? "Faktura je u potpunosti plaćena."
                : `Uplata evidentirana. Preostalo: ${res.preostalo.toFixed(2)}.`,
          });
          reload();
          return { ok: true as const };
        }}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 print:mt-0 print:max-w-none print:px-8">
        <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-0">
          <div className="p-8 sm:p-10 print:p-6">
            <FakturaLogoZaglavlje
              izdavac={izdavac}
              brojFakture={brojFakture}
              datumTekst={formatDatumDugi(f.datum_izdavanja)}
            />

            <div className="grid sm:grid-cols-2 gap-8 py-8">
              <FakturaIzdavalacKolona izdavac={izdavac} />
              <div>
                <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                  Primalac
                </p>
                {primalac ? (
                  <>
                    <p className="font-semibold text-fcrna">{primalac.naziv}</p>
                    {formatKlijentAdresa(primalac) ? (
                      <p className="text-sm text-[#64748B] mt-1">
                        {formatKlijentAdresa(primalac)}
                      </p>
                    ) : null}
                    {primalac.email ? (
                      <p className="text-sm text-fplava mt-2">{primalac.email}</p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-[#94A3B8] italic">Klijent nije povezan</p>
                )}
              </div>
            </div>

            {f.referenca?.trim() ? (
              <p className="text-sm text-[#64748B] mb-4">
                Referenca:{" "}
                <span className="text-fcrna font-medium">{f.referenca}</span>
              </p>
            ) : null}

            <div className="border border-gray-100 rounded-lg overflow-hidden">
              {tipDokumenta === "otpremnica" ? (
                <div className="grid grid-cols-12 gap-2 bg-fsiva px-4 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wide">
                  <div className="col-span-8">Opis robe / materijala</div>
                  <div className="col-span-2 text-center">Jedinica</div>
                  <div className="col-span-2 text-right">Količina</div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-2 bg-fsiva px-4 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wide">
                  <div className="col-span-5">Opis</div>
                  <div className="col-span-2 text-center">Količina</div>
                  <div className="col-span-3 text-center">Jedinična cena</div>
                  <div className="col-span-2 text-right">Ukupno</div>
                </div>
              )}
              {stavke.map((row) => {
                const kolicina = Number(row.kolicina);
                const cena = Number(row.cena);
                if (tipDokumenta === "otpremnica") {
                  return (
                    <div
                      key={row.id}
                      className="grid grid-cols-12 gap-2 px-4 py-4 border-t border-gray-100 text-sm items-center"
                    >
                      <div className="col-span-8">
                        <p className="font-medium text-fcrna">
                          {row.naziv || "—"}
                        </p>
                        {row.opis ? (
                          <p className="text-[#64748B] text-xs mt-0.5">
                            {row.opis}
                          </p>
                        ) : null}
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="inline-flex items-center rounded-md bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 text-xs font-semibold">
                          {row.jedinica || "kom"}
                        </span>
                      </div>
                      <div className="col-span-2 text-right font-bold tabular-nums text-fcrna">
                        {kolicina}
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-12 gap-2 px-4 py-4 border-t border-gray-100 text-sm"
                  >
                    <div className="col-span-5">
                      <p className="font-medium text-fcrna">{row.naziv || "—"}</p>
                      {row.opis ? (
                        <p className="text-[#64748B] text-xs mt-0.5">{row.opis}</p>
                      ) : null}
                    </div>
                    <div className="col-span-2 text-center tabular-nums text-fcrna">
                      {kolicina}
                    </div>
                    <div className="col-span-3 text-center tabular-nums text-fcrna">
                      {formatIznos(cena)}
                    </div>
                    <div className="col-span-2 text-right font-semibold tabular-nums text-fcrna">
                      {formatIznos(kolicina * cena)}
                    </div>
                  </div>
                );
              })}
            </div>

            {tipDokumenta !== "otpremnica" ? (
              <div className="flex justify-end mt-8">
                <div className="w-full max-w-xs space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#64748B]">Međuzbir</span>
                    <span className="tabular-nums font-medium text-fcrna">
                      {formatIznos(osnovica)} BAM
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#64748B]">PDV ({pdvProcenat}%)</span>
                    <span className="tabular-nums font-medium text-fcrna">
                      {formatIznos(pdvIznos)} BAM
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#64748B]">Popust</span>
                    <span className="tabular-nums font-medium text-fcrna">
                      -{formatIznos(popust)} BAM
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 items-end pt-3 border-t border-gray-200">
                    <span className="text-fcrna font-semibold">
                      {tipMeta.totalLabel}
                    </span>
                    <span className="text-2xl font-bold text-fplava tabular-nums">
                      {formatIznos(ukupno)} BAM
                    </span>
                  </div>
                  {tipDokumenta === "faktura" && placenoIznos > 0 ? (
                    <>
                      <div className="flex justify-between gap-4 pt-2">
                        <span className="text-[#64748B]">Plaćeno</span>
                        <span className="tabular-nums font-medium text-emerald-700">
                          {formatIznos(placenoIznos)} BAM
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#64748B]">Preostalo</span>
                        <span className="tabular-nums font-semibold text-fcrna">
                          {formatIznos(preostalo)} BAM
                        </span>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-10 pt-8 border-t border-gray-100 grid sm:grid-cols-2 gap-8 text-sm">
              {tipDokumenta === "otpremnica" ? (
                <div>
                  <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                    Detalji isporuke
                  </p>
                  <div className="space-y-1 text-[#64748B]">
                    {f.nacin_transporta ? (
                      <p>
                        <span className="text-fcrna font-medium">Transport:</span>{" "}
                        {f.nacin_transporta}
                      </p>
                    ) : null}
                    {f.registracija_vozila ? (
                      <p>
                        <span className="text-fcrna font-medium">Vozilo:</span>{" "}
                        {f.registracija_vozila}
                      </p>
                    ) : null}
                    {f.vozac ? (
                      <p>
                        <span className="text-fcrna font-medium">Vozač:</span>{" "}
                        {f.vozac}
                      </p>
                    ) : null}
                    {f.adresa_dostave ? (
                      <p className="whitespace-pre-wrap pt-1">
                        <span className="text-fcrna font-medium">Adresa dostave:</span>
                        <br />
                        {f.adresa_dostave}
                      </p>
                    ) : null}
                    {!f.nacin_transporta &&
                    !f.registracija_vozila &&
                    !f.vozac &&
                    !f.adresa_dostave ? (
                      <p className="italic">Podaci o isporuci nisu uneti.</p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <FakturaDetaljiPlacanja
                  izdavac={izdavac}
                  bankovniRacun={bankovniRacun}
                  pozivNaBroj={brojFakture}
                />
              )}
              <div>
                <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                  Napomena
                </p>
                <p className="text-[#64748B] leading-relaxed whitespace-pre-wrap">
                  {f.napomene?.trim() || tipMeta.defaultNapomena}
                </p>
              </div>
            </div>

            {tipDokumenta === "otpremnica" ? (
              <div className="mt-10 pt-8 border-t border-gray-100 grid sm:grid-cols-2 gap-12 text-sm">
                <div>
                  <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-8">
                    Pošiljalac
                  </p>
                  <div className="border-t-2 border-dashed border-gray-300 pt-2 text-[#64748B] text-xs">
                    Potpis odgovornog lica
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-8">
                    Primalac
                  </p>
                  <div className="border-t-2 border-dashed border-gray-300 pt-2 text-[#64748B] text-xs">
                    Potpis primaoca robe
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <p className="text-center text-xs text-[#94A3B8] py-4 bg-fsiva border-t border-gray-100 print:bg-transparent">
            Generisano pomoću {izdavac.naziv}
          </p>
        </article>
      </main>
    </div>
  );
}
