import Link from 'next/link';
import Button from './Button';

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-gray-100 w-full top-0 sticky z-50">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold text-gray-800 tracking-tight">
                Faktura<span className="text-blue-600">One</span>
            </Link>

            {/* Navigacioni linkovi */}
            <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
                <Link href="/fakture" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                    Funkcije
                </Link>
                <Link href="/klijenti" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                    Cjenovnik
                </Link>
                <Link href="/izvestaji" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                    Kontakt
                </Link>
            </div>

            {/* Akcije */}
            <div className="flex items-center gap-4">
                <Button backgroundColor="#f3f4f6" textColor="#374151">
                    Registracija
                </Button>
                <Link href="/login" className="block">
                    <Button backgroundColor="#2563eb" textColor="#ffffff">
                        Prijava
                    </Button>
                </Link>
            </div>
        </nav>
    );
}
