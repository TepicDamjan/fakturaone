"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  pretraziRegistarFirmi,
  ucitajBrzaPretragaBazu,
} from "@/app/dashboard/klijenti/actions";
import {
  filtrirajBrzaPretragu,
  spojiSaRegistrom,
  stavkaMeta,
  stavkaNaziv,
  type BrzaPretragaBaza,
  type BrzaPretragaStavka,
  type FirmaZaPretragu,
} from "@/lib/brzaPretraga";

type KlijentBrzaPretragaProps = {
  onOdaberi: (stavka: BrzaPretragaStavka) => void;
  /** Ne prikazuj trenutnog klijenta (npr. pri izmjeni). */
  iskljuciKlijentId?: string;
  /** Tekst u polju nakon odabira. */
  odabraniNaziv?: string;
  placeholder?: string;
  uputstvo?: string;
};

export default function KlijentBrzaPretraga({
  onOdaberi,
  iskljuciKlijentId,
  odabraniNaziv,
  placeholder = "Pretraži klijente i firme...",
  uputstvo = "Pretražite svoje klijente i sve firme registrovane u aplikaciji — odabir automatski popunjava formu.",
}: KlijentBrzaPretragaProps) {
  const [baza, setBaza] = useState<BrzaPretragaBaza>({ klijenti: [], firme: [] });
  const [upit, setUpit] = useState("");
  const [otvoren, setOtvoren] = useState(false);
  const [ucitava, setUcitava] = useState(true);
  const [registar, setRegistar] = useState<FirmaZaPretragu[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ucitajBrzaPretragaBazu()
      .then(setBaza)
      .catch(() => setBaza({ klijenti: [], firme: [] }))
      .finally(() => setUcitava(false));
  }, []);

  useEffect(() => {
    if (odabraniNaziv !== undefined) {
      setUpit(odabraniNaziv);
    }
  }, [odabraniNaziv]);

  useEffect(() => {
    if (!otvoren) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOtvoren(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [otvoren]);

  // Pretraga zajedničkog registra svih firmi u aplikaciji (debounce 300ms)
  useEffect(() => {
    const q = upit.trim();
    if (q.length < 2) {
      setRegistar([]);
      return;
    }
    let aktivan = true;
    const t = setTimeout(() => {
      pretraziRegistarFirmi(q)
        .then((rez) => {
          if (aktivan) setRegistar(rez);
        })
        .catch(() => {
          if (aktivan) setRegistar([]);
        });
    }, 300);
    return () => {
      aktivan = false;
      clearTimeout(t);
    };
  }, [upit]);

  const filtrirani = useMemo(() => {
    const lokalni = filtrirajBrzaPretragu(baza, upit, {
      iskljuciKlijentId,
      limit: 10,
    });
    return spojiSaRegistrom(lokalni, registar, 10);
  }, [baza, upit, iskljuciKlijentId, registar]);

  const prikaziListu = otvoren && upit.trim().length > 0;

  const handleOdaberi = (stavka: BrzaPretragaStavka) => {
    setUpit(stavkaNaziv(stavka));
    setOtvoren(false);
    onOdaberi(stavka);
  };

  return (
    <div
      ref={wrapRef}
      className="rounded-xl border border-dashed border-[#BFDBFE] bg-[#EFF6FF]/60 p-4"
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-[#0F172A]">
          Pretraga registra
        </span>
        <span className="inline-flex items-center rounded-full bg-[#137FEC] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Brzo dodavanje
        </span>
      </div>

      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={upit}
          onChange={(e) => {
            setUpit(e.target.value);
            setOtvoren(true);
          }}
          onFocus={() => setOtvoren(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg border border-[#BFDBFE] bg-white text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 py-2.5 pl-10 pr-3"
        />

        {prikaziListu ? (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1"
          >
            {ucitava ? (
              <li className="px-3 py-2 text-sm text-[#64748B]">Učitavanje…</li>
            ) : filtrirani.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[#64748B]">
                Nema rezultata u bazi.
              </li>
            ) : (
              filtrirani.map((stavka) => (
                <li key={`${stavka.tip}-${stavka.podaci.id}`}>
                  <button
                    type="button"
                    role="option"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleOdaberi(stavka)}
                    className="w-full text-left px-3 py-2.5 hover:bg-[#EFF6FF] transition-colors"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="block text-sm font-semibold text-[#0F172A] truncate flex-1">
                        {stavkaNaziv(stavka)}
                      </span>
                      <span
                        className={`shrink-0 inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          stavka.tip === "firma"
                            ? "bg-violet-100 text-violet-700"
                            : stavka.tip === "registar"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {stavka.tip === "firma"
                          ? "Firma"
                          : stavka.tip === "registar"
                            ? "Registar"
                            : "Klijent"}
                      </span>
                    </span>
                    <span className="block text-xs text-[#64748B] mt-0.5 truncate">
                      {stavkaMeta(stavka)}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>

      <p className="mt-2 text-xs text-[#64748B] leading-relaxed">
        {uputstvo}
      </p>
    </div>
  );
}
