"use client";

type OtpremnicaLogistikaProps = {
  registracijaVozila: string;
  onRegistracijaChange: (value: string) => void;
  vozac: string;
  onVozacChange: (value: string) => void;
  napomene: string;
  onNapomeneChange: (value: string) => void;
};

export default function OtpremnicaLogistika({
  registracijaVozila,
  onRegistracijaChange,
  vozac,
  onVozacChange,
  napomene,
  onNapomeneChange,
}: OtpremnicaLogistikaProps) {
  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-base font-bold text-fcrna mb-4">
          Logističke Informacije
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
              Status Skladišta
            </label>
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-2 text-sm font-medium w-full">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Spremno za izdavanje
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
              Registracija Vozila
            </label>
            <input
              type="text"
              value={registracijaVozila}
              onChange={(e) => onRegistracijaChange(e.target.value)}
              placeholder="npr. SA-123-AB"
              className="w-full rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 px-3 py-2.5"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
              Vozač / Odgovorno lice
            </label>
            <input
              type="text"
              value={vozac}
              onChange={(e) => onVozacChange(e.target.value)}
              placeholder="Ime i prezime"
              className="w-full rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 px-3 py-2.5"
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-base font-bold text-fcrna mb-4">Napomene</h3>
        <textarea
          value={napomene}
          onChange={(e) => onNapomeneChange(e.target.value)}
          rows={4}
          placeholder="Interne napomene za vozača ili magacionera..."
          className="w-full rounded-lg border border-ftsiva bg-fsiva text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 px-3 py-2.5 resize-y min-h-[100px]"
        />
        <p className="mt-2 text-xs text-[#94A3B8] leading-snug">
          Ova napomena neće biti vidljiva klijentu na štampanom dokumentu.
        </p>
      </section>

      <section className="rounded-xl bg-gradient-to-br from-fplava to-blue-600 text-white shadow-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
            Pregled štampe
          </span>
        </div>
        <p className="font-semibold text-white">Generiši PDF verziju</p>
        <p className="text-sm text-white/80 mt-1 leading-snug">
          Standardni A4 format sa logotipom i poljima za potpis.
        </p>
      </section>
    </div>
  );
}
