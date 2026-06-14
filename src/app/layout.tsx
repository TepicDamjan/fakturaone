import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Footer from "@/app/components/Footer";
import SajtUIzradiBaner from "@/app/components/SajtUIzradiBaner";
import { DEFAULT_DESCRIPTION, getSiteUrl, SITE_NAME } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} — online fakturisanje za mala preduzeća`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "fakturisanje",
    "online fakture",
    "fakture Srbija",
    "program za fakture",
    "fakturaone",
  ],
  openGraph: {
    type: "website",
    locale: "sr_RS",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — moderno online fakturisanje`,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — moderno online fakturisanje`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} bg-[#F8FAFC] antialiased pt-10`}
      >
        <SajtUIzradiBaner />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
