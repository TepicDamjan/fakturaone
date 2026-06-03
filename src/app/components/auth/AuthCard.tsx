import AuthMobileHeader from './AuthMobileHeader';
import type { ReactNode } from 'react';

interface AuthCardProps {
    mobileSubtitle: string;
    title: string;
    subtitle: string;
    children: ReactNode;
}

export default function AuthCard({ mobileSubtitle, title, subtitle, children }: AuthCardProps) {
    return (
        <div className="auth-card-glow auth-reveal relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f18]/95 p-6 backdrop-blur-sm sm:p-8">
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent md:hidden"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/25 to-transparent md:hidden"
                aria-hidden
            />

            <div className="auth-reveal auth-reveal-delay-1">
                <AuthMobileHeader subtitle={mobileSubtitle} />
            </div>

            <div className="auth-reveal auth-reveal-delay-2 hidden md:block">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">{subtitle}</p>
            </div>

            <div className="md:mt-8">{children}</div>
        </div>
    );
}
