export default function SajtUIzradiBaner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 border-b border-[#00E5FF]/20 bg-[#0F172A] px-4 py-2.5 text-center text-sm text-slate-300"
    >
      <span
        className="inline-flex h-2 w-2 shrink-0 rounded-full bg-[#00E5FF] animate-pulse"
        aria-hidden
      />
      <p>
        <span className="font-semibold text-white">Sajt je još u izradi</span>
        <span className="hidden sm:inline">
          {" "}
          — neke funkcije možda nisu dostupne. Hvala na strpljenju!
        </span>
        <span className="sm:hidden"> — uskoro više funkcija.</span>
      </p>
    </div>
  );
}
