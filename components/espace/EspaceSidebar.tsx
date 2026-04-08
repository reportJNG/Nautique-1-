"use client";

import Link from "next/link";
import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CreditCard,
  Headphones,
  Home,
  LogOut,
  ScanLine,
  Settings,
  User,
  Waves,
  Newspaper,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth.actions";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

interface Props {
  adherent: {
    nom: string;
    prenom: string;
    numeroDossier: string;
    organisation?: { designation: string } | null;
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
  context: {
    loyaltyPoints: number;
    loyaltyTier: string;
    feedbackCount: number;
    newsCount: number;
    centreStatus: string;
  };
  isOpen: boolean;
  desktop: boolean;
  onClose: () => void;
}

export function EspaceSidebar({
  adherent: _adherent,
  centre: _centre,
  stats: _stats,
  context: _context,
  isOpen,
  desktop: _desktop,
  onClose,
}: Props) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("espace.client.sidebar");
  const [isLoggingOut, startTransition] = useTransition();

  const navGroups: NavGroup[] = [
    {
      label: t("sections.overview"),
      items: [
        {
          href: "/espace",
          label: t("nav.home"),
          icon: Home,
          exact: true,
        },
        {
          href: "/espace/planning",
          label: t("nav.planning"),
          icon: CalendarDays,
        },
        {
          href: "/espace/news",
          label: t("nav.news"),
          icon: Newspaper,
        },
      ],
    },
    {
      label: t("sections.management"),
      items: [
        {
          href: "/espace/abonnements",
          label: t("nav.subscriptions"),
          icon: CalendarDays,
        },
        {
          href: "/espace/factures",
          label: t("nav.invoices"),
          icon: CreditCard,
        },
        {
          href: "/espace/acces",
          label: t("nav.access"),
          icon: ScanLine,
        },
      ],
    },
    {
      label: t("sections.account"),
      items: [
        {
          href: "/espace/profil",
          label: t("nav.profile"),
          icon: User,
        },
        {
          href: "/espace/parametres",
          label: t("nav.settings"),
          icon: Settings,
        },
        {
          href: "/espace/support",
          label: t("nav.support"),
          icon: Headphones,
        },
      ],
    },
  ];

  return (
    <motion.aside
      id="espace-sidebar"
      initial={false}
      animate={{
        x: isOpen ? 0 : -340,
        opacity: isOpen ? 1 : 0.98,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      aria-hidden={!isOpen}
      className={cn(
        "group fixed bottom-0 left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-[260px] border-r border-border bg-card text-card-foreground shadow-[2px_0_12px_hsl(var(--background)/0.45)] max-md:top-[5.75rem] max-md:h-[calc(100vh-5.75rem)] dark:bg-[hsl(var(--background))]",
        isOpen ? "pointer-events-auto" : "pointer-events-none shadow-none",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Waves className="size-4" />
            </div>
            <div>
              <p className="text-[13px] font-medium tracking-tight text-foreground">
                {t("title")}
              </p>
              <p className="text-[11px] text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeAria")}
            className="inline-flex size-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground active:scale-[0.96] cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="espace-sidebar-scroll flex-1 overflow-y-hidden px-3 py-4 hover:overflow-y-auto">
          <nav className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-4 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {group.label}
                </p>
                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                    return (
                      <motion.div
                        key={item.href}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.1, ease: "easeOut" }}
                      >
                        <Link
                          href={`/${locale}${item.href}`}
                          className={cn(
                            "group relative flex items-center gap-3 overflow-hidden rounded-[10px] px-4 py-3 font-sans text-[14px] font-medium transition-all duration-200 ease-out",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                          )}
                          onClick={() => {
                            onClose();
                          }}
                        >
                          {isActive ? (
                            <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary" />
                          ) : null}
                          <div
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center transition-transform duration-150 ease-out group-hover:scale-110",
                              isActive
                                ? "text-accent-foreground"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            <item.icon className="size-[18px]" />
                          </div>
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-border p-3">
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() =>
              startTransition(async () => {
                await logoutAction();
                window.location.href = `/${locale}`;
              })
            }
            className="group flex w-full items-center gap-3 rounded-[10px] px-4 py-3 font-sans text-[14px] font-medium text-muted-foreground transition-all duration-200 ease-out hover:bg-secondary hover:text-foreground active:scale-[0.96] disabled:opacity-60 cursor-pointer"
          >
            <LogOut className="size-[18px] transition-transform duration-150 ease-out group-hover:scale-110" />
            {isLoggingOut ? t("loggingOut") : t("logout")}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
