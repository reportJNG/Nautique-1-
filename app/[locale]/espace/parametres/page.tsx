"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  Globe2,
  Laptop,
  Moon,
  Palette,
  Sun,
  WandSparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const themeOptions = [
  { id: "light", icon: Sun, accent: "from-amber-400 to-orange-500" },
  { id: "dark", icon: Moon, accent: "from-slate-700 to-slate-950" },
  { id: "system", icon: Laptop, accent: "from-cyan-500 to-sky-600" },
] as const;

const languageOptions = [{ id: "fr" }, { id: "en" }, { id: "ar" }] as const;

export default function ParametresPage() {
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const t = useTranslations("espace.client.settings");
  const tTheme = useTranslations("theme");
  const tLanguage = useTranslations("language");
  const pathname = usePathname();
  const router = useRouter();
  const [compactMode, setCompactMode] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setCompactMode(localStorage.getItem("espace-compact") === "1");
    setReduceMotion(localStorage.getItem("espace-reduce-motion") === "1");
  }, []);

  function togglePreference(
    key: "espace-compact" | "espace-reduce-motion",
    next: boolean,
  ) {
    localStorage.setItem(key, next ? "1" : "0");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border/50 bg-white/75 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50">
        <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-200">
          {t("badge")}
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-border/50 bg-white/80 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50"
        >
          <SectionHeading
            icon={Palette}
            title={t("sections.appearance.title")}
            subtitle={t("sections.appearance.subtitle")}
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {themeOptions.map((option) => {
              const active = theme === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={cn(
                    "rounded-[28px] border p-4 text-left transition-all",
                    active
                      ? "border-cyan-300 bg-cyan-50 shadow-sm dark:border-cyan-900/60 dark:bg-cyan-950/30"
                      : "border-border/50 bg-background/70 hover:border-cyan-200 hover:bg-cyan-50/40 dark:hover:border-cyan-900/60 dark:hover:bg-cyan-950/20",
                  )}
                >
                  <div
                    className={`inline-flex rounded-2xl bg-gradient-to-br ${option.accent} p-3 text-white shadow-lg`}
                  >
                    <option.icon className="size-4" />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {tTheme(option.id)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {option.id === "system"
                          ? t("sections.appearance.systemDescription")
                          : t("sections.appearance.instantDescription")}
                      </p>
                    </div>
                    {active ? (
                      <span className="inline-flex size-6 items-center justify-center rounded-full bg-cyan-600 text-white">
                        <Check className="size-3.5" />
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          <SectionHeading
            icon={Globe2}
            title={t("sections.language.title")}
            subtitle={t("sections.language.subtitle")}
            className="mt-8"
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {languageOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => router.replace(pathname, { locale: option.id })}
                className={cn(
                  "rounded-[28px] border p-4 text-left transition-all",
                  locale === option.id
                    ? "border-cyan-300 bg-cyan-50 shadow-sm dark:border-cyan-900/60 dark:bg-cyan-950/30"
                    : "border-border/50 bg-background/70 hover:border-cyan-200 hover:bg-cyan-50/40 dark:hover:border-cyan-900/60 dark:hover:bg-cyan-950/20",
                )}
              >
                <p className="text-sm font-semibold text-foreground">
                  {tLanguage(option.id)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {locale === option.id
                    ? t("sections.language.active")
                    : t("sections.language.switch")}
                </p>
              </button>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[32px] border border-border/50 bg-white/80 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50"
        >
          <SectionHeading
            icon={WandSparkles}
            title={t("sections.comfort.title")}
            subtitle={t("sections.comfort.subtitle")}
          />
          <div className="mt-6 space-y-4">
            <PreferenceRow
              title={t("preferences.compact.title")}
              description={t("preferences.compact.description")}
              enabled={compactMode}
              onToggle={(next) => {
                setCompactMode(next);
                togglePreference("espace-compact", next);
              }}
            />
            <PreferenceRow
              title={t("preferences.reduceMotion.title")}
              description={t("preferences.reduceMotion.description")}
              enabled={reduceMotion}
              onToggle={(next) => {
                setReduceMotion(next);
                togglePreference("espace-reduce-motion", next);
              }}
            />
          </div>

          <div className="mt-6 rounded-[28px] border border-border/50 bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("summary.title")}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-foreground">
              <li>{t("summary.theme", { value: tTheme(theme ?? "system") })}</li>
              <li>{t("summary.language", { value: tLanguage(locale) })}</li>
              <li>
                {t("summary.compactMode", {
                  value: compactMode ? t("states.active") : t("states.inactive"),
                })}
              </li>
              <li>
                {t("summary.reduceMotion", {
                  value: reduceMotion
                    ? t("states.active")
                    : t("states.inactive"),
                })}
              </li>
            </ul>
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-6 h-11 rounded-2xl"
            onClick={() => {
              setTheme("system");
              setCompactMode(false);
              setReduceMotion(false);
              togglePreference("espace-compact", false);
              togglePreference("espace-reduce-motion", false);
            }}
          >
            {t("reset")}
          </Button>
        </motion.section>
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
  className,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
        <Icon className="size-4" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function PreferenceRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[28px] border border-border/50 bg-background/70 p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onToggle(!enabled)}
        className={cn(
          "relative inline-flex h-8 w-14 rounded-full transition-colors",
          enabled ? "bg-cyan-600" : "bg-slate-300 dark:bg-slate-700",
        )}
      >
        <span
          className={cn(
            "absolute top-1 size-6 rounded-full bg-white shadow transition-transform",
            enabled ? "translate-x-7" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}
