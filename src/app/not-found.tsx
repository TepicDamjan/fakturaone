import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl font-bold text-fplava mb-4">404</p>
      <h1 className="text-xl font-bold text-fcrna mb-2">
        Stranica nije pronađena
      </h1>
      <p className="text-sm text-[#94A3B8] mb-8">
        Stranica koju tražite ne postoji ili je premeštena.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-lg bg-fplava px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
      >
        Nazad na komandnu tablu
      </Link>
    </div>
  );
}
