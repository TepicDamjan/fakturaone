"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { dodeliPlan, ukiniPlan } from "@/app/admin/actions";
import { PLAN_DEFS, PLANS_ORDER, type PlanTier } from "@/lib/plans";

const TRAJANJA = [
  { meseci: 1, label: "1 mesec" },
  { meseci: 3, label: "3 meseca" },
  { meseci: 6, label: "6 meseci" },
  { meseci: 12, label: "12 meseci" },
];

const PLANOVI_ZA_DODELU = PLANS_ORDER.filter((tier) => tier !== "starter");

type Props = {
  userId: string;
  /** Da li korisnik trenutno ima aktivan plaćeni/dodeljen plan */
  imaPlan: boolean;
};

export default function PlanAkcije({ userId, imaPlan }: Props) {
  const router = useRouter();
  const [otvoreno, setOtvoreno] = useState(false);
  const [plan, setPlan] = useState<PlanTier>("professional");
  const [meseci, setMeseci] = useState(1);
  const [greska, setGreska] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function potvrdiDodelu() {
    setGreska(null);
    startTransition(async () => {
      const res = await dodeliPlan(userId, plan, meseci);
      if (!res.ok) {
        setGreska(res.error);
        return;
      }
      setOtvoreno(false);
      router.refresh();
    });
  }

  function potvrdiUkidanje() {
    if (!window.confirm("Ukinuti plan ovom korisniku? Vraća se na Starter.")) {
      return;
    }
    setGreska(null);
    startTransition(async () => {
      const res = await ukiniPlan(userId);
      if (!res.ok) {
        setGreska(res.error);
        return;
      }
      router.refresh();
    });
  }

  if (!otvoreno) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setGreska(null);
              setOtvoreno(true);
            }}
            className="rounded-lg bg-fplava px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Dodeli plan
          </button>
          {imaPlan ? (
            <button
              type="button"
              onClick={potvrdiUkidanje}
              disabled={pending}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              Ukini
            </button>
          ) : null}
        </div>
        {greska ? <p className="text-xs text-red-600">{greska}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as PlanTier)}
          disabled={pending}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-fcrna focus:border-fplava focus:outline-none"
        >
          {PLANOVI_ZA_DODELU.map((tier) => (
            <option key={tier} value={tier}>
              {PLAN_DEFS[tier].naziv}
            </option>
          ))}
        </select>

        <select
          value={meseci}
          onChange={(e) => setMeseci(Number(e.target.value))}
          disabled={pending}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-fcrna focus:border-fplava focus:outline-none"
        >
          {TRAJANJA.map((t) => (
            <option key={t.meseci} value={t.meseci}>
              {t.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={potvrdiDodelu}
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {pending ? "Čuvam..." : "Potvrdi"}
        </button>

        <button
          type="button"
          onClick={() => setOtvoreno(false)}
          disabled={pending}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:text-fcrna transition-colors disabled:opacity-50"
        >
          Otkaži
        </button>
      </div>
      {greska ? <p className="text-xs text-red-600">{greska}</p> : null}
    </div>
  );
}
