import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Centre Nautique SONATRACH",
  description: "Systeme de gestion des adhesions et abonnements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
