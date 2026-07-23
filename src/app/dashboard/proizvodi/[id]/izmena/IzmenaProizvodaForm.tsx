"use client";

import ProizvodForma from "@/app/components/ProizvodForma";
import { azurirajProizvod } from "@/app/dashboard/proizvodi/actions";
import type { Proizvod } from "@/lib/proizvodi";

export default function IzmenaProizvodaForm({
  proizvod,
}: {
  proizvod: Proizvod;
}) {
  return (
    <ProizvodForma
      naslov="Izmena proizvoda"
      pocetneVrednosti={{
        naziv: proizvod.naziv,
        opis: proizvod.opis ?? "",
        jedinica: proizvod.jedinica,
        cena: String(proizvod.cena ?? ""),
      }}
      onSacuvaj={(input) => azurirajProizvod(proizvod.id, input)}
      porukaUspeha="Izmene proizvoda su sačuvane."
    />
  );
}
