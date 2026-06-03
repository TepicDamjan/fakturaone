import Link from 'next/link';

interface PricingCardProps {
    name: string;
    price: string;
    period?: string;
    features: string[];
    highlighted?: boolean;
    ctaLabel: string;
    ctaHref: string;
    ctaVariant?: 'primary' | 'outline';
}

function CheckIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 text-[#00E5FF]" aria-hidden>
            <path
                d="M7.5 12.5L3.5 8.5L4.56 7.44L7.5 10.38L13.44 4.44L14.5 5.5L7.5 12.5Z"
                fill="currentColor"
            />
        </svg>
    );
}

export default function PricingCard({
    name,
    price,
    period,
    features,
    highlighted = false,
    ctaLabel,
    ctaHref,
    ctaVariant = 'primary',
}: PricingCardProps) {
    return (
        <div
            className={`landing-card-hover relative flex flex-col rounded-2xl border p-6 sm:p-8 ${
                highlighted
                    ? 'border-[#00E5FF] bg-white/[0.04] shadow-[0_0_40px_rgba(0,229,255,0.15)] hover:shadow-[0_0_52px_rgba(0,229,255,0.22)]'
                    : 'border-white/10 bg-white/[0.02]'
            }`}
        >
            {highlighted ? (
                <span className="absolute -top-3 right-4 rounded-full bg-[#00E5FF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#05070A]">
                    Najpopularnije
                </span>
            ) : null}

            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white sm:text-4xl">{price}</span>
                {period ? <span className="text-slate-400">{period}</span> : null}
            </div>

            <ul className="mt-6 flex flex-1 flex-col gap-3">
                {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-300 sm:text-base">
                        <CheckIcon />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <Link
                href={ctaHref}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-lg px-6 py-3 text-center text-sm font-semibold transition-all duration-300 sm:text-base ${
                    ctaVariant === 'primary'
                        ? 'bg-[#00E5FF] text-[#05070A] hover:scale-[1.02] hover:bg-[#33ebff] hover:shadow-[0_0_24px_rgba(0,229,255,0.35)]'
                        : 'border border-slate-600 text-white hover:scale-[1.02] hover:border-[#00E5FF]/50 hover:bg-white/5'
                }`}
            >
                {ctaLabel}
            </Link>
        </div>
    );
}
