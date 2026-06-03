import React from 'react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    className?: string;
}

export default function FeatureCard({ title, description, icon, className = '' }: FeatureCardProps) {
    return (
        <div
            className={`landing-card-hover flex max-w-[280px] flex-col items-start gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 ${className}`}
        >
            <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 text-[#00E5FF]">
                {icon || (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path
                            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </div>

            <div className="flex flex-col items-start gap-2 text-left">
                <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-400 sm:text-base">{description}</p>
            </div>
        </div>
    );
}
