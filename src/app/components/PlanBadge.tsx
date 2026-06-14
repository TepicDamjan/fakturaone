import type { PretplataPregled } from "@/lib/pretplata.types";

type Props = {
  pretplata: PretplataPregled;
};

const BADGE_STYLES: Record<
  PretplataPregled["tier"],
  { className: string; label: string }
> = {
  starter: {
    className: "text-[#64748B]",
    label: "Starter",
  },
  professional: {
    className: "text-[#137FEC]",
    label: "Professional",
  },
  business: {
    className: "text-violet-600",
    label: "Business",
  },
  enterprise: {
    className: "text-[#0F172A]",
    label: "Enterprise",
  },
};

export default function PlanBadge({ pretplata }: Props) {
  const style = BADGE_STYLES[pretplata.tier];

  if (pretplata.isTrial) {
    return (
      <span className="text-[#137FEC] text-xs font-semibold">
        Probni period · {pretplata.tierLabel}
      </span>
    );
  }

  return (
    <span className={`text-xs font-semibold ${style.className}`}>{style.label}</span>
  );
}
