import type { Metadata } from "next";
import StaticPageShell from "@/app/components/StaticPageShell";

export const metadata: Metadata = {
  title: "Centar za pomoć",
  description:
    "Odgovori na česta pitanja o FakturaOne platformi za fakturisanje, klijente i izveštaje.",
};

const faq = [
  {
    question: "Kako da kreiram prvu fakturu?",
    answer:
      "Registrujte nalog, popunite podatke o firmi u podešavanjima, dodajte klijenta i koristite opciju Nova faktura u dashboardu.",
  },
  {
    question: "Da li mogu da pošaljem fakturu emailom?",
    answer:
      "Da. Nakon kreiranja fakture možete je poslati klijentu direktno iz aplikacije, u PDF formatu.",
  },
  {
    question: "Kako da promenim paket pretplate?",
    answer:
      "U dashboardu otvorite sekciju Nadogradnja i izaberite plan koji vam odgovara.",
  },
  {
    question: "Kome mogu da se obratim za podršku?",
    answer: "Pišite nam na podrska@fakturaone.app — odgovaramo u roku od jednog radnog dana.",
  },
];

export default function PomocPage() {
  return (
    <StaticPageShell title="Centar za pomoć">
      <p>
        Pronađite brze odgovore na najčešća pitanja. Ako vam treba dodatna pomoć, kontaktirajte
        našu podršku.
      </p>
      <div className="space-y-6">
        {faq.map((item) => (
          <section key={item.question}>
            <h2 className="text-lg font-semibold text-white">{item.question}</h2>
            <p className="mt-2">{item.answer}</p>
          </section>
        ))}
      </div>
    </StaticPageShell>
  );
}
