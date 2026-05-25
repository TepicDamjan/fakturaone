"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  sacuvajPodesavanjaFirme,
  type BankovniRacunInput,
  type SacuvajFirmuInput,
} from "@/app/dashboard/podesavanja/actions";
import PodesavanjaLogoFirme from "@/app/dashboard/podesavanja/PodesavanjaLogoFirme";
import type { BankovniRacunRow, FirmaRow } from "@/lib/firma";

type RacunForm = BankovniRacunInput & { key: string };

type Props = {
  initialFirma: FirmaRow | null;
  initialRacuni: BankovniRacunRow[];
};

function newRacunKey() {
  return `new-${crypto.randomUUID()}`;
}

function racunFromRow(r: BankovniRacunRow): RacunForm {
  return {
    key: r.id,
    id: r.id,
    nazivBanke: r.naziv_banke,
    brojRacuna: r.broj_racuna,
    naIme: r.na_ime ?? "",
    swift: r.swift ?? "",
    jePodrazumevani: r.je_podrazumevani,
  };
}

function emptyRacun(): RacunForm {
  return {
    key: newRacunKey(),
    nazivBanke: "",
    brojRacuna: "",
    naIme: "",
    swift: "",
    jePodrazumevani: false,
  };
}

function firmaFromRow(f: FirmaRow | null): SacuvajFirmuInput {
  return {
    naziv: f?.naziv ?? "",
    pib: f?.pib ?? "",
    maticniBroj: f?.maticni_broj ?? "",
    adresa: f?.adresa ?? "",
    email: f?.email ?? "",
    telefon: f?.telefon ?? "",
    valuta: f?.valuta ?? "RSD",
    pdvProcenat: f ? Number(f.pdv_procenat) : 20,
    rokPlacanjaDana: f?.rok_placanja_dana ?? 15,
  };
}

const VALUTE = [
  { value: "RSD", label: "RSD (Srpski dinar)" },
  { value: "EUR", label: "EUR (Evro)" },
  { value: "USD", label: "USD (Američki dolar)" },
];

