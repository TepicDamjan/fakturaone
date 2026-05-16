"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchPodesavanjaFirme,
  izdavalacIzPodesavanja,
  podrazumevaniBankovniRacun,
  type PodesavanjaFirme,
} from "@/lib/firma";
import { createClient } from "@/utils/supabase/client";

export function usePodesavanjaFirme() {
  const [podesavanja, setPodesavanja] = useState<PodesavanjaFirme | null>(null);

  useEffect(() => {
    const supabase = createClient();
    fetchPodesavanjaFirme(supabase)
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
