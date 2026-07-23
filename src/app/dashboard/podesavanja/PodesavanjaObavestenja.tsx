"use client";

import { useState, useTransition } from "react";
import { sacuvajObavestenjaFirme } from "@/app/dashboard/podesavanja/actions";
import { useToast } from "@/app/components/toast/ToastContext";
import type { FirmaRow } from "@/lib/firma";

type Props = {
  initialFirma: FirmaRow | null;
  emailDostupan: boolean;
};

export default function PodesavanjaObavestenja({
  initialFirma,
  emailDostupan,
}: Props) {
  const { prikaziToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [ukljuceni, setUkljuceni] = useState(
    initialFirma?.podsjetnici_ukljuceni ?? true
  );
  const [danaPrije, setDanaPrije] = useState(
    initialFirma?.podsjetnik_dana_prije ?? 3
  );

  const handleSave = () => {
    startTransition(async () => {
      const rez = await sacuvajObavestenjaFirme({
        podsjetniciUkljuceni: ukljuceni,
        podsjetnikDanaPrije: danaPrije,
      });
      if (!rez.ok) {
        prikaziToast({ tip: "greska", poruka: rez.error });
        return;
      }
      prikaziToast({ tip: "uspeh", poruka: "Podešavanja obavještenja su sačuvana." });
    });
  };

  if (!initialFirma) {
    return (
      <p className="text-sm text-[#64748B]">
        Prvo sačuvajte podatke firme da biste podesili obavještenja.
      </p>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-fcrna">Podsjetnici za plaćanje</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Automatski email klijentima prije dospijeća i za dospjele fakture.
          {!emailDostupan
            ? " Dostupno na Professional planu i višim."
            : " Za dospjele fakture šalje se najviše jednom sedmično."}
        </p>
      </div>

      {!emailDostupan ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Slanje emailova nije uključeno na vašem trenutnom planu. Nadogradite
          plan da bi podsjetnici radili.
        </div>
      ) : null}

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={ukljuceni}
          onChange={(e) => setUkljuceni(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-ftsiva text-fplava focus:ring-fplava"
        />
        <span>
          <span className="block text-sm font-semibold text-fcrna">
            Uključi automatske podsjetnike
          </span>
          <span className="block text-sm text-[#64748B] mt-0.5">
            Klijenti sa email adresom dobijaju podsjetnik za neplaćene fakture.
          </span>
        </span>
      </label>

      <label className="block text-sm font-medium text-fcrna">
        Dani prije dospijeća
        <input
          type="number"
          min={0}
          max={30}
          value={danaPrije}
          disabled={!ukljuceni}
          onChange={(e) => setDanaPrije(Number(e.target.value) || 0)}
          className="mt-1.5 w-full max-w-[120px] rounded-lg border border-ftsiva px-3 py-2.5 text-fcrna disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-fplava/30"
        />
        <span className="mt-1 block text-xs font-normal text-[#64748B]">
          0 = samo podsjetnici za već dospjele fakture. Preporučeno: 3.
        </span>
      </label>

      <button
        type="button"
        disabled={isPending}
        onClick={handleSave}
        className="rounded-lg bg-fplava px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
      >
        {isPending ? "Čuvanje…" : "Sačuvaj"}
      </button>
    </div>
  );
}
