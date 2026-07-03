import Image from "next/image";
import Link from "next/link";

export default function AuthMarketingPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0B1220] via-[#0F172A] to-[#1e3a5f] p-10 xl:p-14 text-white">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-fplava/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-fplava shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-xl font-bold tracking-tight">
            Faktura<span className="text-blue-300">One</span>
          </span>
        </Link>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center py-10">
        <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
          <Image
            src="/HeroImg.png"
            alt="Pregled faktura u FakturaOne aplikaciji"
            width={800}
            height={480}
            className="h-auto w-full object-cover"
            priority
          />
        </div>

        <h2 className="mt-10 text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
          Pojednostavite fakturisanje već danas.
        </h2>
        <p className="mt-4 max-w-lg text-base text-slate-300 leading-relaxed">
          Registrujte se i dobijate{" "}
          <span className="font-semibold text-white">14 dana besplatnog Professional plana</span>{" "}
          — pun pristup bez kartice.
        </p>
      </div>

      <div className="relative z-10 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="mb-3 flex gap-1 text-amber-400" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-slate-200 italic">
          &ldquo;FakturaOne je promenio način na koji šaljemo račune klijentima.
          Interfejs je čist, a sve radi za par minuta.&rdquo;
        </p>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fplava text-sm font-bold">
            MJ
          </span>
          <div>
            <p className="text-sm font-semibold">Marko Jovanović</p>
            <p className="text-xs text-slate-400">Vlasnik, Studio M</p>
          </div>
        </div>
      </div>
    </div>
  );
}
