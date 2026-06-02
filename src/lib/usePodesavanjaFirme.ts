"use client";

import { useEffect, useMemo, useState } from "react";
import {
  izdavalacIzPodesavanja,
  podrazumevaniBankovniRacun,
  type PodesavanjaFirme,
} from "@/lib/firma";
import { ucitajPodesavanjaFirme } from "@/app/dashboard/podesavanja/actions";

export function usePodesavanjaFirme() {
  const [podesavanja, setPodesavanja] = useState<PodesavanjaFirme | null>(null);

  useEffect(() => {
    ucitajPodesavanjaFirme()
      .then(setPodesavanja)
      .catch(() => setPodesavanja(null));
  }, []);

  const izdavac = useMemo(() => izdavalacIzPodesavanja(podesavanja), [podesavanja]);

  const bankovniRacun = useMemo(
    () => podrazumevaniBankovniRacun(podesavanja?.racuni ?? []),
    [podesavanja]
  );

  return { podesavanja, izdavac, bankovniRacun };
}
