"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
    Menu,
    ChevronDown,
    User,
    Settings,
    LogOut,
    Bell,
    Award,
    HelpCircle,
    Calendar,
    CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import { logoutAction } from "@/lib/actions/auth.actions";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";

interface EspaceTopbarProps {
    onMenuClick: () => void;
    sidebarOpen: boolean;
    adherent: {
        nom: string;
        prenom: string;
        numeroDossier: string;
        email?: string | null;
    };
}

interface Notification {
    id: number;
    title: string;
    description: string;
    time: string;
    read: boolean;
    type: "facture" | "promo" | "info" | "abonnement";
    link?: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: 1,
        title: "Nouvel abonnement disponible",
        description: "Découvrez notre nouvelle formule familiale",
        time: "Il y a 2 heures",
        read: false,
        type: "abonnement",
        link: "/espace/abonnements/nouveau",
    },
    {
        id: 2,
        title: "Facture mars 2024",
        description: "Votre facture est disponible en téléchargement",
        time: "Il y a 1 jour",
        read: false,
        type: "facture",
        link: "/espace/factures",
    },
    {
        id: 3,
        title: "Promotion exclusive",
        description: "-20% sur tous les abonnements annuels",
        time: "Il y a 2 jours",
        read: true,
        type: "promo",
        link: "/espace/abonnements",
    },
    {
        id: 4,
        title: "Rappel de séance",
        description: "Votre prochaine séance de natation est demain à 18h",
        time: "Il y a 3 jours",
        read: true,
        type: "info",
        link: "/espace/acces",
    },
];

