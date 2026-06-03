'use client';

import Link from 'next/link';
import AnimateIn from '@/app/components/landing/AnimateIn';

const footerLinks = [
    { href: '#', label: 'Politika privatnosti' },
    { href: '#', label: 'Uslovi korišćenja' },
    { href: '#', label: 'Bezbednost' },
    { href: '#', label: 'Centar za pomoć' },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <AnimateIn>
            <footer id="kontakt" className="border-t border-white/10 bg-[#05070A] py-10 sm:py-12">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:px-8">
                    <Link href="/" className="text-lg font-bold text-white">
                        Faktura<span className="text-[#00E5FF]">One</span>
                    </Link>

                    <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                        {footerLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-sm text-slate-500 transition-colors duration-300 hover:text-[#00E5FF]"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <p className="text-center text-sm text-slate-500 lg:text-right">
                        &copy; {year} FakturaOne. Sva prava zadržana.
                    </p>
                </div>
            </footer>
        </AnimateIn>
    );
}
