"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sacuvajPonavljajucu } from "@/app/dashboard/sabloni/actions";
import { useToast } from "@/app/components/toast/ToastContext";
import {
  FREKVENCIJE,
  danasISO,
  type FrekvencijaPonavljanja,
  type SablonStavka,
} from "@/lib/sabloni";

type Props = {
  klijenti: { id: string; naziv: string }[];
  initial?: {
    id: string;
    naziv: string;
    klijentId: string;
    referenca: string;
    napomene: string;
    pdvProcenat: number;
    popust: number;
    stavke: SablonStavka[];
    frekvencija: FrekvencijaPonavljanja;
    rokPlacanjaDana: number;
    sljedeciDatum: string;
    aktivan: boolean;
  };
};

export default function PonavljajucaForma({ klijenti, initial }: Props) {
  const router = useRouter();
  const { prikaziToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [naziv, setNaziv] = useState(initial?.naziv ?? "");
  const [klijentId, setKlijentId] = useState(initial?.klijentId ?? "");
  const [referenca, setReferenca] = useState(initial?.referenca ?? "");
  const [napomene, setNapomene] = useState(initial?.napomene ?? "");
  const [pdvProcenat, setPdvProcenat] = useState(initial?.pdvProcenat ?? 17);
  const [popust, setPopust] = useState(initial?.popust ?? 0);
  const [frekvencija, setFrekvencija] = useState<FrekvencijaPonavljanja>(
    initial?.frekvencija ?? "mjesecno"
  );
  const [rokPlacanjaDana, setRokPlacanjaDana] = useState(
    initial?.rokPlacanjaDana ?? 15
  );
  const [sljedeciDatum, setSljedeciDatum] = useState(
    initial?.sljedeciDatum ?? danasISO()
  );
  const [aktivan, setAktivan] = useState(initial?.aktivan ?? true);
  const [stavke, setStavke] = useState<SablonStavka[]>(
    initial?.stavke?.length
      ? initial.stavke
      : [{ naziv: "", opis: "", kolicina: 1, cena: 0, jedinica: "kom" }]
  );

  const osnovica = useMemo(
    () => stavke.reduce((s, x) => s + x.kolicina * x.cena, 0),
    [stavke]
  );

  const sacuvaj = () => {
    startTransition(async () => {
      const rez = await sacuvajPonavljajucu(
        {
          naziv,
          klijentId,
          referenca,
          napomene,
          pdvProcenat,
          popust,
          stavke,
          frekvencija,
          rokPlacanjaDana,
          sljedeciDatum,
          aktivan,
        },
        initial?.id
      );
      if (!rez.ok) {
        prikaziToast({ tip: "greska", poruka: rez.error });
        return;
      }
      prikaziToast({ tip: "uspeh", poruka: "Raspored sačuvan." });
      router.push("/dashboard/ponavljajuce");
      router.refresh();
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm font-medium text-fcrna">
          Naziv
          <input
            value={naziv}
            onChange={(e) => setNaziv(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5"
            placeholder="npr. Hosting — klijent X"
          />
        </label>
        <label className="block text-sm font-medium text-fcrna">
          Klijent
          <select
            value={klijentId}
            onChange={(e) => setKlijentId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5"
          >
            <option value="">Izaberite klijenta</option>
            {klijenti.map((k) => (
              <option key={k.id} value={k.id}>
                {k.naziv}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-fcrna">
          Frekvencija
          <select
            value={frekvencija}
            onChange={(e) =>
              setFrekvencija(e.target.value as FrekvencijaPonavljanja)
            }
            className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5"
          >
            {FREKVENCIJE.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-fcrna">
          Sljedeći datum izdavanja
          <input
            type="date"
            value={sljedeciDatum}
            onChange={(e) => setSljedeciDatum(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium text-fcrna">
          Rok plaćanja (dana)
          <input
            type="number"
            value={rokPlacanjaDana}
            onChange={(e) => setRokPlacanjaDana(Number(e.target.value) || 0)}
            className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-fcrna mt-6">
          <input
            type="checkbox"
            checked={aktivan}
            onChange={(e) => setAktivan(e.target.checked)}
          />
          Aktivan raspored
        </label>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-semibold text-fcrna">Stavke fakture</h3>
          <button
            type="button"
            className="text-sm font-semibold text-fplava"
            onClick={() =>
              setStavke((p) => [
                ...p,
                { naziv: "", opis: "", kolicina: 1, cena: 0, jedinica: "kom" },
              ])
            }
          >
            + Dodaj
          </button>
        </div>
        <div className="space-y-2">
          {stavke.map((s, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                className="col-span-5 rounded-lg border border-ftsiva px-2 py-2 text-sm"
                placeholder="Naziv"
                value={s.naziv}
                onChange={(e) =>
                  setStavke((p) =>
                    p.map((x, j) => (j === i ? { ...x, naziv: e.target.value } : x))
                  )
                }
              />
              <input
                type="number"
                className="col-span-2 rounded-lg border border-ftsiva px-2 py-2 text-sm"
                value={s.kolicina}
                onChange={(e) =>
                  setStavke((p) =>
                    p.map((x, j) =>
                      j === i ? { ...x, kolicina: Number(e.target.value) || 0 } : x
                    )
                  )
                }
              />
              <input
                type="number"
                className="col-span-3 rounded-lg border border-ftsiva px-2 py-2 text-sm"
                value={s.cena}
                onChange={(e) =>
                  setStavke((p) =>
                    p.map((x, j) =>
                      j === i ? { ...x, cena: Number(e.target.value) || 0 } : x
                    )
                  )
                }
              />
              <button
                type="button"
                className="col-span-2 text-sm text-red-600"
                onClick={() => setStavke((p) => p.filter((_, j) => j !== i))}
              >
                Ukloni
              </button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-[#64748B]">
          Osnovica: {osnovica.toFixed(2)} · PDV {pdvProcenat}%
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm font-medium text-fcrna">
          PDV %
          <input
            type="number"
            value={pdvProcenat}
            onChange={(e) => setPdvProcenat(Number(e.target.value) || 0)}
            className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium text-fcrna">
          Popust
          <input
            type="number"
            value={popust}
            onChange={(e) => setPopust(Number(e.target.value) || 0)}
            className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium text-fcrna sm:col-span-2">
          Referenca
          <input
            value={referenca}
            onChange={(e) => setReferenca(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium text-fcrna sm:col-span-2">
          Napomene
          <textarea
            value={napomene}
            onChange={(e) => setNapomene(e.target.value)}
            rows={2}
            className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5"
          />
        </label>
      </div>

      <div className="flex gap-2">
        <Link
          href="/dashboard/ponavljajuce"
          className="rounded-lg border border-ftsiva px-4 py-2.5 text-sm font-medium"
        >
          Otkaži
        </Link>
        <button
          type="button"
          disabled={isPending || !naziv.trim() || !klijentId}
          onClick={sacuvaj}
          className="rounded-lg bg-fplava px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isPending ? "Čuvanje…" : "Sačuvaj"}
        </button>
      </div>
    </div>
  );
}
