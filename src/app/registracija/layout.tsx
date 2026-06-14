import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Registracija",
  robots: NOINDEX_ROBOTS,
};

export default function RegistracijaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
