import type { Metadata } from "next";
import StaticPageShell from "@/app/components/StaticPageShell";

export const metadata: Metadata = {
  title: "Uslovi korišćenja",
  description:
    "Uslovi korišćenja FakturaOne platforme za online fakturisanje i vođenje poslovanja.",
};

export default function UsloviKoriscenjaPage() {
  return (
    <StaticPageShell title="Uslovi korišćenja">
      <p>
        Korišćenjem FakturaOne usluge prihvatate sledeće uslove. Molimo vas da ih pažljivo
        pročitate pre korišćenja platforme.
      </p>
      <h2 className="text-xl font-semibold text-white">Nalog i odgovornost</h2>
      <p>
        Odgovorni ste za tačnost podataka koje unosite u sistem, kao i za bezbednost pristupnih
        podataka vašeg naloga.
      </p>
      <h2 className="text-xl font-semibold text-white">Korišćenje usluge</h2>
      <p>
        Uslugu je dozvoljeno koristiti u skladu sa važećim propisima. Zabranjeno je zloupotrebljavati
        platformu, pokušavati neovlašćen pristup ili ometati rad sistema.
      </p>
      <h2 className="text-xl font-semibold text-white">Izmene uslova</h2>
      <p>
        Uslove možemo ažurirati povremeno. O značajnim izmenama obavestićemo korisnike putem
        emaila ili obaveštenja u aplikaciji.
      </p>
    </StaticPageShell>
  );
}
