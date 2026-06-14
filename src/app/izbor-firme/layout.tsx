import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Izbor firme",
  robots: NOINDEX_ROBOTS,
};

export default function IzborFirmeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
