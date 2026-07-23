import type { ReactNode } from "react";
import KlijentBrzaPretraga from "@/app/components/KlijentBrzaPretraga";
import { stavkaToForma } from "@/lib/brzaPretraga";

export type KlijentForma = {
  naziv: string;
  pib: string;
  maticniBroj: string;
  email: string;
  telefon: string;
  ulica: string;
  grad: string;
  postanskiBroj: string;
};

export const POCETNA_KLIJENT_FORMA: KlijentForma = {
  naziv: "",
  pib: "",
  maticniBroj: "",
  email: "",
  telefon: "",
  ulica: "",
  grad: "",
  postanskiBroj: "",
};

type PoljeProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export function KlijentPolje({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  prefix,
  suffix,
}: PoljeProps) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-fcrna mb-2">{label}</span>
      <div className="relative">
        {prefix ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">{prefix}</span>
        ) : null}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-fsiva border border-ftsiva rounded-lg text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 transition-all py-2.5 ${prefix ? "pl-9" : "pl-3"} ${suffix ? "pr-9" : "pr-3"}`}
        />
        {suffix ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">{suffix}</span>
        ) : null}
      </div>
    </label>
  );
}

type KlijentFormFieldsProps = {
  forma: KlijentForma;
  onChange: (polje: keyof KlijentForma, vrednost: string) => void;
  /** Popuni cijelu formu iz postojećeg klijenta (brza pretraga). */
  onPopuniFormu?: (forma: KlijentForma) => void;
  iskljuciKlijentId?: string;
};

export function KlijentFormFields({
  forma,
  onChange,
  onPopuniFormu,
  iskljuciKlijentId,
}: KlijentFormFieldsProps) {
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-fplava">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 21H21M5 21V7L13 3V21M19 21V11L13 7M9 9V9.01M9 12V12.01M9 15V15.01M9 18V18.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h3 className="text-sm font-bold text-fcrna tracking-wider">OSNOVNI PODACI</h3>
        </div>

        {onPopuniFormu ? (
          <div className="mb-5">
            <KlijentBrzaPretraga
              iskljuciKlijentId={iskljuciKlijentId}
              onOdaberi={(stavka) => onPopuniFormu(stavkaToForma(stavka))}
            />
          </div>
        ) : null}

        <div className="space-y-4">
          <KlijentPolje
            label="Puni naziv kompanije"
            placeholder="Npr. Primer DOO Sarajevo"
            value={forma.naziv}
            onChange={(v) => onChange("naziv", v)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KlijentPolje
              label="PIB (Poreski ID broj)"
              placeholder="123456789"
              value={forma.pib}
              onChange={(v) => onChange("pib", v)}
              suffix={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <KlijentPolje
              label="Matični broj"
              placeholder="08123456"
              value={forma.maticniBroj}
              onChange={(v) => onChange("maticniBroj", v)}
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-fplava">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21M22 11H16M19 8V14M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h3 className="text-sm font-bold text-fcrna tracking-wider">KONTAKT PODACI</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KlijentPolje
            label="Email adresa"
            placeholder="klijent@kompanija.ba"
            type="email"
            value={forma.email}
            onChange={(v) => onChange("email", v)}
            prefix={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path
                  d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <KlijentPolje
            label="Broj telefona"
            placeholder="+387 33 1234567"
            type="tel"
            value={forma.telefon}
            onChange={(v) => onChange("telefon", v)}
            prefix={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path
                  d="M22 16.92V19.92C22 20.4704 21.7893 20.999 21.4142 21.3744C21.0391 21.7498 20.5256 21.96 19.99 21.96C16.4276 21.7234 12.9925 20.5429 10.04 18.54C7.27553 16.7138 4.94824 14.3864 3.12 11.62C1.12 8.65394 -0.0613669 5.20455 0.18 1.63C0.18 1.09525 0.388699 0.582566 0.762251 0.207601C1.13581 -0.167364 1.66303 -0.378334 2.21 -0.38H5.21C6.20554 -0.388767 7.05619 0.342748 7.21 1.32C7.36087 2.32011 7.59575 3.30192 7.91 4.25C8.16317 5.02193 7.99232 5.86903 7.45 6.45L6.16 7.74C7.85539 10.5145 10.4855 13.1446 13.26 14.84L14.55 13.55C15.131 13.0077 15.9781 12.8368 16.75 13.09C17.6981 13.4042 18.6799 13.6391 19.68 13.79C20.6676 13.9447 21.4029 14.8084 21.39 15.81L22 16.92Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-fplava">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h3 className="text-sm font-bold text-fcrna tracking-wider">ADRESA SEDIŠTA</h3>
        </div>

        <div className="space-y-4">
          <KlijentPolje
            label="Ulica i broj"
            placeholder="Knez Mihailova 1"
            value={forma.ulica}
            onChange={(v) => onChange("ulica", v)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KlijentPolje
              label="Grad"
              placeholder="Sarajevo"
              value={forma.grad}
              onChange={(v) => onChange("grad", v)}
            />
            <KlijentPolje
              label="Poštanski broj"
              placeholder="11000"
              value={forma.postanskiBroj}
              onChange={(v) => onChange("postanskiBroj", v)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
