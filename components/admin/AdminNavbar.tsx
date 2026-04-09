"use client";

import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth.actions";
import {
  AlertCircle,
  Bell,
  CalendarClock,
  CheckCheck,
  ChevronRight,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  User,
  Waves,
  X,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

interface AdminNavbarProps {
  agent: { nom: string; prenom: string; roleCode: string };
  sidebarCollapsed?: boolean;
  mobileMenuOpen?: boolean;
  onToggleSidebar?: () => void;
  onMobileMenuOpen?: () => void;
}

type SegmentLabelResolver = (
  t: ReturnType<typeof useTranslations>,
  tc: ReturnType<typeof useTranslations>,
) => string;

type DemoNotificationId = "subscription" | "invoice" | "season";

const SEGMENT_LABELS: Record<string, SegmentLabelResolver> = {
  admin: (t) => t("dashboard"),
  adherents: (t) => t("adherents"),
  abonnements: (t) => t("abonnements"),
  saisons: (t) => t("saisons"),
  creneaux: (t) => t("creneaux"),
  disciplines: (t) => t("disciplines"),
  moniteurs: (t) => t("moniteurs"),
  agents: (t) => t("agents"),
  factures: (t) => t("factures"),
  acces: (t) => t("access"),
  parametres: (t) => t("settings"),
  nouveau: (t) => t("navbar.segments.new"),
  modifier: (t) => t("navbar.segments.edit"),
  details: (t) => t("navbar.segments.details"),
  profile: (t) => t("navbar.segments.profile"),
  nouveauAbonnement: (_, tc) => tc("create"),
  modifierAbonnement: (_, tc) => tc("edit"),
};

const NOTIFICATION_META: Record<
  DemoNotificationId,
  { icon: typeof Sparkles; color: string }
> = {
  subscription: { icon: Sparkles, color: "text-primary" },
  invoice: { icon: AlertCircle, color: "text-accent" },
  season: { icon: CalendarClock, color: "text-primary" },
};

function formatFallbackLabel(segment: string) {
  if (!segment) return segment;
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function resolveSegmentLabel(
  segment: string,
  t: ReturnType<typeof useTranslations>,
  tc: ReturnType<typeof useTranslations>,
) {
  const resolver = SEGMENT_LABELS[segment];
  return resolver ? resolver(t, tc) : formatFallbackLabel(segment);
}

function PageLabel({ locale }: { locale: string }) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const pathWithoutLocale = pathname.startsWith(`/${locale}`)
    ? pathname.slice(locale.length + 1)
    : pathname;
  const segments = pathWithoutLocale
    .replace(/\/+$/, "")
    .split("/")
    .filter(Boolean);
  const currentSeg = segments[segments.length - 1] ?? "admin";
  const parentSeg = segments.length > 1 ? segments[segments.length - 2] : null;

  const current = resolveSegmentLabel(currentSeg, t, tc);
  const parent = parentSeg ? resolveSegmentLabel(parentSeg, t, tc) : null;

  return (
    <div className="flex min-w-0 select-none items-center gap-1.5">
      {parent ? (
        <>
          <span className="hidden truncate text-[11.5px] font-medium text-muted-foreground sm:block">
            {parent}
          </span>
          <ChevronRight className="hidden h-3 w-3 flex-shrink-0 text-muted-foreground/50 sm:block" />
        </>
      ) : null}
      <span className="truncate text-[13.5px] font-bold tracking-tight text-foreground">
        {current}
      </span>
    </div>
  );
}

function NavIconBtn({
  onClick,
  active,
  label,
  children,
  badge,
}: {
  onClick?: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-lg",
        "text-muted-foreground transition-all duration-150",
        "hover:bg-muted/50 hover:text-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "active:scale-95",
        active && "bg-primary/10 text-primary",
      )}
    >
      {children}
      {badge && badge > 0 ? (
        <span className="absolute right-[5px] top-[5px] flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-primary px-0.5 text-[8.5px] font-bold text-primary-foreground ring-[1.5px] ring-background">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}

function NavBell() {
  const t = useTranslations("admin.navbar");
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<
    Array<{ id: DemoNotificationId; unread: boolean }>
  >([
    { id: "subscription", unread: true },
    { id: "invoice", unread: true },
    { id: "season", unread: false },
  ]);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifs.filter((notif) => notif.unread).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <NavIconBtn
        onClick={() => setOpen((value) => !value)}
        active={open}
        label={t("notifications.label")}
        badge={unread}
      >
        <Bell className="h-[15px] w-[15px] cursor-pointer" />
      </NavIconBtn>

      {open ? (
        <div className="animate-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2.5 w-[320px] rounded-2xl border border-border/50 bg-card/98 shadow-[0_24px_60px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-xl duration-200 fade-in">
          <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-foreground">
                {t("notifications.title")}
              </span>
              {unread > 0 ? (
                <span className="flex h-[18px] items-center justify-center rounded-full border border-primary/20 bg-primary/15 px-1.5 text-[9.5px] font-bold text-primary">
                  {unread}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    setNotifs((previous) =>
                      previous.map((notif) => ({ ...notif, unread: false })),
                    )
                  }
                  className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-muted-foreground transition-all hover:bg-primary/8 hover:text-primary"
                >
                  <CheckCheck className="h-3 w-3" />
                  {t("notifications.markAllRead")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("notifications.close")}
                className="cursor-pointer rounded-lg p-1 text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <ul className="divide-y divide-border/20 py-1.5">
            {notifs.map((notif) => {
              const meta = NOTIFICATION_META[notif.id];
              const Icon = meta.icon;

              return (
                <li
                  key={notif.id}
                  className={cn(
                    "relative flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/30",
                    notif.unread && "bg-primary/10",
                  )}
                  onClick={() =>
                    setNotifs((previous) =>
                      previous.map((entry) =>
                        entry.id === notif.id
                          ? { ...entry, unread: false }
                          : entry,
                      ),
                    )
                  }
                >
                  {notif.unread ? (
                    <span className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                  ) : null}
                  <div
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-muted/50",
                      meta.color,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-semibold leading-snug text-foreground">
                      {t(`notifications.items.${notif.id}.title`)}
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">
                      {t(`notifications.items.${notif.id}.body`)}
                    </p>
                  </div>
                  <span className="mt-0.5 flex-shrink-0 text-[10.5px] text-muted-foreground/50">
                    {t(`notifications.items.${notif.id}.time`)}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-border/30 px-4 py-2.5">
            <button
              type="button"
              className="w-full cursor-pointer py-0.5 text-center text-[11.5px] text-muted-foreground transition-colors hover:text-primary"
            >
              {t("notifications.viewAll")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NavProfile({
  agent,
  locale,
}: {
  agent: AdminNavbarProps["agent"];
  locale: string;
}) {
  const t = useTranslations("admin");
  const tNav = useTranslations("nav");
  const tNavbar = useTranslations("admin.navbar");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials =
    `${agent.prenom?.[0] ?? ""}${agent.nom?.[0] ?? ""}`.toUpperCase() || "AG";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logoutAction();
    window.location.href = `/${locale}`;
  }

  const profileLinks = [
    {
      href: "/admin/parametres" as const,
      icon: User,
      label: tNavbar("profile.menu.profile"),
    },
    {
      href: "/admin/parametres" as const,
      icon: Settings,
      label: tNavbar("profile.menu.settings"),
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={tNavbar("profile.label")}
        className={cn(
          "flex h-8 items-center gap-2 rounded-lg pl-0.5 pr-2.5",
          "cursor-pointer transition-all duration-150",
          "hover:bg-muted/50",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          "active:scale-95",
          open && "bg-muted/50",
        )}
      >
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-[10px] font-bold text-primary-foreground shadow-[0_0_10px_rgba(6,182,212,0.35)]">
          {initials}
        </div>
        <div className="hidden flex-col items-start sm:flex">
          <span className="max-w-[80px] truncate text-[11.5px] font-semibold leading-none text-foreground">
            {agent.prenom}
          </span>
          <span className="mt-0.5 text-[9.5px] leading-none text-muted-foreground">
            {t(`roles.${agent.roleCode}`)}
          </span>
        </div>
      </button>

      {open ? (
        <div className="animate-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2.5 w-[240px] overflow-hidden rounded-2xl border border-border/50 bg-card/98 shadow-[0_24px_60px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-xl duration-200 fade-in">
          <div className="flex items-center gap-3 border-b border-border/30 bg-gradient-to-b from-muted/30 to-transparent px-4 py-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-[12px] font-bold text-primary-foreground shadow-[0_0_14px_rgba(6,182,212,0.3)]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-bold leading-snug text-foreground">
                {agent.prenom} {agent.nom}
              </p>
              <span className="mt-1 inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-primary">
                {t(`roles.${agent.roleCode}`)}
              </span>
            </div>
          </div>

          <ul className="space-y-0.5 p-1.5">
            {profileLinks.map(({ href, icon: Icon, label }) => (
              <li key={label}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-0.5 border-t border-border/30 p-1.5 pt-0">
            <form action={handleLogout}>
              <button
                type="submit"
                className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5 flex-shrink-0 transition-colors group-hover:text-destructive" />
                {tNav("logout")}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AdminNavbar({
  agent,
  sidebarCollapsed,
  mobileMenuOpen,
  onToggleSidebar,
  onMobileMenuOpen,
}: AdminNavbarProps) {
  const locale = useLocale();
  const tShell = useTranslations("admin.shell");

  return (
    <header className="relative z-10 flex h-[54px] flex-shrink-0 items-center gap-2 border-b border-border/50 bg-card/95 px-3 backdrop-blur-sm">
      <div className="flex flex-shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 pl-1 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            <Waves className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
        </div>

        {!mobileMenuOpen ? (
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground active:scale-95 lg:hidden"
            onClick={onMobileMenuOpen}
            aria-label={tShell("toggleMenu")}
          >
            <Menu className="h-4 w-4" />
          </button>
        ) : null}

        {sidebarCollapsed ? (
          <button
            type="button"
            className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground active:scale-95 lg:flex"
            onClick={onToggleSidebar}
            aria-label={tShell("expandDesktopSr")}
          >
            <Menu className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3 px-1">
        <PageLabel locale={locale} />
      </div>

      <div className="flex flex-shrink-0 items-center gap-1">
        <NavBell />
        <div className="mx-0.5 h-4 w-px bg-border/50" />
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <div className="mx-0.5 h-4 w-px bg-border/50" />
        <NavProfile agent={agent} locale={locale} />
      </div>
    </header>
  );
}