export function EspaceTopbar({ onMenuClick, sidebarOpen, adherent }: EspaceTopbarProps) {
    const t = useTranslations("adherent");
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const unreadCount = notifications.filter((n) => !n.read).length;
    const initials =
        adherent.prenom.charAt(0).toUpperCase() + adherent.nom.charAt(0).toUpperCase();

    const getPageTitle = () => {
        const path = pathname.split("/").pop();
        const titles: Record<string, string> = {
            espace: "Tableau de bord",
            abonnements: "Mes abonnements",
            acces: "Accès & historiques",
            profil: "Mon profil",
            parametres: "Paramètres",
            factures: "Mes factures",
            fidelite: "Programme fidélité",
            support: "Support client",
        };
        return titles[path || "espace"] || "Espace adhérent";
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logoutAction();
            window.location.href = `/${locale}`;
        } catch {
            setIsLoggingOut(false);
        }
    };

    const markAsRead = (id: number) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const getNotificationIcon = (type: Notification["type"]) => {
        switch (type) {
            case "facture": return <CreditCard className="h-4 w-4 text-blue-500" />;
            case "promo": return <Award className="h-4 w-4 text-cyan-500" />;
            case "abonnement": return <Calendar className="h-4 w-4 text-emerald-500" />;
            default: return <Bell className="h-4 w-4 text-amber-500" />;
        }
    };

    const getNotificationRingColor = (type: Notification["type"]) => {
        switch (type) {
            case "facture": return "bg-blue-500/10 border-blue-500/20";
            case "promo": return "bg-cyan-500/10 border-cyan-500/20";
            case "abonnement": return "bg-emerald-500/10 border-emerald-500/20";
            default: return "bg-amber-500/10 border-amber-500/20";
        }
    };

    const formatTime = (date: Date) =>
        date.toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });

    const formatDate = (date: Date) =>
        date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
            day: "numeric",
            month: "long",
        });

    return (
        <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-card/95 backdrop-blur-xl border-b border-border/60 shadow-sm transition-all duration-300 ease-out">
            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary via-primary/50 to-transparent" />

            <div className="flex h-full items-center justify-between px-4 md:px-6">

                {/* ── Left ── */}
                <div className="flex items-center gap-3">
                    {/* Hamburger / toggle — always visible, toggles the sidebar */}
                    <button
                        onClick={onMenuClick}
                        aria-label={sidebarOpen ? "Fermer la barre latérale" : "Ouvrir la barre latérale"}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/50 text-foreground transition-all duration-200 hover:bg-muted hover:scale-105 active:scale-95"
                    >

                        <Menu className="h-4 w-4" />



                    </button>
                </div>

                {/* ── Right ── */}
                <div className="flex items-center gap-1 sm:gap-2">

                    {/* Date & time — desktop only */}
                    <div className="hidden lg:flex items-center gap-3 rounded-lg border border-border/40 bg-muted/30 px-3 py-1.5">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary/70" />
                            <span className="text-xs font-medium text-muted-foreground">
                                {formatDate(currentTime)}
                            </span>
                        </div>
                        <div className="h-3 w-px bg-border/50" />
                        <span className="text-xs font-mono font-semibold text-foreground">
                            {formatTime(currentTime)}
                        </span>
                    </div>

                    {/* Notifications */}
                    <Popover.Root open={showNotifications} onOpenChange={setShowNotifications}>
                        <Popover.Trigger asChild>
                            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground">
                                <Bell className="h-4 w-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground shadow-md">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </Popover.Trigger>

                        <Popover.Portal>
                            <Popover.Content
                                className="z-50 w-80 sm:w-96 rounded-xl border border-border/60 bg-card shadow-2xl animate-in slide-in-from-top-2 fade-in-0 duration-200"
                                sideOffset={8}
                                align="end"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-gradient-to-r from-primary/5 to-transparent">
                                    <div className="flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                        >
                                            Tout lire
                                        </button>
                                    )}
                                </div>

                                {/* List */}
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/30 mb-3">
                                                <Bell className="h-6 w-6 text-muted-foreground/30" />
                                            </div>
                                            <p className="text-sm text-muted-foreground">Aucune notification</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => markAsRead(notif.id)}
                                                className={cn(
                                                    "group cursor-pointer border-b border-border/30 px-4 py-3 transition-colors hover:bg-muted/30",
                                                    !notif.read && "bg-gradient-to-r from-primary/5 to-transparent"
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={cn(
                                                            "flex-shrink-0 rounded-lg border p-2",
                                                            getNotificationRingColor(notif.type),
                                                            !notif.read && "ring-2 ring-primary/20"
                                                        )}
                                                    >
                                                        {getNotificationIcon(notif.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p
                                                            className={cn(
                                                                "text-sm mb-0.5 truncate",
                                                                !notif.read ? "font-semibold text-foreground" : "text-muted-foreground"
                                                            )}
                                                        >
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground/70 mb-1 line-clamp-2">
                                                            {notif.description}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground/50">{notif.time}</p>
                                                    </div>
                                                    {!notif.read && (
                                                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {notifications.length > 0 && (
                                    <div className="border-t border-border/50 bg-muted/20 p-3">
                                        <button className="w-full rounded-lg px-3 py-2 text-center text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
                                            Voir toutes les notifications
                                        </button>
                                    </div>
                                )}

                                <Popover.Arrow className="fill-border" />
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>

                    <ThemeToggle />
                    <LanguageSwitcher />

                    {/* User dropdown */}
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="flex items-center gap-2.5 rounded-lg py-1 pl-2 pr-2 transition-all duration-200 hover:bg-muted/70 group cursor-pointer">
                                <div className="relative">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
                                        {initials}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500 shadow-sm" />
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-semibold text-foreground leading-tight">
                                        {adherent.prenom} {adherent.nom}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        N° {adherent.numeroDossier}
                                    </p>
                                </div>
                                <ChevronDown className="hidden lg:block h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                className="z-50 min-w-64 rounded-xl border border-border/60 bg-card shadow-2xl animate-in slide-in-from-top-2 fade-in-0 duration-200"
                                sideOffset={8}
                                align="end"
                            >
                                {/* User header */}
                                <div className="border-b border-border/50 px-4 py-3 bg-gradient-to-r from-primary/5 to-transparent">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-sm">
                                                {initials}
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground">
                                                {adherent.prenom} {adherent.nom}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {adherent.email ?? "adhérent@sonatrach.dz"}
                                            </p>
                                            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/60">
                                                ID: {adherent.numeroDossier}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="py-1.5">
                                    {[
                                        { label: "Mon profil", icon: User, path: "/espace/profil" },
                                        { label: "Paramètres", icon: Settings, path: "/espace/parametres" },
                                        { label: "Aide & Support", icon: HelpCircle, path: "/espace/support" },
                                    ].map(({ label, icon: Icon, path }) => (
                                        <DropdownMenu.Item
                                            key={path}
                                            onClick={() => router.push(`/${locale}${path}`)}
                                            className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-foreground outline-none transition-colors hover:bg-muted/70"
                                        >
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            <span>{label}</span>
                                        </DropdownMenu.Item>
                                    ))}
                                </div>

                                {/* Logout */}
                                <div className="border-t border-border/50 py-1.5">
                                    <DropdownMenu.Item
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>{isLoggingOut ? "Déconnexion…" : "Déconnexion"}</span>
                                    </DropdownMenu.Item>
                                </div>

                                <DropdownMenu.Arrow className="fill-border" />
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.5);
        }
      `}</style>
        </header>
    );
}