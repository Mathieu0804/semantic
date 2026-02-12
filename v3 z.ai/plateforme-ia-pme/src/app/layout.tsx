import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plateforme IA PME - Creation de Sites Web par IA",
  description: "Plateforme web complete pour PME/PMI permettant de creer, gerer et analyser un site web integre avec les dernieres avancees d'automatisation IA. Souverainete des données garantie.",
  keywords: ["IA", "PME", "PMI", "creation site web", "SEO", "IA locale", "automatisation", "MCP", "catalogue produits"],
  authors: [{ name: "Plateforme IA PME" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Plateforme IA PME",
    description: "Creez votre site web avec l'IA - Solution complete pour PME/PMI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
