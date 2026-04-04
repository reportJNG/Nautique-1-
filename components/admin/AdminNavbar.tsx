"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth.actions";
import {
    Bell,
    LogOut,
    User,
    Settings,
    Menu,
    Waves,
    Search,
    Sparkles,
    CheckCheck,
    AlertCircle,
    CalendarClock,
    X,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

/* ══════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════ */
interface AdminNavbarProps {
    agent: { nom: string; prenom: string; roleCode: string };
    sidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
    onMobileMenuOpen?: () => void;
}

/* ══════════════════════════════════════════════════════
   Segment → label
══════════════════════════════════════════════════════ */
const SEGMENT_LABELS: Record<string, { label: string; emoji: string }> = {
    admin: { label: "Dashboard", emoji: "◈" },
    adherents: { label: "Adhérents", emoji: "◈" },
    abonnements: { label: "Abonnements", emoji: "◈" },
    saisons: { label: "Saisons", emoji: "◈" },
    creneaux: { label: "Créneaux", emoji: "◈" },
    disciplines: { label: "Disciplines", emoji: "◈" },
    moniteurs: { label: "Moniteurs", emoji: "◈" },
    agents: { label: "Agents", emoji: "◈" },
    factures: { label: "Factures", emoji: "◈" },
    acces: { label: "Accès", emoji: "◈" },
    parametres: { label: "Paramètres", emoji: "◈" },
    nouveau: { label: "Nouveau", emoji: "◈" },
    modifier: { label: "Modifier", emoji: "◈" },
    details: { label: "Détails", emoji: "◈" },
    profile: { label: "Mon profil", emoji: "◈" },
};

/* ══════════════════════════════════════════════════════
   PageLabel — breadcrumb centre
══════════════════════════════════════════════════════ */
function PageLabel({ locale }: { locale: string }) {
    const pathname = usePathname();
    const pathWithoutLocale = pathname.startsWith(`/${locale}`)
        ? pathname.slice(locale.length + 1)
        : pathname;
    const segments = pathWithoutLocale.replace(/\/+$/, "").split("/").filter(Boolean);
    const currentSeg = segments[segments.length - 1] ?? "admin";
    const parentSeg = segments.length > 1 ? segments[segments.length - 2] : null;

    const current = SEGMENT_LABELS[currentSeg] ?? {
        label: currentSeg.charAt(0).toUpperCase() + currentSeg.slice(1),
        emoji: "◈",
    };
    const parent = parentSeg ? SEGMENT_LABELS[parentSeg] : null;

    return (
        <div className="flex items-center gap-1.5 select-none min-w-0">
            {parent && (
                <>
                    <span className="hidden sm:block text-[11.5px] text-muted-foreground font-medium truncate">
                        {parent.label}
                    </span>
                    <Menu className="hidden sm:block w-3 h-3 text-muted-foreground/50 flex-shrink-0 " />
                </>
            )}
            <span className="text-[13.5px] font-bold text-foreground tracking-tight truncate">
                {current.label}
            </span>
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   Icon button primitive
══════════════════════════════════════════════════════ */
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
                "relative flex items-center justify-center w-8 h-8 rounded-lg",
                "text-muted-foreground transition-all duration-150",
                "hover:text-foreground hover:bg-muted/50",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                "active:scale-95",
                active && "text-primary bg-primary/10"
            )}
        >
            {children}
            {badge && badge > 0 ? (
                <span className="absolute top-[5px] right-[5px] flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-primary text-[8.5px] font-bold text-primary-foreground ring-[1.5px] ring-background">
                    {badge > 9 ? "9+" : badge}
                </span>
            ) : null}
        </button>
    );
}

/* ══════════════════════════════════════════════════════
   Notification panel
══════════════════════════════════════════════════════ */
const DEMO_NOTIFS = [
    { id: 1, title: "Nouvel abonnement", body: "Ahmed Benali vient de s'inscrire.", time: "5 min", unread: true, icon: Sparkles, color: "text-primary" },
    { id: 2, title: "Facture en attente", body: "3 factures attendent un paiement.", time: "1h", unread: true, icon: AlertCircle, color: "text-accent" },
    { id: 3, title: "Saison mise à jour", body: "La saison 2024/25 a été modifiée.", time: "Hier", unread: false, icon: CalendarClock, color: "text-primary" },
];

