"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sacuvajKlijenta } from "@/app/dashboard/klijenti/actions";

type KlijentForma = {
    naziv: string;
    pib: string;
    maticniBroj: string;
    email: string;
    telefon: string;
    ulica: string;
    grad: string;
    postanskiBroj: string;
};

const POCETNA_FORMA: KlijentForma = {
    naziv: "",
    pib: "",
    maticniBroj: "",
    email: "",
    telefon: "",
    ulica: "",
    grad: "",
    postanskiBroj: "",
};

export default function NoviKlijent() {
    const router = useRouter();
    const [forma, setForma] = useState<KlijentForma>(POCETNA_FORMA);
    const [greska, setGreska] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleChange = (polje: keyof KlijentForma, vrednost: string) => {
        setForma((prev) => ({ ...prev, [polje]: vrednost }));
        setGreska(null);
    };

    const handlePonisti = () => {
        setForma(POCETNA_FORMA);
        setGreska(null);
        router.push("/dashboard/klijenti");
    };

    const handleSacuvaj = (e: FormEvent) => {
        e.preventDefault();
        setGreska(null);
        startTransition(async () => {
            const rez = await sacuvajKlijenta(forma);
            if (rez.ok) {
                router.push("/dashboard/klijenti");
                return;
            }
            setGreska(rez.error);
        });
    };

    return (
        <form onSubmit={handleSacuvaj} className="flex flex-col min-h-full">
            <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/klijenti"
                        aria-label="Nazad na klijente"
                        className="text-[#0F172A] hover:text-fplava transition-colors"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-bold text-fcrna">Novi klijent</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handlePonisti}
                        className="text-sm font-medium text-[#64748B] hover:text-fcrna px-3 py-2 transition-colors"
                    >
                        Poništi
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-fplava hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isPending ? "Čuvanje…" : "Sačuvaj klijenta"}
                    </button>
                </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto mb-6">
                    {greska ? (
                        <div
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                        >
                            {greska}
                        </div>
                    ) : null}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 max-w-6xl mx-auto">
                    <aside className="space-y-6">
                        <div>
                            <h2 className="text-base font-bold text-fcrna mb-2">
                                Informacije o klijentu
                            </h2>
                            <p className="text-sm text-[#64748B] leading-relaxed">
                                Unesite zvanične podatke o pravnom licu ili preduzetniku.
                                Ovi podaci će se direktno prikazivati na vašim izlaznim
                                fakturama.
                            </p>
                        </div>

                        <div className="bg-white border border-ftsiva rounded-lg p-4 flex gap-3 shadow-sm">
                            <div className="shrink-0 w-9 h-9 rounded-full bg-fplava/10 flex items-center justify-center text-fplava">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-fcrna">
                                    Automatska provera
                                </p>
                                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                                    Unesite PIB za automatsko povlačenje podataka iz
                                    registra NBS.
                                </p>
                            </div>
                        </div>

                        <div className="aspect-square rounded-xl overflow-hidden border border-ftsiva shadow-sm bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#137FEC] relative">
                            <div className="absolute inset-0 flex items-end justify-center pb-6 opacity-90">
                                <svg width="120" height="160" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <polygon points="60,10 100,150 20,150" fill="#1E3A8A" stroke="#93C5FD" strokeWidth="1" />
                                    <polygon points="60,10 60,150 100,150" fill="#0F172A" opacity="0.55" />
                                    <line x1="40" y1="60" x2="80" y2="60" stroke="#60A5FA" strokeWidth="0.5" opacity="0.6" />
                                    <line x1="35" y1="80" x2="85" y2="80" stroke="#60A5FA" strokeWidth="0.5" opacity="0.6" />
                                    <line x1="30" y1="100" x2="90" y2="100" stroke="#60A5FA" strokeWidth="0.5" opacity="0.6" />
                                    <line x1="25" y1="120" x2="95" y2="120" stroke="#60A5FA" strokeWidth="0.5" opacity="0.6" />
                                </svg>
                            </div>
                        </div>
                    </aside>

                    <div className="space-y-6">
                        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-fplava">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 21H21M5 21V7L13 3V21M19 21V11L13 7M9 9V9.01M9 12V12.01M9 15V15.01M9 18V18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <h3 className="text-sm font-bold text-fcrna tracking-wider">
                                    OSNOVNI PODACI
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <Polje
                                    label="Puni naziv kompanije"
                                    placeholder="Npr. Primer DOO Beograd"
                                    value={forma.naziv}
                                    onChange={(v) => handleChange("naziv", v)}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Polje
                                        label="PIB (Poreski ID broj)"
                                        placeholder="123456789"
                                        value={forma.pib}
                                        onChange={(v) => handleChange("pib", v)}
                                        suffix={
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                                <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        }
                                    />
                                    <Polje
                                        label="Matični broj"
                                        placeholder="08123456"
                                        value={forma.maticniBroj}
                                        onChange={(v) => handleChange("maticniBroj", v)}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-fplava">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21M22 11H16M19 8V14M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <h3 className="text-sm font-bold text-fcrna tracking-wider">
                                    KONTAKT PODACI
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Polje
                                    label="Email adresa"
                                    placeholder="klijent@kompanija.rs"
                                    type="email"
                                    value={forma.email}
                                    onChange={(v) => handleChange("email", v)}
                                    prefix={
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    }
                                />
                                <Polje
                                    label="Broj telefona"
                                    placeholder="+381 11 1234567"
                                    type="tel"
                                    value={forma.telefon}
                                    onChange={(v) => handleChange("telefon", v)}
                                    prefix={
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                            <path d="M22 16.92V19.92C22 20.4704 21.7893 20.999 21.4142 21.3744C21.0391 21.7498 20.5256 21.96 19.99 21.96C16.4276 21.7234 12.9925 20.5429 10.04 18.54C7.27553 16.7138 4.94824 14.3864 3.12 11.62C1.12 8.65394 -0.0613669 5.20455 0.18 1.63C0.18 1.09525 0.388699 0.582566 0.762251 0.207601C1.13581 -0.167364 1.66303 -0.378334 2.21 -0.38H5.21C6.20554 -0.388767 7.05619 0.342748 7.21 1.32C7.36087 2.32011 7.59575 3.30192 7.91 4.25C8.16317 5.02193 7.99232 5.86903 7.45 6.45L6.16 7.74C7.85539 10.5145 10.4855 13.1446 13.26 14.84L14.55 13.55C15.131 13.0077 15.9781 12.8368 16.75 13.09C17.6981 13.4042 18.6799 13.6391 19.68 13.79C20.6676 13.9447 21.4029 14.8084 21.39 15.81L22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    }
                                />
                            </div>
                        </section>

                        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-fplava">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <h3 className="text-sm font-bold text-fcrna tracking-wider">
                                    ADRESA SEDIŠTA
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <Polje
                                    label="Ulica i broj"
                                    placeholder="Knez Mihailova 1"
                                    value={forma.ulica}
                                    onChange={(v) => handleChange("ulica", v)}
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Polje
                                        label="Grad"
                                        placeholder="Beograd"
                                        value={forma.grad}
                                        onChange={(v) => handleChange("grad", v)}
                                    />
                                    <Polje
                                        label="Poštanski broj"
                                        placeholder="11000"
                                        value={forma.postanskiBroj}
                                        onChange={(v) => handleChange("postanskiBroj", v)}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
                <div className="pointer-events-auto bg-[#0F172A] text-white text-sm font-medium rounded-full shadow-lg pl-3 pr-5 py-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                    Kliknite „Sačuvaj klijenta” da bi podaci bili upisani u bazu.
                </div>
            </div>
        </form>
    );
}

type PoljeProps = {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    prefix?: ReactNode;
    suffix?: ReactNode;
};

function Polje({ label, placeholder, value, onChange, type = "text", prefix, suffix }: PoljeProps) {
    return (
        <label className="block">
            <span className="block text-sm font-medium text-fcrna mb-2">{label}</span>
            <div className="relative">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                        {prefix}
                    </span>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full bg-fsiva border border-ftsiva rounded-lg text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 transition-all py-2.5 ${prefix ? "pl-9" : "pl-3"} ${suffix ? "pr-9" : "pr-3"}`}
                />
                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                        {suffix}
                    </span>
                )}
            </div>
        </label>
    );
}
