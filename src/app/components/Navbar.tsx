'use client';

import Link from 'next/link';
import { useState } from 'react';
import Button from './Button';

const navLinks = [
    { href: '/fakture', label: 'Funkcije' },
    { href: '/klijenti', label: 'Cjenovnik' },
    { href: '/izvestaji', label: 'Kontakt' },
];

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
                <Link href="/" className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight shrink-0">
                    Faktura<span className="text-blue-600">One</span>
                </Link>

                <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="hidden sm:flex items-center gap-3 shrink-0">
                    <Link href="/registracija" className="block">
                        <Button backgroundColor="#f3f4f6" textColor="#374151">
                            Registracija
                        </Button>
                    </Link>
                    <Link href="/login" className="block">
                        <Button backgroundColor="#2563eb" textColor="#ffffff">
                            Prijava
                        </Button>
                    </Link>
                </div>

                <button
                    type="button"
                    className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
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
                <div className="md:hidden border-t border-gray-100 px-4 py-4 space-y-4 bg-white">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="block text-gray-700 font-medium py-1"
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-2 pt-2 sm:hidden">
                        <Link href="/registracija" onClick={() => setMenuOpen(false)}>
                            <Button backgroundColor="#f3f4f6" textColor="#374151" className="w-full">
                                Registracija
                            </Button>
                        </Link>
                        <Link href="/login" onClick={() => setMenuOpen(false)}>
                            <Button backgroundColor="#2563eb" textColor="#ffffff" className="w-full">
                                Prijava
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : null}
        </nav>
    );
}
