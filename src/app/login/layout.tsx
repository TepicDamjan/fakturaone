import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Prijava",
  robots: NOINDEX_ROBOTS,
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
