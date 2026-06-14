import Link from "next/link";
import Navbar from "@/app/components/Navbar";

type StaticPageShellProps = {
  title: string;
  children: React.ReactNode;
};

export default function StaticPageShell({ title, children }: StaticPageShellProps) {
  return (
    <div className="min-h-[calc(100dvh-2.5rem)] bg-[#05070A] text-white">
      <Navbar variant="dark" />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm text-slate-400 transition-colors hover:text-[#00E5FF]"
        >
          ← Nazad na početnu
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <div className="mt-8 space-y-4 text-base leading-relaxed text-slate-300">
          {children}
        </div>
      </main>
    </div>
  );
}
