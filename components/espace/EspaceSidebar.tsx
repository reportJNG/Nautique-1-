"use client";

import Link from "next/link";
import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  User,
  History,
  Settings,
  LogOut,
  Waves,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth.actions";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: string | number;
  children?: Omit<NavItem, "children">[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface EspaceSidebarProps {
  adherent: {
    nom: string;
    prenom: string;
    numeroDossier: string;
  };
}

function NavLink({
  item,
  locale,
  depth = 0,
}: {
  item: NavItem;
  locale: string;
  depth?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive =
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const hasChildren = !!item.children?.length;
  const childActive = item.children?.some(
    (c) => pathname === c.href || pathname.startsWith(`${c.href}/`)
  );
  const expanded = open || childActive;

  if (hasChildren) {
    return (
      <li>
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150",
            isActive || childActive
              ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          )}
        >
          <item.icon
            className={cn(
              "h-4 w-4 shrink-0",
              isActive || childActive
                ? "text-violet-500"
                : "text-gray-400 dark:text-gray-500"
            )}
          />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-gray-300 transition-transform duration-200 dark:text-gray-600",
              expanded && "rotate-90"
            )}
          />
        </button>

        {expanded && (
          <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-100 pl-3 dark:border-gray-800">
            {item.children!.map((child) => (
              <NavLink key={child.href} item={child} locale={locale} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={`/${locale}${item.href}`}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150",
          isActive
            ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        )}
      >
        <item.icon
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-violet-500" : "text-gray-400 dark:text-gray-500"
          )}
        />
        <span className="flex-1">{item.label}</span>

        {item.badge !== undefined && (
          <span
            className={cn(
              "flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
              isActive
                ? "bg-violet-200 text-violet-700 dark:bg-violet-800 dark:text-violet-200"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            )}
          >
            {item.badge}
          </span>
        )}

        {isActive && item.badge === undefined && (
          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
        )}
      </Link>
    </li>
  );
}

export function EspaceSidebar({ adherent }: EspaceSidebarProps) {
  const t = useTranslations("adherent");
  const locale = useLocale();
  const [, startTransition] = useTransition();
  const [loggingOut, setLoggingOut] = useState(false);

  const navGroups: NavGroup[] = [
    {
      label: "Navigation",
      items: [
        {
          href: "/espace",
          label: t("dashboard"),
          icon: LayoutDashboard,
          exact: true,
        },
        {
          href: "/espace/abonnements",
          label: t("abonnements"),
          icon: Calendar,
          children: [
            {
              href: "/espace/abonnements/nouveau",
              label: t("newAbonnement"),
              icon: PlusCircle,
            },
          ],
        },
        {
          href: "/espace/acces",
          label: t("access"),
          icon: History,
        },
      ],
    },
    {
      label: "Compte",
      items: [
        { href: "/espace/profil", label: t("profile"), icon: User },
        { href: "/espace/parametres", label: t("settings"), icon: Settings },
      ],
    },
  ];

  const initials =
    adherent.prenom.charAt(0).toUpperCase() + adherent.nom.charAt(0).toUpperCase();

  function handleLogout() {
    setLoggingOut(true);
    startTransition(async () => {
      await logoutAction();
      window.location.href = `/${locale}`;
    });
  }

  return (
    <aside className="flex h-full w-64 flex-col bg-white dark:bg-gray-900">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-gray-100 px-5 dark:border-gray-800">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
          <Waves className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold tracking-wide text-gray-900 dark:text-white">
          SONATRACH
        </span>
      </div>

      {/* User card */}
      <div className="mx-3 my-3 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800/60">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
          {initials}
          {/* Online dot */}
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-gray-900" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {adherent.prenom} {adherent.nom}
          </p>
          <p className="truncate text-[11px] text-gray-400 dark:text-gray-500">
            N° {adherent.numeroDossier}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-700">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} locale={locale} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-gray-100 p-3 dark:border-gray-800">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-60 dark:text-gray-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 cursor-pointer"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 shrink-0" />
          )}
          {loggingOut ? "Déconnexion…" : t("logout")}
        </button>
      </div>
    </aside>
  );
}