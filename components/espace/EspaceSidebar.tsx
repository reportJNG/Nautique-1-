"use client";

import Link from "next/link";
import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  NewspaperIcon,
  HelpCircleIcon,
  User,
  History,
  Settings,
  LogOut,
  Waves,
  ChevronRight,
  Loader2,
  X,
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
  isOpen: boolean;
  onClose: () => void;
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

  const isActive = item.exact
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
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
            isActive || childActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
          )}
        >
          <item.icon
            className={cn(
              "h-4 w-4 shrink-0",
              isActive || childActive ? "text-primary" : "text-muted-foreground"
            )}
          />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-200",
              expanded && "rotate-90"
            )}
          />
        </button>

        {expanded && (
          <ul className="ml-4 mt-1 space-y-0.5 border-l border-border/60 pl-3">
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
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-primary/10 text-primary shadow-sm"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        )}
      >
        <item.icon
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
        />
        <span className="flex-1">{item.label}</span>

        {item.badge !== undefined && (
          <span
            className={cn(
              "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums",
              isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            {item.badge}
          </span>
        )}

        {isActive && item.badge === undefined && (
          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
        )}
      </Link>
    </li>
  );
}

export function EspaceSidebar({ adherent, isOpen, onClose }: EspaceSidebarProps) {
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
          href: "/espace/news",
          label: 'News',
          icon: NewspaperIcon,
          exact: true,
        },
        {
          href: "/espace/abonnements",
          label: t("abonnements"),
          icon: Calendar,
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
        {
          href: "/espace/support",
          label: "Aide & Support",
          icon: HelpCircleIcon,
        },
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
    /* Sidebar slides fully off-screen when closed — no overlay, no backdrop.
       The main content expands to fill the freed space (handled by EspaceShell margin). */
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col",
        "bg-card border-r border-border/60 shadow-xl",
        "transition-transform duration-300 ease-out will-change-transform",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
      aria-hidden={!isOpen}
    >
      {/* ── Brand header with inline close button ── */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-sm">
            <Waves className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-foreground">SONATRACH</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Espace adhérent
            </p>
          </div>
        </div>

        {/* Close button — the only way to close (besides topbar toggle) */}
        <button
          onClick={onClose}
          aria-label="Fermer la barre latérale"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Navigation principale">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
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

      {/* ── Logout ── */}
      <div className="shrink-0 border-t border-border/60 p-3">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-60"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 shrink-0" />
          )}
          <span>{loggingOut ? "Déconnexion…" : t("logout")}</span>
        </button>
      </div>
    </aside>
  );
}