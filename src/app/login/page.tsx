"use client";



import Link from "next/link";

import AuthPageShell from "@/app/components/auth/AuthPageShell";

import AuthCard from "@/app/components/auth/AuthCard";

import AuthInputWithIcon from "@/app/components/auth/AuthInputWithIcon";

import AuthSubmitButton from "@/app/components/auth/AuthSubmitButton";

import PasswordInput from "@/app/components/auth/PasswordInput";

import { authLinkClass, authErrorClass, authLabelClass } from "@/app/components/auth/authStyles";

import { login } from "./actions";

import { useActionState } from "react";



const initialState = {

    error: "",

};



function EnvelopeIcon() {

    return (

        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>

            <path

                d="M4 6h16v12H4V6z"

                stroke="currentColor"

                strokeWidth="1.75"

                strokeLinejoin="round"

            />

            <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />

        </svg>

    );

}



export default function LoginPage() {

    const [state, formAction, isPending] = useActionState(login, initialState);



    return (

        <AuthPageShell>

            <AuthCard

                mobileSubtitle="Dobrodošli nazad"

                title="Dobrodošli nazad"

                subtitle="Unesite podatke za prijavu kako biste pristupili nalogu"

            >

                <form action={formAction} className="flex flex-col gap-5">

                    <AuthInputWithIcon

                        id="email"

                        name="email"

                        type="email"

                        label="E-mail adresa"

                        placeholder="unesite@email.com"

                        autoComplete="email"

                        required

                        icon={<EnvelopeIcon />}

                        revealClassName="auth-reveal auth-reveal-delay-3"

                    />



                    <div className="auth-field-group auth-reveal auth-reveal-delay-4 flex flex-col gap-1.5">

                        <div className="flex items-center justify-between gap-2">

                            <label htmlFor="password" className={authLabelClass}>

                                Lozinka

                            </label>

                            <Link href="#" className={`text-xs sm:text-sm ${authLinkClass}`}>

                                Zaboravili ste lozinku?

                            </Link>

                        </div>

                        <PasswordInput

                            placeholder="Unesite vašu lozinku"

                            autoComplete="current-password"

                        />

                    </div>



                    {state?.error ? (

                        <p className={`${authErrorClass} auth-reveal auth-reveal-delay-4`}>{state.error}</p>

                    ) : null}



                    <div className="auth-reveal auth-reveal-delay-5 flex flex-col items-center gap-4 pt-2">

                        <AuthSubmitButton type="submit" disabled={isPending} showArrow={!isPending}>

                            {isPending ? "Prijava u toku…" : "Prijavi se"}

                        </AuthSubmitButton>



                        <p className="text-center text-sm text-slate-400">

                            Nemate nalog?{" "}

                            <Link href="/registracija" className={authLinkClass}>

                                Registrujte se

                            </Link>

                        </p>

                    </div>

                </form>

            </AuthCard>

        </AuthPageShell>

    );

}

