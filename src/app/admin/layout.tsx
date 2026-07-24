import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin.server";
import { NOINDEX_ROBOTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admin panel",
  robots: NOINDEX_ROBOTS,
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold text-fcrna">
              FakturaOne{" "}
              <span className="text-fplava font-semibold text-sm align-middle rounded-full bg-blue-50 px-2 py-0.5 ml-1">
                Admin
              </span>
            </span>
            <nav className="flex items-center gap-5 text-sm font-medium text-[#64748B]">
              <Link href="/admin" className="hover:text-fcrna transition-colors">
                Pregled
              </Link>
              <Link
                href="/admin/korisnici"
                className="hover:text-fcrna transition-colors"
              >
                Korisnici
              </Link>
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-fplava hover:text-blue-700 transition-colors"
          >
            ← Nazad u aplikaciju
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
