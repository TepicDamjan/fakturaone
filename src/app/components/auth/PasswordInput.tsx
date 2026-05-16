"use client";

import { useMemo, useState } from "react";
import { getPasswordStrength } from "@/lib/passwordStrength";

type PasswordInputProps = {
  name?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
};

export default function PasswordInput({
  name = "password",
  placeholder = "Kreirajte jaku lozinku",
  required = true,
  autoComplete = "new-password",
}: PasswordInputProps) {
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);

  const strength = useMemo(() => getPasswordStrength(value), [value]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={8}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-ftsiva bg-fsiva px-4 py-3.5 pr-11 text-fcrna outline-none transition-all placeholder:text-slate-400 focus:border-fplava focus:bg-white"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-fcrna"
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

      {value.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1">
            {[1, 2, 3, 4].map((segment) => (
              <div
                key={segment}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  strength.score >= segment ? "bg-fplava" : "bg-ftsiva"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-slate-500 shrink-0">{strength.label}</span>
        </div>
      )}
    </div>
  );
}
