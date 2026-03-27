// components/landing/LanguageSwitcher.tsx
"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");

  const locales = [
    { code: "fr", label: t("fr") },
    { code: "en", label: t("en") },
    { code: "ar", label: t("ar") },
  ];

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className="h-9 appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-sm dark:border-gray-700 dark:bg-gray-900 cursor-pointer"
      >
        {locales.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.label}
          </option>
        ))}
      </select>
      <Globe className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
    </div>
  );
}
