"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import {
  Bell,
  ChevronDown,
  Globe2,
  LogOut,
  MenuIcon,
  ShieldCheck,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth.actions";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { Link } from "@/i18n/navigation";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  variant: "info" | "success" | "warning" | "neutral" | "danger";
}

interface Props {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  adherent: {
    nom: string;
    prenom: string;
    numeroDossier: string;
    email?: string | null;
  };
  centre?: {
    designationCentre?: string;
    telephoneCentre?: string | null;
    emailCentre?: string | null;
  } | null;
  stats: {
    totalAbonnements: number;
    activeAbonnements: number;
    pendingFactures: number;
    lastAccessAt: string;
    nextSessionLabel: string;
  };
  notifications: NotificationItem[];
}

const titleKeys: Record<string, string> = {
  "/espace": "dashboard",
  "/espace/news": "news",
  "/espace/planning": "planning",
  "/espace/abonnements": "subscriptions",
  "/espace/factures": "invoices",
  "/espace/abonnements/nouveau": "newSubscription",
  "/espace/acces": "access",
  "/espace/profil": "profile",
  "/espace/parametres": "settings",
  "/espace/support": "support",
};

const variantClasses: Record<NotificationItem["variant"], string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100",
  neutral:
    "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100",
  danger:
    "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100",
};

