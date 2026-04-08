"use client";

import Link from "next/link";
import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  Dumbbell,
  UserCheck,
  UserCog,
  CreditCard,
  LogIn,
  Settings,
  LogOut,
  Waves,
  X,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth.actions";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  agent: { nom: string; prenom: string; roleCode: string };
  collapsed?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
  isMobileOpen?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

export function AdminSidebar({
  agent,
  collapsed = false,
  onNavigate,
  onClose,
  setCollapsed,
}: AdminSidebarProps) {
  const t = useTranslations("admin");
  const tNav = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();

  const pathWithoutLocale = pathname.startsWith(`/${locale}`)
    ? pathname.slice(locale.length + 1)
    : pathname;
  const normalizedPath = pathWithoutLocale.replace(/\/+$/, "") || "/";

  const navSections: NavSection[] = [
    {
      label: t("nav.section.overview"),
      items: [
        { href: "/admin", label: t("dashboard"), icon: LayoutDashboard, roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM", "AG-FIN"] },
      ],
    },
    {
      label: t("nav.section.management"),
      items: [
        { href: "/admin/adherents", label: t("adherents"), icon: Users, roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM"] },
        { href: "/admin/abonnements", label: t("abonnements"), icon: Calendar, roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM", "AG-FIN"] },
        { href: "/admin/saisons", label: t("saisons"), icon: Clock, roles: ["ADMIN", "DIR", "RESP-COM"] },
        { href: "/admin/creneaux", label: t("creneaux"), icon: Clock, roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM"] },
        { href: "/admin/disciplines", label: t("disciplines"), icon: Dumbbell, roles: ["ADMIN", "DIR", "RESP-COM"] },
      ],
    },
    {
      label: t("nav.section.team"),
      items: [
        { href: "/admin/moniteurs", label: t("moniteurs"), icon: UserCheck, roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM"] },
        { href: "/admin/agents", label: t("agents"), icon: UserCog, roles: ["ADMIN", "DIR"] },
      ],
    },
    {
      label: t("nav.section.finance"),
      items: [
        { href: "/admin/factures", label: t("factures"), icon: CreditCard, roles: ["ADMIN", "DIR", "AG-FIN"] },
        { href: "/admin/acces", label: t("access"), icon: LogIn, roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM", "AG-FIN"] },
      ],
    },
    {
      label: t("nav.section.config"),
      items: [
        { href: "/admin/parametres", label: t("settings"), icon: Settings, roles: ["ADMIN"] },
      ],
    },
  ];

  async function handleLogout() {
    await logoutAction();
    window.location.href = `/${locale}`;
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full w-full overflow-hidden",
        "bg-card",
        "border-r border-border/30",
      )}
    >
      {/* Top shimmer */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none" />

      {/* ── Header / Logo ────────────────────────────────── */}
      <div className={cn(
        "flex items-center border-b border-border/20 flex-shrink-0 h-[54px]",
        collapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        {/* Logo mark — always visible */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
            <Waves className="w-[17px] h-[17px] text-primary-foreground" />
          </div>

          {/* Wordmark */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-out",
              collapsed ? "w-0 opacity-0" : "w-44 opacity-100"
            )}
          >
            <p className="text-[13px] font-bold text-foreground tracking-tight whitespace-nowrap leading-none">
              {t("sidebar.title")}
            </p>
            <p className="text-[9.5px] font-bold text-primary uppercase tracking-[0.18em] mt-0.5 whitespace-nowrap">
              {t("sidebar.subtitle")}
            </p>
          </div>

          {/* Collapse/Expand button */}
          <button
            className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg
                 text-muted-foreground hover:text-destructive
                 hover:bg-destructive/10 active:bg-destructive/20
                 border border-transparent hover:border-destructive/20
                 transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1
                 active:scale-95 cursor-pointer"
            onClick={() => setCollapsed?.(!collapsed)}
            aria-label={collapsed ? t("shell.expandDesktopSr") : t("shell.collapseDesktopSr")}
          >
            <X className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>

        {/* Mobile close */}
        {onClose && !collapsed && (
          <button
            onClick={onClose}
            aria-label={t("shell.closeOverlaySr")}
            className="group flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg
                 text-muted-foreground hover:text-destructive
                 hover:bg-destructive/10 active:bg-destructive/20
                 border border-transparent hover:border-destructive/20
                 transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1
                 active:scale-95
                 md:hidden"
          >
            <X className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        )}
      </div>



      {/* ── Navigation ────────────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        aria-label={t("navigation")}
      >
        {navSections.map((section, si) => {
          const allowed = section.items.filter((item) =>
            item.roles.includes(agent.roleCode)
          );
          if (allowed.length === 0) return null;

          return (
            <div key={si} className={si > 0 ? "mt-1" : ""}>
              {/* Section label */}
              <div
                className={cn(
                  "px-4 py-1",
                  "text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50",
                  "transition-all duration-300 overflow-hidden whitespace-nowrap",
                  collapsed ? "h-0 opacity-0 pointer-events-none py-0" : "h-auto opacity-100",
                  si > 0 && "pt-3"
                )}
              >
                {section.label}
              </div>

              <ul className="list-none m-0 px-2 space-y-0.5">
                {allowed.map((item) => {
                  const Icon = item.icon;
                  const isDash = item.href === "/admin";
                  const isActive =
                    normalizedPath === item.href ||
                    (!isDash && normalizedPath.startsWith(`${item.href}/`));

                  return (
                    <li key={item.href} className="relative">
                      <Link
                        href={`/${locale}${item.href}`}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => onNavigate?.()}
                        className={cn(
                          "group relative flex items-center gap-2.5",
                          "px-3 py-[9px] rounded-xl text-[12.5px] font-medium",
                          "transition-all duration-150 whitespace-nowrap",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                          isActive
                            ? "bg-gradient-to-r from-primary/12 to-primary/5 text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                          collapsed && "justify-center px-0 w-10 mx-auto"
                        )}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <span className="absolute left-0 top-[20%] h-[60%] w-[3px] rounded-r-full bg-gradient-to-b from-primary to-primary/80 shadow-[0_0_8px_rgba(6,182,212,0.7)]" />
                        )}

                        <Icon
                          className={cn(
                            "w-4 h-4 flex-shrink-0 transition-colors duration-150",
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )}
                          aria-hidden="true"
                        />

                        <span
                          className={cn(
                            "flex-1 truncate transition-all duration-300",
                            collapsed && "opacity-0 w-0 pointer-events-none"
                          )}
                        >
                          {item.label}
                        </span>

                        {isActive && !collapsed && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                        )}

                        {/* Collapsed tooltip */}
                        {collapsed && (
                          <span
                            className={cn(
                              "absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none",
                              "bg-card/95 backdrop-blur-sm border border-border/30",
                              "text-foreground px-2.5 py-1.5 rounded-lg text-[11.5px] whitespace-nowrap",
                              "shadow-[0_8px_24px_rgba(0,0,0,0.6)]",
                              "opacity-0 group-hover:opacity-100",
                              "transition-opacity duration-150",
                              "translate-x-1 group-hover:translate-x-0"
                            )}
                          >
                            {item.label}
                            <span className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[6px] border-r-card/95" />
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* ── Logout ────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-border/20 p-2">
        <form action={handleLogout}>
          <button
            type="submit"
            className={cn(
              "group relative flex items-center gap-2.5 w-full cursor-pointer",
              "px-3 py-2.5 rounded-xl text-[12.5px] font-medium",
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              "border border-transparent hover:border-destructive/20",
              "transition-all duration-150 whitespace-nowrap",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40",
              "active:scale-[0.98]",
              collapsed && "justify-center px-0 w-10 mx-auto"
            )}
          >
            <LogOut
              className="w-4 h-4 flex-shrink-0 text-muted-foreground group-hover:text-destructive transition-colors"
              aria-hidden="true"
            />
            <span
              className={cn(
                "flex-1 text-left truncate transition-all duration-300",
                collapsed && "opacity-0 w-0 pointer-events-none"
              )}
            >
              {tNav("logout")}
            </span>

            {collapsed && (
              <span
                className={cn(
                  "absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none",
                  "bg-card/95 backdrop-blur-sm border border-border/30",
                  "text-foreground px-2.5 py-1.5 rounded-lg text-[11.5px] whitespace-nowrap",
                  "shadow-[0_8px_24px_rgba(0,0,0,0.6)]",
                  "opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-150"
                )}
              >
                {tNav("logout")}
              </span>
            )}
          </button>
        </form>
      </div>
    </aside>
  );
}
