"use client";

import Link from "next/link";
import { useAuthUser } from "@/lib/useAuthUser";

type IzborFirmeHeaderProps = {
  onDodajPreduzece: () => void;
  search: string;
  onSearchChange: (value: string) => void;
};

export default function IzborFirmeHeader({
  onDodajPreduzece,
  search,
  onSearchChange,
}: IzborFirmeHeaderProps) {
  const { avatarUrl, loading } = useAuthUser();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        <Link href="/izbor-firme" className="shrink-0 font-bold text-xl text-[#137FEC]">
          FakturaOne
        </Link>

        <div className="flex-1 max-w-md hidden sm:block">
          <label className="relative block">
            <span className="sr-only">Pretraži preduzeća</span>
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Pretraži..."
              className="w-full rounded-lg border border-gray-200 bg-[#F8FAFC] py-2 pl-10 pr-3 text-sm text-fcrna placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC]"
            />
          </label>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <button
            type="button"
            aria-label="Obaveštenja"
            className="hidden sm:inline-flex p-2 rounded-lg text-[#64748B] hover:bg-gray-50 hover:text-fcrna transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <Link
            href="/dashboard/podesavanja"
            aria-label="Podešavanja"
            className="hidden sm:inline-flex p-2 rounded-lg text-[#64748B] hover:bg-gray-50 hover:text-fcrna transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </Link>
          <button
            type="button"
            onClick={onDodajPreduzece}
            className="inline-flex items-center gap-2 rounded-lg bg-[#137FEC] text-white text-sm font-semibold px-3 sm:px-4 py-2 shadow-sm hover:opacity-95 transition-opacity"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Dodaj preduzeće</span>
            <span className="sm:hidden">Novo</span>
          </button>
          <div className="h-9 w-9 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm shrink-0">
            {!loading ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