export function EspaceTopbar({
  onMenuClick,
  sidebarOpen,
  adherent,
  centre,
  notifications,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("espace.client.topbar");
  const tLanguage = useTranslations("language");
  const [isLoggingOut, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [sessionStartedAt] = useState(() => Date.now());
  const [localNotifications, setLocalNotifications] = useState(
    notifications.map((item) => ({ ...item, read: false })),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const currentHeading = useMemo(() => {
    const match = Object.keys(titleKeys)
      .sort((a, b) => b.length - a.length)
      .find((key) => pathname === key || pathname.startsWith(`${key}/`));
    const pageKey = titleKeys[match ?? "/espace"];

    return {
      title: t(`pages.${pageKey}.title`),
      subtitle: t(`pages.${pageKey}.subtitle`),
    };
  }, [pathname, t]);

  const unreadCount = localNotifications.filter((item) => !item.read).length;
  const initials =
    `${adherent.prenom.charAt(0)}${adherent.nom.charAt(0)}`.toUpperCase();
  const clockTime = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now),
    [locale, now],
  );
  const clockDate = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(now),
    [locale, now],
  );
  const timezoneLabel = useMemo(() => {
    const offsetMinutes = -now.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(
      2,
      "0",
    );
    const minutes = String(Math.abs(offsetMinutes) % 60).padStart(2, "0");
    return `UTC${sign}${hours}:${minutes}`;
  }, [now]);
  const sessionDuration = useMemo(() => {
    const elapsedSeconds = Math.max(
      0,
      Math.floor((now.getTime() - sessionStartedAt) / 1000),
    );
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  }, [now, sessionStartedAt]);
  const localeOptions = [
    { id: "fr", label: tLanguage("fr") },
    { id: "en", label: tLanguage("en") },
    { id: "ar", label: tLanguage("ar") },
  ];
  const navButtonClass =
    "relative inline-flex size-[34px] items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground shadow-sm transition-all duration-150 ease-out hover:bg-muted hover:text-foreground active:scale-95";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-2xl">
      <div className="relative mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {!sidebarOpen && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label={t("openMenuAria")}
              title={t("openMenuTitle")}
              aria-expanded={false}
              aria-controls="espace-sidebar"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-foreground transition-all duration-150 ease-out hover:bg-muted active:scale-95 cursor-pointer"
            >
              <MenuIcon className="size-4" />
            </button>
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {currentHeading.title}
            </p>
            <p className="hidden truncate text-[11px] text-muted-foreground md:block">
              {currentHeading.subtitle}
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 flex-col items-center justify-center text-center xl:flex">
          <p className="font-mono text-[19px] font-medium tracking-[0.12em] text-foreground">
            {mounted ? clockTime : "\u00A0"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {mounted
              ? `${clockDate} | ${timezoneLabel} | ${t("session")} ${sessionDuration}`
              : "\u00A0"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label={t("languageAria")}
                title={t("languageTitle")}
                className="inline-flex h-[34px] min-w-[42px] items-center justify-center rounded-full border border-border/60 bg-background/80 px-3 text-[12px] font-medium uppercase tracking-[0.16em] text-foreground shadow-sm transition-all duration-150 ease-out hover:bg-muted active:scale-95"
              >
                {locale}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={10}
                className="z-50 min-w-[160px] rounded-[10px] border border-border/60 bg-popover p-1.5 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1"
              >
                {localeOptions.map((option) => (
                  <DropdownMenu.Item
                    key={option.id}
                    onClick={() =>
                      router.replace(pathname, { locale: option.id })
                    }
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm outline-none transition hover:bg-muted",
                      option.id === locale
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <span>{option.label}</span>
                    {option.id === locale ? (
                      <span className="text-[10px] font-medium text-foreground">
                        {t("activeLocale")}
                      </span>
                    ) : null}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <div title={t("themeTitle")}>
            <ThemeToggle />
          </div>

          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label={t("notificationsAria")}
                title={t("notificationsTitle")}
                className={navButtonClass}
              >
                <Bell className="size-4" />
                {unreadCount > 0 ? (
                  <span className="absolute right-1.5 top-1.5 flex size-2.5 rounded-full bg-rose-500" />
                ) : null}
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                align="end"
                sideOffset={10}
                className="z-50 w-[360px] rounded-[10px] border border-border/60 bg-popover p-3 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t("notificationsTitle")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("unreadCount", { count: unreadCount })}
                    </p>
                  </div>
                  {unreadCount > 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setLocalNotifications((items) =>
                          items.map((item) => ({ ...item, read: true })),
                        )
                      }
                      className="text-xs font-semibold text-primary transition hover:opacity-80"
                    >
                      {t("markAllRead")}
                    </button>
                  ) : null}
                </div>

                <div className="space-y-2">
                  {localNotifications.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                      {t("emptyNotifications")}
                    </div>
                  ) : (
                    localNotifications.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={cn(
                          "block rounded-2xl border p-3 transition hover:shadow-sm",
                          variantClasses[item.variant],
                          item.read ? "opacity-75" : "",
                        )}
                        onClick={() =>
                          setLocalNotifications((items) =>
                            items.map((entry) =>
                              entry.id === item.id
                                ? { ...entry, read: true }
                                : entry,
                            ),
                          )
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs opacity-80">
                              {item.description}
                            </p>
                          </div>
                          {!item.read ? (
                            <span className="mt-1 size-2 rounded-full bg-current" />
                          ) : null}
                        </div>
                        <p className="mt-2 text-[11px] opacity-70">
                          {item.time}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <div className="hidden h-6 w-px bg-border/80 md:block" />

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label={t("profileAria")}
                title={t("profileTitle")}
                className="flex items-center gap-3 rounded-full border border-border/60 bg-background/80 py-1 pl-1 pr-2 shadow-sm transition-all duration-150 ease-out hover:bg-muted active:scale-95"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </div>
                <div className="hidden text-left lg:block">
                  <p className="text-sm font-medium text-foreground">
                    {adherent.prenom} {adherent.nom}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {adherent.email ?? adherent.numeroDossier}
                  </p>
                </div>
                <ChevronDown className="hidden size-4 text-muted-foreground lg:block" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={10}
                className="z-50 min-w-[280px] rounded-[10px] border border-border/60 bg-popover p-2 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1"
              >
                <div className="rounded-3xl border border-border/50 bg-muted/40 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    {adherent.prenom} {adherent.nom}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("fileNumber", { value: adherent.numeroDossier })}
                  </p>
                  <p className="mt-2 text-xs text-primary">
                    {centre?.designationCentre ?? t("defaultCentre")}
                  </p>
                </div>

                <div className="py-2">
                  {[
                    {
                      label: t("profileMenu.myProfile"),
                      href: "/espace/profil",
                      icon: User,
                    },
                    {
                      label: t("profileMenu.settings"),
                      href: "/espace/parametres",
                      icon: Globe2,
                    },
                  ].map((item) => (
                    <DropdownMenu.Item
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm outline-none transition hover:bg-muted"
                    >
                      <item.icon className="size-4 text-muted-foreground" />
                      <span>{item.label}</span>
                    </DropdownMenu.Item>
                  ))}
                </div>

                <div className="flex items-center gap-2 border-t border-border/60 px-2 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => {
                        await logoutAction();
                        window.location.href = `/${locale}`;
                      })
                    }
                    disabled={isLoggingOut}
                    className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-95 disabled:opacity-60 dark:bg-rose-950/20 dark:text-rose-300 cursor-pointer"
                  >
                    <LogOut className="size-4" />
                    {isLoggingOut ? t("loggingOut") : t("logout")}
                  </button>
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      <div className="border-t border-border/50 bg-background/50 px-4 py-2 md:hidden">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {currentHeading.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {mounted ? `${clockDate} | ${clockTime}` : "\u00A0"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {t("session")}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {mounted ? sessionDuration : "\u00A0"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
