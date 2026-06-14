import Link from "next/link";
import type { PretplataPregled } from "@/lib/pretplata.types";
import { isUnlimited } from "@/lib/plans";

type Props = {
  pretplata: PretplataPregled;
};

function usagePercent(used: number, max: number): number {
  if (isUnlimited(max) || max === 0) return 0;
  return Math.min(100, Math.round((used / max) * 100));
}

export default function PlanUsageBanner({ pretplata }: Props) {
  const { limits, usage, isTrial, trialDaysLeft, tierLabel } = pretplata;
  const docMax = limits.dokumentiMesecno;
  const docUsed = usage.dokumentiMesecno;
  const docLimited = !isUnlimited(docMax);
  const docNearLimit = docLimited && docUsed >= docMax - 2;
  const docAtLimit = docLimited && docUsed >= docMax;

  const showTrial =
    isTrial && trialDaysLeft != null && trialDaysLeft <= 7;
  const showDocWarning = docNearLimit || docAtLimit;

  if (!showTrial && !showDocWarning && pretplata.tier !== "starter") {
    return null;
  }

  return (
    <div className="mx-6 sm:mx-8 mt-4 space-y-2">
      {showTrial ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-[#1E3A8A]">
            <span className="font-semibold">Probni period — {tierLabel}</span>
            {" · "}
            {trialDaysLeft === 0
              ? "Ističe danas"
              : `Još ${trialDaysLeft} ${trialDaysLeft === 1 ? "dan" : "dana"}`}
          </p>
          <Link
            href="/dashboard/nadogradi"
            className="text-sm font-semibold text-fplava hover:text-blue-700 shrink-0"
          >
            Izaberi plan →
          </Link>
        </div>
      ) : null}

      {showDocWarning ? (
        <div
          className={`rounded-xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
            docAtLimit
              ? "border-amber-300 bg-amber-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm text-fcrna">
              {docAtLimit ? (
                <>
                  <span className="font-semibold">Dostigli ste mesečni limit</span> —{" "}
                  {docUsed}/{docMax} dokumenata na {tierLabel} planu.
                </>
              ) : (
                <>
                  Iskoristili ste{" "}
                  <span className="font-semibold">
                    {docUsed}/{docMax}
                  </span>{" "}
                  dokumenata ovog meseca.
                </>
              )}
            </p>
            {docLimited ? (
              <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden max-w-xs">
                <div
                  className={`h-full rounded-full transition-all ${
                    docAtLimit ? "bg-amber-500" : "bg-fplava"
                  }`}
                  style={{ width: `${usagePercent(docUsed, docMax)}%` }}
                />
              </div>
            ) : null}
          </div>
          <Link
            href="/dashboard/nadogradi"
            className="text-sm font-semibold text-fplava hover:text-blue-700 shrink-0"
          >
            Nadogradi plan →
          </Link>
        </div>
      ) : null}

      {pretplata.tier === "starter" && !showDocWarning && !showTrial ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-[#64748B]">
            Koristite <span className="font-semibold text-fcrna">Starter</span> plan
            sa ograničenjima. Nadogradite za pun pristup.
          </p>
          <Link
            href="/dashboard/nadogradi"
            className="text-sm font-semibold text-fplava hover:text-blue-700 shrink-0"
          >
            Pogledaj planove →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
