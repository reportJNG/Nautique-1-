import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "../globals.css";

export const metadata: Metadata = {
  title: "Centre Nautique SONATRACH",
  description: "Systeme de gestion des adhesions et abonnements",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const isRTL = locale === "ar";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
            <Toaster richColors position="top-right" />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
