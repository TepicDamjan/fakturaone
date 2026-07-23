"use client";

import { useMemo, useState } from "react";
import { getPasswordStrength } from "@/lib/passwordStrength";
import { authInputClass } from "./authStyles";

type PasswordInputProps = {
    name?: string;
    placeholder?: string;
    required?: boolean;
    autoComplete?: string;
    minLength?: number;
    showStrength?: boolean;
    showLockIcon?: boolean;
    className?: string;
    revealClassName?: string;
};

function LockIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
            <path
                d="M8 11V8a4 4 0 118 0v3"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
            />
        </svg>
    );
}

export default function PasswordInput({
    name = "password",
    placeholder = "Unesite vašu lozinku",
    required = true,
    autoComplete = "new-password",
    minLength,
    showStrength = false,
    showLockIcon = true,
    className = "",
    revealClassName = "",
}: PasswordInputProps) {
    const [value, setValue] = useState("");
    const [visible, setVisible] = useState(false);

    const strength = useMemo(() => getPasswordStrength(value), [value]);
    const leftPadding = showLockIcon ? "pl-11" : "";

    return (
        <div className={`flex flex-col gap-2 ${revealClassName}`}>
            <div className="relative">
                {showLockIcon ? (
                    <span className="auth-input-icon pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-300">
                        <LockIcon />
                    </span>
                ) : null}
                <input
                    name={name}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    minLength={minLength}
                    autoComplete={autoComplete}
                    className={`${authInputClass} pr-11 ${leftPadding} ${className}`}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-all duration-300 hover:scale-110 hover:text-[#00E5FF]"
                    aria-label={visible ? "Sakrij lozinku" : "Prikaži lozinku"}
                >
                    {visible ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path
                                d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path
                                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    )}
                </button>
            </div>

            {showStrength && value.length > 0 && (
                <div className="flex items-center gap-3">
                    <div className="flex flex-1 gap-1">
                        {[1, 2, 3, 4].map((segment) => (
                            <div
                                key={segment}
                                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                                    strength.score >= segment ? "bg-[#00E5FF]" : "bg-white/10"
                                }`}
                            />
                        ))}
                    </div>
                    <span className="shrink-0 text-xs font-medium text-slate-500">{strength.label}</span>
                </div>
            )}
        </div>
    );
}
