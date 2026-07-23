"use client";

import CsvUvozDugme from "@/app/components/CsvUvozDugme";
import { uvozProizvodaCsv } from "@/app/dashboard/uvoz/actions";

export default function ProizvodiUvozDugme() {
  return (
    <CsvUvozDugme
      label="Uvoz CSV"
      hint="Zaglavlje: naziv;opis;jedinica;cena (delimiter ; ili ,)."
      onImport={uvozProizvodaCsv}
    />
  );
}
