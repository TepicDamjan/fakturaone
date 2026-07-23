"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/toast/ToastContext";

type Props = {
  label?: string;
  onImport: (
    csvText: string
  ) => Promise<
    | { ok: true; uvezeno: number; preskoceno: number; greske: string[] }
    | { ok: false; error: string }
  >;
  hint: string;
};

export default function CsvUvozDugme({ label = "Uvoz CSV", onImport, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { prikaziToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      startTransition(async () => {
        const rez = await onImport(text);
        setOpen(false);
        if (!rez.ok) {
          prikaziToast({ tip: "greska", poruka: rez.error });
          return;
        }
        const greskaTxt =
          rez.greske.length > 0 ? ` Greške: ${rez.greske.slice(0, 2).join("; ")}` : "";
        prikaziToast({
          tip: "uspeh",
          poruka: `Uvezeno ${rez.uvezeno}, preskočeno ${rez.preskoceno}.${greskaTxt}`,
        });
        router.refresh();
      });
    };
    reader.readAsText(file, "UTF-8");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-ftsiva bg-white px-3 py-2 text-sm font-medium text-fcrna hover:bg-fsiva"
      >
        {label}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[10060] flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-fcrna">Uvoz iz CSV</h2>
            <p className="mt-2 text-sm text-[#64748B]">{hint}</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="mt-4 block w-full text-sm"
              disabled={isPending}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-ftsiva px-4 py-2 text-sm"
              >
                Otkaži
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
