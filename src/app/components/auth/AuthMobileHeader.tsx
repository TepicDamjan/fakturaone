interface AuthMobileHeaderProps {
    subtitle: string;
}

export default function AuthMobileHeader({ subtitle }: AuthMobileHeaderProps) {
    return (
        <div className="mb-8 flex flex-col items-center text-center md:hidden">
            <div className="auth-icon-glow auth-reveal auth-reveal-delay-1 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#05070A]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#00E5FF]" aria-hidden>
                    <path
                        d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            <p className="auth-glow-text auth-reveal auth-reveal-delay-2 mt-5 text-2xl font-bold tracking-tight text-[#00E5FF]">
                FakturaOne
            </p>
            <p className="auth-reveal auth-reveal-delay-3 mt-2 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
                {subtitle}
            </p>
        </div>
    );
}
