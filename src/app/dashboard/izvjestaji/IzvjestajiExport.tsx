"use client";

type Props = {
  period: string;
  od?: string;
  doo?: string;
};

export default function IzvjestajiExport({ period, od, doo }: Props) {
  const qs = new URLSearchParams({ period });
  if (od) qs.set("od", od);
  if (doo) qs.set("do", doo);

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`/api/izvjestaji/izvoz?${qs}&format=csv`}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#64748B] hover:text-fcrna"
      >
        Excel / CSV
      </a>
      <a
        href={`/api/izvjestaji/izvoz?${qs}&format=pdf`}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#64748B] hover:text-fcrna"
      >
        PDF izvještaj
      </a>
    </div>
  );
}
