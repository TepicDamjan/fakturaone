import type { Metadata } from "next";
import StaticPageShell from "@/app/components/StaticPageShell";

export const metadata: Metadata = {
  title: "Bezbednost",
  description:
    "Informacije o bezbednosnim merama koje FakturaOne primenjuje radi zaštite vaših podataka.",
};

export default function BezbednostPage() {
  return (
    <StaticPageShell title="Bezbednost">
      <p>
        Bezbednost vaših poslovnih podataka prioritet je za FakturaOne. Primenujemo tehničke i
        organizacione mere kako bismo zaštitili informacije koje nam poveravate.
      </p>
      <h2 className="text-xl font-semibold text-white">Enkripcija i pristup</h2>
      <p>
        Komunikacija sa aplikacijom odvija se preko HTTPS protokola. Pristup podacima je
        ograničen na autentifikovane korisnike i servise neophodne za rad platforme.
      </p>
      <h2 className="text-xl font-semibold text-white">Čuvanje podataka</h2>
      <p>
        Podatke čuvamo u pouzdanim cloud okruženjima sa kontrolisanim pristupom i redovnim
        ažuriranjima bezbednosnih sistema.
      </p>
      <h2 className="text-xl font-semibold text-white">Prijavljivanje problema</h2>
      <p>
        Ako primetite sumnjivu aktivnost na nalogu, odmah nas kontaktirajte na{" "}
        <a href="mailto:podrska@fakturaone.app" className="text-[#00E5FF] hover:underline">
          podrska@fakturaone.app
        </a>
        .
      </p>
    </StaticPageShell>
  );
}
