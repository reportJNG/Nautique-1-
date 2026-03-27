import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Centre Nautique SONATRACH",
  description: "Système de gestion des adhésions et abonnements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
