import Link from "next/link";
import Button from "@/app/components/Button";
import Navbar from "@/app/components/Navbar";
import FeatureCard from "@/app/components/FeatureCard";
import PricingCard from "@/app/components/PricingCard";
import AnimateIn from "@/app/components/landing/AnimateIn";
import Image from "next/image";

const features = [
    {
        title: "Fakturisanje",
        description: "Kreirajte i šaljite profesionalne fakture u nekoliko klikova, sa automatskim numerisanjem.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
                <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        title: "Klijenti",
        description: "Upravljajte bazom klijenata, pratite istoriju i brzo popunjavajte podatke na fakturama.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        title: "Izveštaji",
        description: "Pregledajte prihode, neplaćene fakture i finansijske trendove na jednom mestu.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                <path d="M7 16l4-6 4 3 5-8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        title: "Mobilna aplikacija",
        description: "Pristupite fakturama i klijentima sa bilo kog uređaja, bilo kada.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.75" />
                <path d="M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
];

export default function LandingPage() {
    return (
        <div className="bg-[#05070A] text-white">
            <div className="landing-reveal landing-reveal-delay-1">
                <Navbar variant="dark" />
            </div>

            <section id="Hero" className="relative overflow-hidden">
                <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,229,255,0.12),transparent)]"
                    aria-hidden
                />

                <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pb-8 pt-12 text-center sm:px-6 sm:pt-16 md:pt-20">
                    <h1 className="landing-reveal landing-reveal-delay-1 max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                        Moderno rešenje za vaše{" "}
                        <span className="text-[#00E5FF] landing-glow-text">fakturisanje</span>
                    </h1>
                    <p className="landing-reveal landing-reveal-delay-2 mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:mt-6 sm:text-lg">
                        Ubrzajte naplatu, pratite finansije i upravljajte klijentima sa lakoćom.
                        Profesionalne fakture u nekoliko klikova.
                    </p>

                    <div className="landing-reveal landing-reveal-delay-3 mt-8 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
                        <Link href="/registracija" className="block w-full sm:w-auto">
                            <Button
                                backgroundColor="#00E5FF"
                                textColor="#05070A"
                                className="landing-glow-btn w-full rounded-lg px-6 py-3 text-base font-semibold transition-transform duration-300 hover:scale-[1.03] sm:w-auto"
                            >
                                Započnite besplatno
                            </Button>
                        </Link>
                        <Link
                            href="#pricing"
                            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-600 px-6 py-3 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:border-[#00E5FF]/50 hover:bg-white/5 sm:w-auto"
                        >
                            Pogledajte cene
                        </Link>
                    </div>

                    <div className="relative mt-12 w-full max-w-4xl sm:mt-16 md:mt-20">
                        <div
                            className="landing-glow-orb pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[90%] rounded-full bg-[#00E5FF]/20 blur-[80px]"
                            aria-hidden
                        />
                        <div className="landing-reveal landing-reveal-delay-4 relative z-10">
                            <div className="landing-float">
                                <Image
                                    src="/HeroImage.png"
                                    alt="Pregled FakturaOne platforme za fakturisanje"
                                    width={1200}
                                    height={720}
                                    priority
                                    className="mx-auto h-auto w-full drop-shadow-[0_0_48px_rgba(0,229,255,0.35)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                <div className="mx-auto max-w-6xl text-center">
                    <AnimateIn>
                        <h2 className="text-2xl font-bold sm:text-4xl">Sve što vam je potrebno</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-slate-400 sm:mt-4 sm:text-lg">
                            Kompletno rešenje za vođenje vašeg poslovanja.
                        </p>
                    </AnimateIn>

                    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-6">
                        {features.map((feature, index) => (
                            <AnimateIn key={feature.title} delay={index * 100}>
                                <FeatureCard
                                    title={feature.title}
                                    description={feature.description}
                                    icon={feature.icon}
                                    className="mx-auto w-full max-w-none"
                                />
                            </AnimateIn>
                        ))}
                    </div>
                </div>
            </section>

            <section id="pricing" className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                <div className="mx-auto max-w-6xl text-center">
                    <AnimateIn>
                        <h2 className="text-2xl font-bold sm:text-4xl">Transparentne cene</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-slate-400 sm:mt-4 sm:text-lg">
                            Izaberite paket koji najviše odgovara vašim potrebama.
                        </p>
                    </AnimateIn>

                    <div className="mt-12 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3 lg:gap-8">
                        <AnimateIn delay={0}>
                            <PricingCard
                                name="Starter"
                                price="0€"
                                period="/mesečno"
                                features={[
                                    "Do 10 faktura mesečno",
                                    "Osnovni šabloni",
                                    "Email podrška",
                                    "Izveštaji osnovnog nivoa",
                                ]}
                                ctaLabel="Započnite besplatno"
                                ctaHref="/registracija"
                            />
                        </AnimateIn>
                        <AnimateIn delay={120}>
                            <PricingCard
                                name="Professional"
                                price="15€"
                                period="/mesečno"
                                highlighted
                                features={[
                                    "Neograničene fakture",
                                    "Prilagođeni šabloni",
                                    "Automatsko slanje",
                                    "Napredni izveštaji",
                                    "Prioritetna podrška",
                                ]}
                                ctaLabel="Izaberite Professional"
                                ctaHref="/registracija"
                            />
                        </AnimateIn>
                        <AnimateIn delay={240}>
                            <PricingCard
                                name="Enterprise"
                                price="Dogovor"
                                features={[
                                    "Sve iz Professional paketa",
                                    "Više korisnika i timova",
                                    "API integracije",
                                    "Posvećen account manager",
                                    "SLA i enterprise podrška",
                                ]}
                                ctaLabel="Kontaktirajte nas"
                                ctaHref="#kontakt"
                                ctaVariant="outline"
                            />
                        </AnimateIn>
                    </div>
                </div>
            </section>
        </div>
    );
}