function NavBell() {
    const [open, setOpen] = useState(false);
    const [notifs, setNotifs] = useState(DEMO_NOTIFS);
    const ref = useRef<HTMLDivElement>(null);
    const unread = notifs.filter((n) => n.unread).length;

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    return (
        <div ref={ref} className="relative">
            <NavIconBtn onClick={() => setOpen((o) => !o)} active={open} label="Notifications" badge={unread}>
                <Bell className="w-[15px] h-[15px] cursor-pointer" />
            </NavIconBtn>

            {open && (
                <div className="absolute top-full mt-2.5 right-0 z-50 w-[320px] rounded-2xl border border-border/50 bg-card/98 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.03)_inset] animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-foreground">Notifications</span>
                            {unread > 0 && (
                                <span className="flex items-center justify-center px-1.5 h-[18px] rounded-full bg-primary/15 border border-primary/20 text-[9.5px] font-bold text-primary">
                                    {unread}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unread > 0 && (
                                <button
                                    onClick={() => setNotifs((p) => p.map((n) => ({ ...n, unread: false })))}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/8 transition-all cursor-pointer"
                                >
                                    <CheckCheck className="w-3 h-3" />
                                    Tout lire
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <ul className="py-1.5 divide-y divide-border/20">
                        {notifs.map((n) => {
                            const Icon = n.icon;
                            return (
                                <li
                                    key={n.id}
                                    className={cn(
                                        "relative flex items-start gap-3 px-4 py-3 cursor-pointer",
                                        "hover:bg-muted/30 transition-colors",
                                        n.unread && "bg-primary/10"
                                    )}
                                    onClick={() => setNotifs((p) => p.map((x) => x.id === n.id ? { ...x, unread: false } : x))}
                                >
                                    {n.unread && (
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                                    )}
                                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-muted/50", n.color)}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12.5px] font-semibold text-foreground leading-snug">{n.title}</p>
                                        <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                                    </div>
                                    <span className="text-[10.5px] text-muted-foreground/50 flex-shrink-0 mt-0.5">{n.time}</span>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="px-4 py-2.5 border-t border-border/30">
                        <button className="w-full text-center text-[11.5px] text-muted-foreground hover:text-primary transition-colors py-0.5 cursor-pointer">
                            Voir toutes les notifications →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   Profile menu
══════════════════════════════════════════════════════ */
function NavProfile({ agent, locale }: { agent: AdminNavbarProps["agent"]; locale: string }) {
    const t = useTranslations("admin");
    const tNav = useTranslations("nav");
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const initials = `${agent.prenom?.[0] ?? ""}${agent.nom?.[0] ?? ""}`.toUpperCase() || "AG";

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    async function handleLogout() {
        await logoutAction();
        window.location.href = `/${locale}`;
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label="Profil"
                className={cn(
                    "flex items-center gap-2 h-8 pl-0.5 pr-2.5 rounded-lg cursor-pointer",
                    "transition-all duration-150",
                    "hover:bg-muted/50",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    "active:scale-95",
                    open && "bg-muted/50"
                )}
            >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.35)]">
                    {initials}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                    <span className="text-[11.5px] font-semibold text-foreground max-w-[80px] truncate leading-none">
                        {agent.prenom}
                    </span>
                    <span className="text-[9.5px] text-muted-foreground leading-none mt-0.5">{t(`roles.${agent.roleCode}`)}</span>
                </div>

            </button>

            {open && (
                <div className="absolute top-full mt-2.5 right-0 z-50 w-[240px] rounded-2xl border border-border/50 bg-card/98 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.03)_inset] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    {/* Identity */}
                    <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-b from-muted/30 to-transparent border-b border-border/30">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-[12px] font-bold text-primary-foreground flex-shrink-0 shadow-[0_0_14px_rgba(6,182,212,0.3)]">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13.5px] font-bold text-foreground truncate leading-snug">
                                {agent.prenom} {agent.nom}
                            </p>
                            <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
                                {t(`roles.${agent.roleCode}`)}
                            </span>
                        </div>
                    </div>

                    {/* Links */}
                    <ul className="p-1.5 space-y-0.5">
                        {[
                            { href: `/admin/profile`, icon: User, label: "Mon profil" },
                            { href: `/admin/parametres`, icon: Settings, label: "Paramètres" },
                        ].map(({ href, icon: Icon, label }) => (
                            <li key={href}>
                                <Link
                                    href={`/${locale}${href}`}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                                >
                                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Logout */}
                    <div className="p-1.5 pt-0 border-t border-border/30 mt-0.5">
                        <form action={handleLogout}>
                            <button
                                type="submit"
                                className="group flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[12.5px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            >
                                <LogOut className="w-3.5 h-3.5 flex-shrink-0 group-hover:text-destructive transition-colors" />
                                {tNav("logout")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   Main — AdminNavbar
══════════════════════════════════════════════════════ */
export function AdminNavbar({
    agent,
    sidebarCollapsed,
    onToggleSidebar,
    onMobileMenuOpen,
}: AdminNavbarProps) {
    const locale = useLocale();

    return (
        <header className="flex-shrink-0 flex items-center h-[54px] px-3 gap-2 bg-card/95 backdrop-blur-sm border-b border-border/50 z-10 relative">

            {/* ── LEFT ─────────────────────────────────────────── */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {/* Mobile: logo mark */}
                <div className="flex lg:hidden items-center gap-2 pl-1">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                        <Waves className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                </div>

                {/* Mobile: hamburger */}
                <button
                    className="flex lg:hidden items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all active:scale-95"
                    onClick={onMobileMenuOpen}
                    aria-label="Ouvrir le menu"
                >
                    <Menu className="w-4 h-4" />
                </button>

                {/* Desktop: sidebar collapse toggle */}
                <button
                    className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all active:scale-95 cursor-pointer"
                    onClick={onToggleSidebar}
                    aria-label={sidebarCollapsed ? "Agrandir le menu" : "Réduire le menu"}
                >
                    {sidebarCollapsed &&
                        <Menu className="w-4 h-4" />

                    }
                </button>
            </div>

            {/* ── CENTRE ───────────────────────────────────────── */}
            <div className="flex-1 flex items-center gap-3 min-w-0 px-1">

            </div>

            {/* ── RIGHT ────────────────────────────────────────── */}
            <div className="flex items-center gap-1 flex-shrink-0">
                <NavBell />
                <div className="w-px h-4 bg-border/50 mx-0.5" />
                <div className="flex items-center gap-1">
                    <LanguageSwitcher />
                    <ThemeToggle />
                </div>
                <div className="w-px h-4 bg-border/50 mx-0.5" />
                <NavProfile agent={agent} locale={locale} />
            </div>
        </header>
    );
}