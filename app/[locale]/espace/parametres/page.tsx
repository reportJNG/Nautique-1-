"use client";

import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Sun, Moon, Laptop, Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "light", label: "Clair", icon: Sun },
  { id: "dark", label: "Sombre", icon: Moon },
  { id: "system", label: "Système", icon: Laptop },
];

const LANGUAGES = [
  { id: "fr", label: "Français", flag: "🇫🇷" },
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "ar", label: "العربية", flag: "🇩🇿" },
];

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {children}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  iconColor,
  iconBg,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-800">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

export default function ParametresPage() {
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="min-h-screen bg-gray-50/60 px-4 py-8 dark:bg-gray-950 sm:px-8">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Espace membre
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Paramètres
        </h1>
      </div>

      <div className="grid max-w-xl gap-5">
        {/* ── Theme ── */}
        <SectionCard>
          <SectionHeader
            icon={Sun}
            title="Apparence"
            subtitle="Choisissez le thème de l'interface"
            iconColor="text-amber-500"
            iconBg="bg-amber-100 dark:bg-amber-900/40"
          />
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map(({ id, label, icon: Icon }) => {
                const active = theme === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTheme(id)}
                    className={cn(
                      "relative flex flex-col items-center gap-2.5 rounded-xl border px-3 py-4 text-sm font-medium transition-all duration-150",
                      active
                        ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                        : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                    )}
                  >
                    {active && (
                      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </span>
                    )}
                    <Icon className={cn("h-5 w-5", active ? "text-violet-500" : "text-gray-400")} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </SectionCard>

        {/* ── Language ── */}
        <SectionCard>
          <SectionHeader
            icon={Globe}
            title="Langue"
            subtitle="Langue d'affichage de l'interface"
            iconColor="text-sky-500"
            iconBg="bg-sky-100 dark:bg-sky-900/40"
          />
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3">
              {LANGUAGES.map(({ id, label, flag }) => {
                const active = locale === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleLanguageChange(id)}
                    className={cn(
                      "relative flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-medium transition-all duration-150",
                      active
                        ? "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                        : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                    )}
                  >
                    {active && (
                      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </span>
                    )}
                    <span className="text-xl leading-none">{flag}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}