export default function PodesavanjaFirmaForm({ initialFirma, initialRacuni }: Props) {
  const router = useRouter();
  const initialFirmaForm = useMemo(() => firmaFromRow(initialFirma), [initialFirma]);
  const initialRacuniForm = useMemo(
    () => (initialRacuni.length > 0 ? initialRacuni.map(racunFromRow) : []),
    [initialRacuni]
  );

  const [firma, setFirma] = useState<SacuvajFirmuInput>(initialFirmaForm);
  const [racuni, setRacuni] = useState<RacunForm[]>(initialRacuniForm);
  const [greska, setGreska] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    setFirma(initialFirmaForm);
    setRacuni(initialRacuniForm);
    setGreska(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setGreska(null);
    const payload: BankovniRacunInput[] = racuni.map(({ key: _k, ...r }) => r);
    startTransition(async () => {
      const res = await sacuvajPodesavanjaFirme(firma, payload);
      if (!res.ok) {
        setGreska(res.error);
        return;
      }
      router.refresh();
    });
  };

  const setPodrazumevani = (key: string) => {
    setRacuni((prev) =>
      prev.map((r) => ({ ...r, jePodrazumevani: r.key === key }))
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
      {greska ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {greska}
        </div>
      ) : null}

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-6">
              <PodesavanjaLogoFirme initialLogoUrl={initialFirma?.logo_url ?? null} />

              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-fcrna">Detalji o firmi</h2>
                <p className="text-sm text-[#64748B] mt-1 mb-6">
                  Ažurirajte zvanične podatke koji se prikazuju na fakturama.
                </p>

                <div className="space-y-4">
                  <Field
                    label="Naziv firme"
                    value={firma.naziv}
                    onChange={(v) => setFirma((f) => ({ ...f, naziv: v }))}
                    placeholder="Moja Firma d.o.o."
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field
                      label="PIB"
                      value={firma.pib}
                      onChange={(v) => setFirma((f) => ({ ...f, pib: v }))}
                      placeholder="123456789"
                    />
                    <Field
                      label="Matični broj"
                      value={firma.maticniBroj}
                      onChange={(v) => setFirma((f) => ({ ...f, maticniBroj: v }))}
                      placeholder="08123456"
                    />
                  </div>
                  <label className="block">
                    <span className="block text-sm font-medium text-fcrna mb-2">Adresa</span>
                    <textarea
                      value={firma.adresa}
                      onChange={(e) => setFirma((f) => ({ ...f, adresa: e.target.value }))}
                      rows={3}
                      placeholder="Bulevar Oslobođenja 12, Novi Sad"
                      className="w-full bg-fsiva border border-ftsiva rounded-lg text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 py-2.5 px-3 resize-y min-h-[88px]"
                    />
                  </label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field
                      label="Email"
                      type="email"
                      value={firma.email}
                      onChange={(v) => setFirma((f) => ({ ...f, email: v }))}
                      placeholder="firma@primer.rs"
                    />
                    <Field
                      label="Telefon"
                      type="tel"
                      value={firma.telefon}
                      onChange={(v) => setFirma((f) => ({ ...f, telefon: v }))}
                      placeholder="+381 11 123 4567"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-fcrna">Bankovni računi</h2>
                    <p className="text-sm text-[#64748B] mt-1">
                      Dodajte račune za uplatu koje će se prikazivati na fakturama.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRacuni((prev) => [...prev, emptyRacun()])}
                    className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-fplava hover:text-blue-700 transition-colors"
                  >
                    <span className="text-lg leading-none">+</span>
                    Dodaj račun
                  </button>
                </div>

                {racuni.length === 0 ? (
                  <p className="text-sm text-[#94A3B8] py-6 text-center border border-dashed border-gray-200 rounded-lg mt-6">
                    Nema dodatih računa. Kliknite „Dodaj račun” da unesete prvi.
                  </p>
                ) : (
                  <div className="space-y-4 mt-6">
                    {racuni.map((r, index) => (
                      <div
                        key={r.key}
                        className="rounded-lg border border-gray-100 bg-fsiva/40 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                            Račun {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setRacuni((prev) => prev.filter((x) => x.key !== r.key))
                            }
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Ukloni
                          </button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field
                            label="Naziv banke"
                            value={r.nazivBanke}
                            onChange={(v) =>
                              setRacuni((prev) =>
                                prev.map((x) =>
                                  x.key === r.key ? { ...x, nazivBanke: v } : x
                                )
                              )
                            }
                            placeholder="Primer banka a.d."
                          />
                          <Field
                            label="Broj računa"
                            value={r.brojRacuna}
                            onChange={(v) =>
                              setRacuni((prev) =>
                                prev.map((x) =>
                                  x.key === r.key ? { ...x, brojRacuna: v } : x
                                )
                              )
                            }
                            placeholder="340-000000000000-00"
                          />
                          <Field
                            label="Na ime"
                            value={r.naIme}
                            onChange={(v) =>
                              setRacuni((prev) =>
                                prev.map((x) => (x.key === r.key ? { ...x, naIme: v } : x))
                              )
                            }
                            placeholder={firma.naziv || "Naziv primaoca"}
                          />
                          <Field
                            label="SWIFT (opciono)"
                            value={r.swift}
                            onChange={(v) =>
                              setRacuni((prev) =>
                                prev.map((x) => (x.key === r.key ? { ...x, swift: v } : x))
                              )
                            }
                            placeholder="AAAARSBG"
                          />
                        </div>
                        <label className="flex items-center gap-2 mt-3 cursor-pointer">
                          <input
                            type="radio"
                            name="podrazumevani-racun"
                            checked={r.jePodrazumevani}
                            onChange={() => setPodrazumevani(r.key)}
                            className="text-fplava focus:ring-fplava"
                          />
                          <span className="text-sm text-[#64748B]">
                            Podrazumevani račun na fakturi
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-fcrna">Podešavanja fakture</h2>
                <p className="text-sm text-[#64748B] mt-1 mb-6">
                  Podrazumevane vrednosti za nove fakture.
                </p>
                <div className="space-y-4">
                  <label className="block">
                    <span className="block text-sm font-medium text-fcrna mb-2">Valuta</span>
                    <select
                      value={firma.valuta}
                      onChange={(e) => setFirma((f) => ({ ...f, valuta: e.target.value }))}
                      className="w-full bg-fsiva border border-ftsiva rounded-lg text-sm text-fcrna outline-none focus:border-fplava py-2.5 px-3"
                    >
                      {VALUTE.map((v) => (
                        <option key={v.value} value={v.value}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-sm font-medium text-fcrna mb-2">
                      Podrazumevani PDV (%)
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={firma.pdvProcenat}
                        onChange={(e) =>
                          setFirma((f) => ({
                            ...f,
                            pdvProcenat: Number(e.target.value),
                          }))
                        }
                        className="w-full bg-fsiva border border-ftsiva rounded-lg text-sm text-fcrna outline-none focus:border-fplava py-2.5 pl-3 pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#94A3B8]">
                        %
                      </span>
                    </div>
                  </label>
                  <label className="block">
                    <span className="block text-sm font-medium text-fcrna mb-2">
                      Rok plaćanja
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={365}
                        value={firma.rokPlacanjaDana}
                        onChange={(e) =>
                          setFirma((f) => ({
                            ...f,
                            rokPlacanjaDana: Number(e.target.value),
                          }))
                        }
                        className="w-full bg-fsiva border border-ftsiva rounded-lg text-sm text-fcrna outline-none focus:border-fplava py-2.5 pl-3 pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#94A3B8]">
                        dana
                      </span>
                    </div>
                  </label>
                </div>
              </section>

              <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-5">
                <p className="text-sm font-semibold text-fcrna">Treba vam pomoć?</p>
                <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                  Za pitanja o podešavanjima firme i fakturisanju pišite na{" "}
                  <a
                    href="mailto:podrska@fakturaone.rs"
                    className="text-fplava font-medium hover:underline"
                  >
                    podrska@fakturaone.rs
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={handleReset}
          disabled={isPending}
          className="text-sm font-medium text-[#64748B] hover:text-fcrna px-4 py-2.5 transition-colors disabled:opacity-50"
        >
          Otkaži
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="bg-fplava hover:bg-blue-600 text-white text-sm font-semibold py-2.5 px-5 rounded-lg shadow-sm transition-colors disabled:opacity-60"
        >
          {isPending ? "Čuvanje…" : "Sačuvaj promene"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-fcrna mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-fsiva border border-ftsiva rounded-lg text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 py-2.5 px-3"
      />
    </label>
  );
}
