"use client";



import Link from "next/link";

import { useActionState } from "react";

import AuthPageShell from "@/app/components/auth/AuthPageShell";

import AuthCard from "@/app/components/auth/AuthCard";

import AuthInputWithIcon from "@/app/components/auth/AuthInputWithIcon";

import AuthSubmitButton from "@/app/components/auth/AuthSubmitButton";

import PasswordInput from "@/app/components/auth/PasswordInput";

import {

    authLinkClass,

    authErrorClass,

    authSuccessClass,

    authLabelClass,

} from "@/app/components/auth/authStyles";

import { signup, type SignupState } from "./actions";



const initialState: SignupState = {};



function UserIcon() {

    return (

        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>

            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />

            <path d="M5 20v-1a7 7 0 0114 0v1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />

        </svg>

    );

}



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



export default function RegistracijaPage() {

    const [state, formAction, isPending] = useActionState(signup, initialState);



    return (

        <AuthPageShell showBackLink>

            <AuthCard

                mobileSubtitle="Kreirajte nalog"

                title="Kreirajte nalog"

                subtitle="Počnite sa fakturisanjem već danas. Kreditna kartica nije potrebna."

            >

                <form action={formAction} className="flex flex-col gap-5">

                    <AuthInputWithIcon

                        id="fullName"

                        name="fullName"

                        type="text"

                        label="Ime i prezime"

                        placeholder="Marko Petrović"

                        autoComplete="name"

                        required

                        icon={<UserIcon />}

                        revealClassName="auth-reveal auth-reveal-delay-3"

                    />



                    <AuthInputWithIcon

                        id="email"

                        name="email"

                        type="email"

                        label="Poslovni e-mail"

                        placeholder="marko@firma.ba"

                        autoComplete="email"

                        required

                        icon={<EnvelopeIcon />}

                        revealClassName="auth-reveal auth-reveal-delay-4"

                    />



                    <div className="auth-field-group auth-reveal auth-reveal-delay-5 flex flex-col gap-1.5">

                        <label htmlFor="password" className={authLabelClass}>

                            Lozinka

                        </label>

                        <PasswordInput

                            placeholder="Kreirajte jaku lozinku"

                            minLength={8}

                            showStrength

                        />

                    </div>



                    <label className="auth-reveal auth-reveal-delay-6 flex cursor-pointer items-start gap-3">

                        <input

                            name="terms"

                            type="checkbox"

                            required

                            className="mt-1 h-4 w-4 rounded border-white/20 bg-[#05070A] text-[#00E5FF] focus:ring-[#00E5FF]/40 focus:ring-offset-0"

                        />

                        <span className="text-sm leading-relaxed text-slate-400">

                            Prihvatam{" "}

                            <Link href="#" className={authLinkClass}>

                                Uslove korišćenja

                            </Link>{" "}

                            i{" "}

                            <Link href="#" className={authLinkClass}>

                                Politiku privatnosti

                            </Link>

                            .

                        </span>

                    </label>



                    {state?.error ? (

                        <p className={`${authErrorClass} auth-reveal auth-reveal-delay-6`}>{state.error}</p>

                    ) : null}

                    {state?.success ? (

                        <p className={`${authSuccessClass} auth-reveal auth-reveal-delay-6`}>{state.success}</p>

                    ) : null}



                    <AuthSubmitButton

                        type="submit"

                        disabled={isPending}

                        showArrow={!isPending}

                        className="auth-reveal auth-reveal-delay-7 mt-1"

                    >

                        {isPending ? "Kreiranje naloga…" : "Kreiraj nalog"}

                    </AuthSubmitButton>

                </form>



                <p className="auth-reveal auth-reveal-delay-7 mt-6 text-center text-sm text-slate-400">

                    Već imate nalog?{" "}

                    <Link href="/login" className={authLinkClass}>

                        Prijavite se

                    </Link>

                </p>

            </AuthCard>

        </AuthPageShell>

    );

}

