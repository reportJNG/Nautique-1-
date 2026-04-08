"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link as IntlLink, useRouter } from "@/i18n/navigation";
import { getLandingRedirectForArea } from "@/lib/actions/auth.actions";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
    Waves,
    Menu,
    X,
    Home,
    Zap,
    Clock,
    Images,
    MessageCircle,
    LifeBuoy,
    User,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── constants ─────────────────────────────────────────────── */

const NAV_OFFSET_PX = 72;

const SECTION_IDS = [
    "accueil",
    "horaires",
    "disciplines",
    "gallery",
    "testimonials",
    "support",
    "contact",
] as const;

type SectionId = (typeof SECTION_IDS)[number];

function isSectionId(id: string): id is SectionId {
    return (SECTION_IDS as readonly string[]).includes(id);
}

interface NavItem {
    id: string;
    labelKey: string;
    icon: React.ComponentType<{ className?: string }>;
    sectionId: SectionId;
}

const NAV_ITEMS: NavItem[] = [
    { id: "home", labelKey: "home", icon: Home, sectionId: "accueil" },
    { id: "schedule", labelKey: "schedule", icon: Clock, sectionId: "horaires" },
    { id: "disciplines", labelKey: "disciplines", icon: Zap, sectionId: "disciplines" },
    { id: "gallery", labelKey: "gallery", icon: Images, sectionId: "gallery" },
    { id: "testimonials", labelKey: "testimonials", icon: MessageCircle, sectionId: "testimonials" },
    { id: "support", labelKey: "support", icon: LifeBuoy, sectionId: "support" },
];

/* ─── helpers ───────────────────────────────────────────────── */

function sectionHref(locale: string, id: string) {
    return `/${locale}#${id}`;
}

function getActiveSection(): SectionId {
    let active: SectionId = "accueil";
    for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= NAV_OFFSET_PX + 0.5) active = id;
    }
    return active;
}

function scrollToSection(id: SectionId, behavior: ScrollBehavior) {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET_PX,
        behavior,
    });
}

/* ─── scroll hook ───────────────────────────────────────────── */

function useScrollMetrics() {
    const [active, setActive] = useState<SectionId>("accueil");
    const [progress, setProgress] = useState(0);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const tick = () => {
            setActive(getActiveSection());
            const doc = document.documentElement;
            const max = doc.scrollHeight - doc.clientHeight;
            setProgress(max > 0 ? doc.scrollTop / max : 0);
            setScrolled(window.scrollY > 20);
        };
        tick();
        const raf = requestAnimationFrame(() => requestAnimationFrame(tick));
        window.addEventListener("scroll", tick, { passive: true });
        window.addEventListener("resize", tick);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", tick);
            window.removeEventListener("resize", tick);
        };
    }, []);

    return { active, progress, scrolled };
}

/* ─── component ─────────────────────────────────────────────── */

