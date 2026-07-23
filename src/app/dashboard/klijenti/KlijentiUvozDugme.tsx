"use client";

import CsvUvozDugme from "@/app/components/CsvUvozDugme";
import { uvozKlijenataCsv } from "@/app/dashboard/uvoz/actions";

export default function KlijentiUvozDugme() {
  return (
    <CsvUvozDugme
      label="Uvoz CSV"
      hint="Zaglavlje: naziv;pib;email;telefon;ulica;grad;postanski (delimiter ; ili ,)."
      onImport={uvozKlijenataCsv}
    />
  );
}
