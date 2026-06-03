import Link from 'next/link';
import type { ReactNode } from 'react';

interface AuthPageShellProps {
    children: ReactNode;
    showBackLink?: boolean;
}

export default function AuthPageShell({ children, showBackLink = false }: AuthPageShellProps) {
    const year = new Date().getFullYear();

    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:py-12">
            <div
                className="auth-glow-orb pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(0,229,255,0.08),transparent)]"
                aria-hidden
            />
            <div
                className="auth-glow-orb pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,229,255,0.12),transparent)] md:hidden"
                style={{ animationDelay: '0.5s' }}
                aria-hidden
            />
            <div
                className="auth-glow-orb pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(0,229,255,0.08),transparent)] md:hidden"
                style={{ animationDelay: '1s' }}
                aria-hidden
            />

            {showBackLink ? (
                <Link
                    href="/"
                    className="auth-reveal auth-reveal-delay-1 relative z-10 mb-4 hidden items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-[#00E5FF] md:mb-6 md:inline-flex md:w-full md:max-w-md"
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
                    Nazad na početnu
                </Link>
            ) : null}

            <div className="auth-float relative z-10 w-full max-w-[400px] sm:max-w-md">{children}</div>

            <p className="auth-reveal auth-reveal-delay-7 relative z-10 mt-8 text-center text-xs text-slate-500">
                &copy; {year} FakturaOne. Sva prava zadržana.
            </p>
        </section>
    );
}