export function LandingNav() {
    const t = useTranslations("nav");
    const locale = useLocale();
    const router = useRouter();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [hovered, setHovered] = useState<string | null>(null);
    const [loading, setLoading] = useState<"adherent" | "agent" | null>(null);
    const [clickedId, setClickedId] = useState<string | null>(null);

    const menuRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const hashRef = useRef(false);

    const { active, progress, scrolled } = useScrollMetrics();

    /* deep-link on mount */
    useEffect(() => {
        if (hashRef.current) return;
        const id = decodeURIComponent(window.location.hash?.slice(1) ?? "");
        if (!isSectionId(id)) return;
        hashRef.current = true;
        requestAnimationFrame(() => requestAnimationFrame(() => scrollToSection(id, "auto")));
    }, []);

    /* close on Escape / outside click */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
        const onOut = (e: MouseEvent) => {
            const target = e.target as Node;
            if (!menuRef.current?.contains(target) && !btnRef.current?.contains(target)) {
                setMobileOpen(false);
            }
        };
        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onOut);
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onOut);
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    const handleAuth = useCallback(
        async (area: "adherent" | "agent") => {
            setLoading(area);
            try {
                const { href } = await getLandingRedirectForArea(area);
                router.push(href);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(null);
            }
        },
        [router],
    );

    const navigate = useCallback(
        (id: SectionId, behavior: ScrollBehavior) => {
            scrollToSection(id, behavior);
            try { window.history.replaceState(null, "", sectionHref(locale, id)); } catch { }
        },
        [locale],
    );

    const handleClick = useCallback(
        async (e: React.MouseEvent<HTMLAnchorElement>, id: SectionId) => {
            e.preventDefault();
            setClickedId(id);
            navigate(id, "smooth");
            setMobileOpen(false);

            // Reset clicked state after animation
            setTimeout(() => setClickedId(null), 300);
        },
        [navigate],
    );

    const wrapClass = useMemo(() => cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
            ? "bg-background/95 backdrop-blur-xl border-border shadow-[0_1px_16px_0_rgba(0,0,0,0.06)]"
            : "bg-background/0 dark:bg-gradient-to-b dark:from-black/55 dark:via-black/20 dark:to-transparent",
    ), [scrolled]);

    /* ── small spinner ── */
    const Spin = () => (
        <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
    );

    /* ── desktop nav item with enhanced href UI ── */
    const renderDesktop = (item: NavItem) => {
        const Icon = item.icon;
        const isActive = active === item.sectionId;
        const isHov = hovered === item.id;
        const isClicked = clickedId === item.id;

        return (
            <motion.a
                key={item.id}
                href={sectionHref(locale, item.sectionId)}
                onClick={(e) => handleClick(e, item.sectionId)}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                aria-current={isActive ? "location" : undefined}
                whileTap={{ scale: 0.96 }}
                className={cn(
                    // ── pill shape ──
                    "relative flex shrink-0 items-center gap-[5px] rounded-full px-[9px] py-[5px]",
                    // ── typography — tiny, tight uppercase ──
                    "text-[10.5px] font-bold tracking-[0.07em] uppercase leading-none whitespace-nowrap",
                    // ── interaction ──
                    "cursor-pointer select-none transition-all duration-200",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                    // ── color: scrolled ──
                    scrolled
                        ? isActive
                            ? "text-primary dark:text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        // ── color: hero (theme-aware) ──
                        : isActive
                            ? "text-primary dark:text-primary"
                            : "text-muted-foreground/80 dark:text-white/55 hover:text-foreground",
                )}
            >
                {/* background pill — enhanced with gradient on hover */}
                <AnimatePresence>
                    {(isActive || isHov) && (
                        <motion.span
                            key={isActive ? "active-bg" : "hover-bg"}
                            layoutId={isActive ? "pill-active" : undefined}
                            initial={{ opacity: 0, scale: 0.88 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.88 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={cn(
                                "absolute inset-0 rounded-full",
                                isActive
                                    ? "bg-primary/10 dark:bg-primary/15"
                                    : "bg-muted/50 dark:bg-white/5"
                            )}
                        />
                    )}
                </AnimatePresence>

                {/* ripple effect on click */}
                {isClicked && (
                    <motion.span
                        initial={{ scale: 0.2, opacity: 0.8 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full bg-primary/30 dark:bg-primary/40 pointer-events-none"
                    />
                )}

                {/* icon — enhanced animation */}
                <motion.div
                    animate={{
                        scale: (isActive || isHov) ? 1.8 : 1.3,
                        rotate: (isActive || isHov) ? [0, 5, 0] : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10"
                >
                    <Icon
                        aria-hidden="true"
                        className={cn(
                            "h-[12px] w-[7.5px] flex-shrink-0 transition-colors duration-200",
                            scrolled
                                ? isActive
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                : isActive
                                    ? "text-primary"
                                    : "text-muted-foreground/70",
                        )}
                    />
                </motion.div>

                {/* label with enhanced hover effect */}
                <motion.span
                    className="relative z-10"
                    animate={{
                        x: (isActive || isHov) ? 1 : 0
                    }}
                    transition={{ duration: 0.15 }}
                >
                    {t(item.labelKey)}
                </motion.span>

                {/* active indicator — enhanced with glow */}
                {isActive && (
                    <>
                        <motion.span
                            layoutId="nav-dot"
                            className={cn(
                                "absolute bottom-[3px] left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full",
                                "bg-primary"
                            )}
                            transition={{ type: "spring", stiffness: 440, damping: 34 }}
                        />
                        {/* Glow effect for active item */}
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            className="absolute -inset-x-1 -inset-y-0.5 rounded-full bg-primary/20 dark:bg-primary/20 blur-md pointer-events-none"
                        />
                    </>
                )}
            </motion.a>
        );
    };

    /* ── mobile nav item with enhanced href UI ── */
    const renderMobile = (item: NavItem, i: number) => {
        const Icon = item.icon;
        const isActive = active === item.sectionId;
        const isClicked = clickedId === item.id;

        return (
            <motion.div
                key={item.id}
                initial={{ x: -12, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                <motion.a
                    href={sectionHref(locale, item.sectionId)}
                    onClick={(e) => handleClick(e, item.sectionId)}
                    aria-current={isActive ? "location" : undefined}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 overflow-hidden",
                        isActive
                            ? "bg-primary/10 dark:bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                >
                    {/* Hover background animation */}
                    {!isActive && (
                        <motion.span
                            initial={{ x: '-100%' }}
                            whileHover={{ x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-gradient-to-r from-muted/0 via-muted/50 to-muted/0 dark:from-white/0 dark:via-white/5 dark:to-white/0 pointer-events-none"
                        />
                    )}

                    {/* Click ripple */}
                    {isClicked && (
                        <motion.span
                            initial={{ scale: 0, opacity: 0.6 }}
                            animate={{ scale: 3, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 rounded-xl bg-primary/30 dark:bg-primary/40 pointer-events-none"
                        />
                    )}

                    <span className={cn(
                        "flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 relative z-10",
                        isActive
                            ? "bg-primary/20 dark:bg-primary/25 text-primary shadow-sm"
                            : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:scale-105",
                    )}>
                        <Icon className="h-3 w-3 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                    </span>

                    <span className="flex-1 text-[13px] font-medium leading-none relative z-10">
                        {t(item.labelKey)}
                    </span>

                    {isActive
                        ? <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                        : <ChevronRight className="h-3 w-3 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-40" />
                    }
                </motion.a>
            </motion.div>
        );
    };

    return (
        <>
            <nav className={wrapClass} aria-label={t("mainNavigation")}>
                <div className="mx-auto flex h-[50px] max-w-screen-xl items-center justify-between gap-3 px-4 sm:px-6">

                    {/* ── Brand with enhanced href UI ── */}
                    <IntlLink
                        href="/"
                        aria-label={t("brand")}
                        className="group flex shrink-0 items-center gap-[7px] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                    >
                        <motion.div
                            whileHover={{ rotate: 15, scale: 1.12 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 500, damping: 12 }}
                        >
                            <Waves
                                className={cn(
                                    "h-[18px] w-[18px] transition-all duration-300",
                                    scrolled
                                        ? "text-primary"
                                        : "text-primary",
                                )}
                                aria-hidden="true"
                            />
                        </motion.div>
                        <motion.span
                            className={cn(
                                "text-[13px] font-bold tracking-tight transition-all duration-300 relative",
                                scrolled
                                    ? "text-foreground"
                                    : "text-foreground",
                            )}
                            whileHover={{
                                letterSpacing: "0.01em",
                                transition: { duration: 0.2 }
                            }}
                        >
                            {t("brand")}
                            <motion.span
                                className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                            />
                        </motion.span>
                    </IntlLink>

                    {/* ── Desktop nav — pill track ── */}
                    <div
                        role="navigation"
                        aria-label={t("desktopMenu")}
                        className="hidden min-w-0 flex-1 items-center justify-center md:flex"
                    >
                        <div className={cn(
                            "flex items-center gap-[2px]",
                            "overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                            "transition-all duration-500",
                            scrolled
                                ? "rounded-full bg-muted/50 px-[6px] py-[4px] ring-1 ring-inset ring-border"
                                : "px-0 py-0",
                        )}>
                            {NAV_ITEMS.map(renderDesktop)}
                        </div>
                    </div>

                    {/* ── Desktop actions ── */}
                    <div className="hidden shrink-0 items-center gap-1.5 md:flex">
                        <div className="flex items-center gap-0.5">
                            <ThemeToggle />
                            <LanguageSwitcher />
                        </div>

                        <span className={cn(
                            "h-4 w-px transition-colors duration-300",
                            scrolled
                                ? "bg-border"
                                : "bg-border/50",
                        )} />

                        {/* Member button with enhanced hover */}
                        <motion.button
                            type="button"
                            onClick={() => handleAuth("adherent")}
                            disabled={loading !== null}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className={cn(
                                "inline-flex h-[26px] items-center gap-[5px] rounded-full px-3 cursor-pointer",
                                "text-[10.5px] font-bold tracking-[0.06em] uppercase leading-none whitespace-nowrap",
                                "border transition-all duration-200",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                "disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
                                scrolled
                                    ? "border-border text-foreground hover:bg-muted/50"
                                    : "border-border text-foreground/90 hover:bg-muted/30",
                            )}
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                            {loading === "adherent" ? <Spin /> : <User className="h-[10px] w-[10px]" />}
                            {t("loginAdherent")}
                        </motion.button>

                    </div>

                    {/* ── Mobile toggle ── */}
                    <motion.button
                        ref={btnRef}
                        type="button"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-menu"
                        whileTap={{ scale: 0.92 }}
                        className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                            "transition-all duration-200 md:hidden",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            scrolled
                                ? "text-foreground hover:bg-muted/50"
                                : "text-foreground hover:bg-muted/30",
                        )}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={mobileOpen ? "x" : "m"}
                                initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                                transition={{ duration: 0.15, type: "spring", stiffness: 400 }}
                            >
                                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                            </motion.span>
                        </AnimatePresence>
                    </motion.button>
                </div>

                {/* ── Mobile menu with enhanced UI ── */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            ref={menuRef}
                            id="mobile-menu"
                            initial={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="border-t border-border bg-background/98 backdrop-blur-2xl md:hidden shadow-xl"
                        >
                            <div className="mx-auto flex max-h-[calc(100dvh-50px)] max-w-screen-xl flex-col overflow-y-auto px-4 py-3 pb-6">
                                {/* nav links */}
                                <div className="space-y-1">
                                    {NAV_ITEMS.map(renderMobile)}
                                </div>

                                {/* preferences row */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mt-5 flex items-center justify-between border-t border-border pt-4"
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        {t("preferences")}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <ThemeToggle />
                                        <LanguageSwitcher />
                                    </div>
                                </motion.div>

                                {/* auth buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="mt-4 grid grid-cols-2 gap-2.5"
                                >
                                    <motion.button
                                        type="button"
                                        onClick={() => { setMobileOpen(false); handleAuth("adherent"); }}
                                        disabled={loading !== null}
                                        whileTap={{ scale: 0.97 }}
                                        className={cn(
                                            "inline-flex items-center justify-center gap-2 rounded-xl",
                                            "h-10 px-3 text-[13px] font-medium",
                                            "border border-border",
                                            "bg-card text-foreground",
                                            "hover:bg-muted/50 transition-all duration-200",
                                            "disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
                                        )}
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-muted/0 via-muted/50 to-muted/0 dark:from-white/0 dark:via-white/5 dark:to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                                        {loading === "adherent"
                                            ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent cursor-pointer" />
                                            : <User className="h-3.5 w-3.5" />
                                        }
                                        {t("loginAdherent")}
                                    </motion.button>

                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ── Enhanced scroll progress bar with glow ── */}
            <motion.div
                aria-hidden="true"
                className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-primary via-accent to-primary/60"
                style={{ scaleX: progress }}
            />
            <motion.div
                aria-hidden="true"
                className="pointer-events-none fixed left-0 right-0 top-0 z-[59] h-[2px] origin-left bg-gradient-to-r from-primary/30 via-accent/30 to-primary/20 blur-sm"
                style={{ scaleX: progress }}
            />
        </>
    );
}
