import type { Metadata } from "next";
import StaticPageShell from "@/app/components/StaticPageShell";

export const metadata: Metadata = {
  title: "Politika privatnosti",
  description:
    "Saznajte kako FakturaOne prikuplja, koristi i štiti vaše lične i poslovne podatke.",
};

export default function PolitikaPrivatnostiPage() {
  return (
    <StaticPageShell title="Politika privatnosti">
      <p>
        FakturaOne poštuje vašu privatnost. Ova stranica opisuje koje podatke prikupljamo,
        kako ih koristimo i koja su vaša prava u vezi sa obradom podataka.
      </p>
      <h2 className="text-xl font-semibold text-white">Koje podatke prikupljamo</h2>
      <p>
        Pri registraciji i korišćenju usluge možemo obraditi podatke o nalogu (ime, email),
        podatke o firmi (naziv, PIB, adresa) i podatke o fakturama i klijentima koje unesete u
        aplikaciju.
      </p>
      <h2 className="text-xl font-semibold text-white">Kako koristimo podatke</h2>
      <p>
        Podatke koristimo isključivo za pružanje usluge fakturisanja, održavanje naloga,
        bezbednost sistema i komunikaciju u vezi sa vašim nalogom.
      </p>
      <h2 className="text-xl font-semibold text-white">Kontakt</h2>
      <p>
        Za pitanja u vezi sa privatnošću pišite na{" "}
        <a href="mailto:podrska@fakturaone.app" className="text-[#00E5FF] hover:underline">
          podrska@fakturaone.app
        </a>
        .
      </p>
    </StaticPageShell>
  );
}
