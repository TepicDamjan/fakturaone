"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IZVJESTAJ_PERIODI,
  type IzvjestajPeriod,
} from "@/lib/izvjestaji";

type Props = {
  aktivni: IzvjestajPeriod;
  periodLabel: string;
  od?: string;
  doo?: string;
};

export default function IzvjestajiFilter({
  aktivni,
  periodLabel,
  od = "",
  doo = "",
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#64748B]">
          Period:{" "}
          <span className="font-semibold text-fcrna">{periodLabel}</span>
          <span className="mx-2 text-ftsiva">·</span>
          Samo finansijski dokumenti
        </p>
        <div className="flex flex-wrap gap-2">
          {IZVJESTAJ_PERIODI.map((p) => {
            const active = p.id === aktivni;
            return (
              <Link
                key={p.id}
                href={
                  p.id === "prilagodjen"
                    ? `${pathname}?period=prilagodjen${od ? `&od=${od}` : ""}${doo ? `&do=${doo}` : ""}`
                    : `${pathname}?period=${p.id}`
                }
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#137FEC] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-[#64748B] hover:text-fcrna hover:border-gray-300"
                }`}
              >
                {p.label}
              </Link>
            );
          })}
        </div>
      </div>
      {aktivni === "prilagodjen" ? (
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const s = String(fd.get("od") ?? "");
            const e2 = String(fd.get("do") ?? "");
            router.push(`${pathname}?period=prilagodjen&od=${s}&do=${e2}`);
          }}
        >
          <label className="text-sm text-[#64748B]">
            Od
            <input
              name="od"
              type="date"
              defaultValue={od}
              className="mt-1 block rounded-lg border border-gray-200 px-3 py-2 text-sm text-fcrna"
            />
          </label>
          <label className="text-sm text-[#64748B]">
            Do
            <input
              name="do"
              type="date"
              defaultValue={doo}
              className="mt-1 block rounded-lg border border-gray-200 px-3 py-2 text-sm text-fcrna"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-[#137FEC] px-4 py-2 text-sm font-medium text-white"
          >
            Primijeni
          </button>
        </form>
      ) : null}
    </div>
  );
}
