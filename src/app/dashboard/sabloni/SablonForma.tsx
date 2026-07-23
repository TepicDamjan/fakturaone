"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  sacuvajSablon,
  type DokumentSablonDetalj,
} from "@/app/dashboard/sabloni/actions";
import { useToast } from "@/app/components/toast/ToastContext";
import type { SablonStavka } from "@/lib/sabloni";
import { TIPOVI_DOKUMENATA, TIP_DOKUMENTA_META } from "@/lib/tipDokumenta";

type Props = {
  initial?: DokumentSablonDetalj | null;
  klijenti: { id: string; naziv: string }[];
};

export default function SablonForma({ initial, klijenti }: Props) {
  const router = useRouter();
  const { prikaziToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [naziv, setNaziv] = useState(initial?.naziv ?? "");
  const [tipDokumenta, setTipDokumenta] = useState(
    initial?.tipDokumenta ?? "faktura"
  );
  const [klijentId, setKlijentId] = useState(initial?.klijentId ?? "");
  const [referenca, setReferenca] = useState(initial?.referenca ?? "");
  const [napomene, setNapomene] = useState(initial?.napomene ?? "");
  const [pdvProcenat, setPdvProcenat] = useState(initial?.pdvProcenat ?? 17);
  const [popust, setPopust] = useState(initial?.popust ?? 0);
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
      const rez = await sacuvajSablon(
        {
          naziv,
          tipDokumenta,
          klijentId,
          referenca,
          napomene,
          pdvProcenat,
          popust,
          stavke,
        },
        initial?.id
      );
      if (!rez.ok) {
        prikaziToast({ tip: "greska", poruka: rez.error });
        return;
      }
      prikaziToast({ tip: "uspeh", poruka: "Šablon sačuvan." });
      router.push("/dashboard/sabloni");
      router.refresh();
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm font-medium text-fcrna">
          Naziv šablona
          <input
            value={naziv}
            onChange={(e) => setNaziv(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5"
            placeholder="npr. Mjesečni najam"
          />
        </label>
        <label className="block text-sm font-medium text-fcrna">
          Tip dokumenta
          <select
            value={tipDokumenta}
            onChange={(e) => setTipDokumenta(e.target.value as typeof tipDokumenta)}
            className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5"
          >
            {TIPOVI_DOKUMENATA.map((t) => (
              <option key={t} value={t}>
                {TIP_DOKUMENTA_META[t].naziv}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-fcrna sm:col-span-2">
          Klijent (opciono)
          <select
            value={klijentId}
            onChange={(e) => setKlijentId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5"
          >
            <option value="">— bez klijenta —</option>
            {klijenti.map((k) => (
              <option key={k.id} value={k.id}>
                {k.naziv}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-fcrna">
          Referenca
          <input
            value={referenca}
            onChange={(e) => setReferenca(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
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
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-fcrna">Stavke</h3>
          <button
            type="button"
            className="text-sm font-semibold text-fplava"
            onClick={() =>
              setStavke((prev) => [
                ...prev,
                { naziv: "", opis: "", kolicina: 1, cena: 0, jedinica: "kom" },
              ])
            }
          >
            + Dodaj
          </button>
        </div>
        <div className="space-y-3">
          {stavke.map((s, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 items-start rounded-lg border border-gray-100 p-3"
            >
              <input
                className="col-span-12 sm:col-span-5 rounded-lg border border-ftsiva px-2 py-2 text-sm"
                placeholder="Naziv"
                value={s.naziv}
                onChange={(e) =>
                  setStavke((prev) =>
                    prev.map((x, j) =>
                      j === i ? { ...x, naziv: e.target.value } : x
                    )
                  )
                }
              />
              <input
                type="number"
                className="col-span-4 sm:col-span-2 rounded-lg border border-ftsiva px-2 py-2 text-sm"
                placeholder="Kol."
                value={s.kolicina}
                onChange={(e) =>
                  setStavke((prev) =>
                    prev.map((x, j) =>
                      j === i
                        ? { ...x, kolicina: Number(e.target.value) || 0 }
                        : x
                    )
                  )
                }
              />
              <input
                type="number"
                className="col-span-4 sm:col-span-3 rounded-lg border border-ftsiva px-2 py-2 text-sm"
                placeholder="Cijena"
                value={s.cena}
                onChange={(e) =>
                  setStavke((prev) =>
                    prev.map((x, j) =>
                      j === i ? { ...x, cena: Number(e.target.value) || 0 } : x
                    )
                  )
                }
              />
              <button
                type="button"
                className="col-span-4 sm:col-span-2 text-sm text-red-600"
                onClick={() =>
                  setStavke((prev) => prev.filter((_, j) => j !== i))
                }
              >
                Ukloni
              </button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-[#64748B]">
          Osnovica: {osnovica.toFixed(2)} BAM
        </p>
      </div>

      <label className="block text-sm font-medium text-fcrna">
        Napomene
        <textarea
          value={napomene}
          onChange={(e) => setNapomene(e.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-lg border border-ftsiva px-3 py-2.5"
        />
      </label>

      <div className="flex gap-2">
        <Link
          href="/dashboard/sabloni"
          className="rounded-lg border border-ftsiva px-4 py-2.5 text-sm font-medium"
        >
          Otkaži
        </Link>
        <button
          type="button"
          disabled={isPending || !naziv.trim()}
          onClick={sacuvaj}
          className="rounded-lg bg-fplava px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isPending ? "Čuvanje…" : "Sačuvaj šablon"}
        </button>
      </div>
    </div>
  );
}
