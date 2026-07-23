'use client';

import Link from 'next/link';
import { useState } from 'react';
import Button from './Button';

const navLinks = [
    { href: '#features', label: 'Funkcije' },
    { href: '#features', label: 'Usluge' },
    { href: '#pricing', label: 'Cene' },
    { href: '#kontakt', label: 'Kontakt' },
];

type NavbarProps = {
    variant?: 'light' | 'dark';
};

export default function Navbar({ variant = 'light' }: NavbarProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const isDark = variant === 'dark';

    return (
        <nav
            className={
                isDark
                    ? 'sticky top-0 z-50 w-full border-b border-white/5 bg-[#05070A]/90 backdrop-blur-md transition-colors duration-300'
                    : 'sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm'
            }
        >
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className={`text-lg font-bold tracking-tight shrink-0 sm:text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}
                >
                    Faktura<span className={isDark ? 'text-[#00E5FF]' : 'text-blue-600'}>One</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={
                                isDark
                                    ? 'text-slate-400 hover:text-[#00E5FF] font-medium transition-all duration-300 text-sm hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                                    : 'text-gray-600 hover:text-blue-600 font-medium transition-colors'
                            }
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="hidden sm:flex items-center gap-4 shrink-0">
                    <Link
                        href="/login"
                        className={`font-medium text-sm transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'}`}
                    >
                        Prijava
                    </Link>
                    <Link href="/registracija" className="block">
                        <Button
                            backgroundColor={isDark ? '#00E5FF' : '#2563eb'}
                            textColor={isDark ? '#05070A' : '#ffffff'}
                            className={`rounded-lg px-5 py-2 text-sm font-semibold ${isDark ? '' : ''}`}
                        >
                            Registracija
                        </Button>
                    </Link>
                </div>

                <button
                    type="button"
                    className={`md:hidden p-2 rounded-lg ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}
                    aria-label={menuOpen ? 'Zatvori meni' : 'Otvori meni'}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((o) => !o)}
                >
                    {menuOpen ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    )}
                </button>
            </div>

            {menuOpen ? (
                <div
                    className={`md:hidden border-t px-4 py-4 space-y-4 ${isDark ? 'border-white/10 bg-[#05070A]' : 'border-gray-100 bg-white'}`}
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={`block font-medium py-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-2 pt-2 sm:hidden">
                        <Link href="/login" onClick={() => setMenuOpen(false)}>
                            <Button
                                backgroundColor={isDark ? 'transparent' : '#f3f4f6'}
                                textColor={isDark ? '#e2e8f0' : '#374151'}
                                className={`w-full ${isDark ? 'border border-slate-600' : ''}`}
                            >
                                Prijava
                            </Button>
                        </Link>
                        <Link href="/registracija" onClick={() => setMenuOpen(false)}>
                            <Button
                                backgroundColor={isDark ? '#00E5FF' : '#2563eb'}
                                textColor={isDark ? '#05070A' : '#ffffff'}
                                className="w-full"
                            >
                                Registracija
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : null}
        </nav>
    );
}
