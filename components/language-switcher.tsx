"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { locales, Locale } from "@/i18n/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const localeLabels: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  ar: "AR",
};

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentLocale = params.locale as Locale;

  const handleLocaleChange = (locale: Locale) => {
    router.replace(pathname, { locale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="text-sm font-mono font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
          {currentLocale.toUpperCase()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[80px] p-0.5">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={`
              justify-center px-3 py-1.5 text-sm font-mono
              ${currentLocale === locale 
                ? "bg-muted text-foreground" 
                : "text-muted-foreground"
              }
            `}
          >
            {localeLabels[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}