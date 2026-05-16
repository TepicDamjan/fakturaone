import Link from "next/link";
import type { BankovniRacunRow, IzdavalacPrikaz } from "@/lib/firma";

export function FakturaLogoZaglavlje({
  izdavac,
  brojFakture,
  datumTekst,
}: {
  izdavac: IzdavalacPrikaz;
  brojFakture: string;
  datumTekst: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-8 border-b border-gray-100 pb-8">
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-xl bg-fplava flex items-center justify-center shrink-0 shadow-md">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 2L4 7v10l8 5 8-5V7l-8-5z"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-lg font-bold text-fcrna">{izdavac.naziv}</p>
          <p className="text-sm text-[#64748B]">{izdavac.tagline}</p>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-3xl sm:text-4xl font-bold text-gray-200 tracking-tight uppercase">
          Faktura
        </p>
        <p className="text-fcrna font-semibold mt-1">#{brojFakture}</p>
        <p className="text-sm text-[#64748B] mt-1">{datumTekst}</p>
      </div>
    </div>
  );
}

export function FakturaIzdavalacKolona({ izdavac }: { izdavac: IzdavalacPrikaz }) {
  return (
    <div>
      <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
        Izdavalac
      </p>
      <p className="font-semibold text-fcrna">{izdavac.naziv}</p>
      {izdavac.adresa && izdavac.adresa !== "—" ? (
        <p className="text-sm text-[#64748B] mt-1 whitespace-pre-wrap">{izdavac.adresa}</p>
      ) : null}
      {izdavac.pib ? <p className="text-sm text-[#64748B] mt-1">PIB: {izdavac.pib}</p> : null}
      {izdavac.maticniBroj ? (
        <p className="text-sm text-[#64748B]">Matični broj: {izdavac.maticniBroj}</p>
      ) : null}
      {izdavac.telefon ? <p className="text-sm text-[#64748B]">{izdavac.telefon}</p> : null}
      {izdavac.email ? <p className="text-sm text-fplava mt-2">{izdavac.email}</p> : null}
    </div>
  );
}

export function FakturaDetaljiPlacanja({
  izdavac,
  bankovniRacun,
  pozivNaBroj,
}: {
  izdavac: IzdavalacPrikaz;
  bankovniRacun: BankovniRacunRow | null;
  pozivNaBroj: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
        Detalji plaćanja
      </p>
      {bankovniRacun ? (
        <>
          <p className="text-fcrna">Banka: {bankovniRacun.naziv_banke}</p>
          <p className="text-[#64748B] mt-1">
            Na ime: {bankovniRacun.na_ime?.trim() || izdavac.naziv}
          </p>
          <p className="text-[#64748B]">Broj računa: {bankovniRacun.broj_racuna}</p>
          {bankovniRacun.swift ? (
            <p className="text-[#64748B]">SWIFT: {bankovniRacun.swift}</p>
          ) : null}
        </>
      ) : (
        <>
          <p className="text-fcrna">Banka: —</p>
          <p className="text-[#64748B] mt-1">
            Dodajte račun u{" "}
            <Link href="/dashboard/podesavanja" className="text-fplava hover:underline">
              podešavanjima firme
            </Link>
            .
          </p>
        </>
      )}
      <p className="text-[#64748B]">Poziv na broj: {pozivNaBroj}</p>
    </div>
  );
}
