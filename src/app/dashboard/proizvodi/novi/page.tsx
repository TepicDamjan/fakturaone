"use client";

import ProizvodForma from "@/app/components/ProizvodForma";
import { sacuvajProizvod } from "@/app/dashboard/proizvodi/actions";

export default function NoviProizvod() {
  return (
    <ProizvodForma
      naslov="Novi proizvod"
      onSacuvaj={sacuvajProizvod}
      porukaUspeha="Proizvod je dodat u katalog."
    />
  );
}
