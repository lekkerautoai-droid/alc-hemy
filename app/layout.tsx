import type { Metadata } from "next";
import { Nunito, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
});

const SITTER_NAME = process.env.NEXT_PUBLIC_SITTER_NAME || "Anabel";
const AREA = process.env.NEXT_PUBLIC_SERVICE_AREA || "Cape Town";

export const metadata: Metadata = {
  title: "Bells & Paws · Pet sitting & dog walks in " + AREA,
  description: `Friendly, reliable dog walking and pet sitting with ${SITTER_NAME} — book a slot in seconds.`,
  openGraph: {
    title: "Bells & Paws",
    description: `Friendly pet sitting & dog walks with ${SITTER_NAME} in ${AREA}.`,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${fraunces.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
