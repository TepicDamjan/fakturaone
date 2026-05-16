"use client";

import Link from "next/link";
import { useActionState } from "react";
import AuthMarketingPanel from "@/app/components/auth/AuthMarketingPanel";
import PasswordInput from "@/app/components/auth/PasswordInput";
import Button from "@/app/components/Button";
import { signup, type SignupState } from "./actions";

const initialState: SignupState = {};

const inputClass =
  "w-full rounded-xl border border-ftsiva bg-fsiva px-4 py-3.5 text-fcrna outline-none transition-all placeholder:text-slate-400 focus:border-fplava focus:bg-white";

export default function RegistracijaPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <div className="flex min-h-screen bg-white">
      <AuthMarketingPanel />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-20">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-fplava transition-colors w-fit"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Nazad
          </Link>

          <div className="mx-auto w-full max-w-md">
            <h1 className="text-3xl font-bold text-fcrna tracking-tight">Kreirajte nalog</h1>
            <p className="mt-2 text-slate-500">
              Počnite sa fakturisanjem već danas. Kreditna kartica nije potrebna.
            </p>

            <form action={formAction} className="mt-8 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fullName" className="text-sm font-medium text-fcrna">
                  Ime i prezime
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Marko Petrović"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-fcrna">
                  Poslovni email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="marko@firma.rs"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-fcrna">
                  Lozinka
                </label>
                <PasswordInput />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  name="terms"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-ftsiva text-fplava focus:ring-fplava"
                />
                <span className="text-sm text-slate-600 leading-relaxed">
                  Prihvatam{" "}
                  <Link href="#" className="font-medium text-fplava hover:underline">
                    Uslove korišćenja
                  </Link>{" "}
                  i{" "}
                  <Link href="#" className="font-medium text-fplava hover:underline">
                    Politiku privatnosti
                  </Link>
                  .
                </span>
              </label>

              {state?.error && (
                <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
                  {state.error}
                </p>
              )}

              {state?.success && (
                <p className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                  {state.success}
                </p>
              )}

              <Button
                type="submit"
                backgroundColor="#137FEC"
                disabled={isPending}
                className="w-full py-3.5 text-base rounded-xl mt-1"
              >
                {isPending ? "Kreiranje naloga…" : "Kreiraj nalog"}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Već imate nalog?{" "}
              <Link href="/login" className="font-semibold text-fplava hover:underline">
                Prijavite se
              </Link>
            </p>
          </div>
        </div>

        <p className="pb-6 text-center text-xs text-slate-400 lg:hidden">
          FakturaOne — jednostavno fakturisanje
        </p>
      </div>
    </div>
  );
}
