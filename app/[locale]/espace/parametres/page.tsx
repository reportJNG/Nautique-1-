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
    <div className="rounded-2xl border border-blue-200/50 bg-white/80 backdrop-blur-sm shadow-xl dark:border-blue-800/50 dark:bg-blue-950/80">
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
    <div className="flex items-center gap-3 border-b border-blue-200/50 px-6 py-4 dark:border-blue-800/50">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-blue-900 dark:text-white">{title}</p>
        <p className="text-xs text-blue-500 dark:text-blue-400">{subtitle}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-950 px-4 py-8 sm:px-8">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 dark:text-blue-500">
          Espace membre
        </p>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-900 to-cyan-600 dark:from-white dark:to-cyan-400 bg-clip-text text-transparent">
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
                        ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "border-blue-200/50 bg-blue-50/30 text-blue-500 hover:border-blue-300 hover:bg-blue-100/50 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:border-blue-700 dark:hover:bg-blue-800/40"
                    )}
                  >
                    {active && (
                      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </span>
                    )}
                    <Icon className={cn("h-5 w-5", active ? "text-blue-500" : "text-blue-400")} />
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
            iconColor="text-cyan-500"
            iconBg="bg-cyan-100 dark:bg-cyan-900/40"
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
                        ? "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                        : "border-blue-200/50 bg-blue-50/30 text-blue-500 hover:border-cyan-300 hover:bg-cyan-50/50 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:border-cyan-700 dark:hover:bg-cyan-900/20"
                    )}
                  >
                    {active && (
                      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
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