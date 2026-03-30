"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Link as IntlLink, useRouter } from "@/i18n/navigation";
import { getLandingRedirectForArea } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
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
    Shield,
    ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SECTION_IDS = [
    "disciplines",
    "horaires",
    "gallery",
    "testimonials",
    "support",
    "contact",
] as const;

export function LandingNav() {
    const t = useTranslations("nav");
    const locale = useLocale();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState("");

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
            const headerOffset = 110;
            const nearBottom = headerOffset;
            const nearTop = headerOffset + 200;
            let bestSection = "";
            let bestTop = -Infinity;
            for (const id of SECTION_IDS) {
                const element = document.getElementById(id);
                if (!element) continue;
                const rect = element.getBoundingClientRect();
                if (rect.bottom < nearBottom) continue;
                if (rect.top > nearTop) continue;
                if (rect.top > bestTop) {
                    bestTop = rect.top;
                    bestSection = id;
                }
            }
            setActiveLink(
                bestSection || (window.scrollY < 200 ? "accueil" : ""),
            );
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    const navLinks = [
        { href: "/#accueil", slug: "accueil", label: t("home"), icon: Home },
        { href: "/#horaires", slug: "horaires", label: t("schedule"), icon: Clock },
        { href: "/#disciplines", slug: "disciplines", label: t("disciplines"), icon: Zap },
        { href: "/#gallery", slug: "gallery", label: t("gallery"), icon: Images },
        {
            href: "/#testimonials",
            slug: "testimonials",
            label: t("testimonials"),
            icon: MessageCircle,
        },
        { href: "/#support", slug: "support", label: t("support"), icon: LifeBuoy },
    ] as const;

    const desktopNavLinkClass = (slug: string, isActive: boolean) =>
        cn(
            "group relative shrink-0 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-300 lg:px-3 lg:text-sm",
            scrolled
                ? isActive
                    ? "bg-cyan-500/10 text-cyan-600 shadow-sm dark:bg-cyan-500/15 dark:text-cyan-400"
                    : "text-gray-600 hover:bg-gray-100/90 hover:text-cyan-600 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-cyan-400"
                : isActive
                  ? "bg-white/20 text-white shadow-sm backdrop-blur-sm"
                  : "text-white/90 hover:bg-white/10 hover:text-cyan-200",
        );

    const desktopIconClass = (isActive: boolean) =>
        cn(
            "h-3.5 w-3.5 shrink-0 transition-all duration-300 lg:h-4 lg:w-4",
            scrolled
                ? isActive
                    ? "text-cyan-600 dark:text-cyan-400"
                    : "text-gray-500 group-hover:scale-110 group-hover:text-cyan-600 dark:text-gray-400 dark:group-hover:text-cyan-400"
                : isActive
                  ? "text-cyan-200"
                  : "text-white/80 group-hover:scale-110 group-hover:text-cyan-200",
        );

    const handleAdherentClick = async () => {
        const { href } = await getLandingRedirectForArea("adherent");
        router.push(href);
    };
    const handleAgentClick = async () => {
        const { href } = await getLandingRedirectForArea("agent");
        router.push(href);
    };

    return (
        <>
            <nav
                className={cn(
                    "sticky top-0 z-50 w-full transition-all duration-500",
                    scrolled
                        ? "border-b border-gray-200/20 bg-white/95 shadow-lg backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-950/95"
                        : "border-b border-transparent bg-gradient-to-b from-black/40 to-transparent",
                )}
            >
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:gap-4 lg:px-8">
                    <Link
                        href={`/${locale}`}
                        className={cn(
                            "group relative flex shrink-0 items-center gap-2 transition-all duration-300 hover:scale-[1.02]",
                        )}
                    >
                        <div className="relative">
                            <Waves
                                className={cn(
                                    "h-8 w-8 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110",
                                    scrolled
                                        ? "text-cyan-600 dark:text-cyan-500"
                                        : "text-cyan-300 drop-shadow-md",
                                )}
                            />
                        </div>
                        <span
                            className={cn(
                                "text-lg font-bold tracking-tight transition-all duration-300 sm:text-xl",
                                scrolled
                                    ? "bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-cyan-600 group-hover:to-cyan-800 dark:from-white dark:to-gray-300 dark:group-hover:from-cyan-400 dark:group-hover:to-cyan-600"
                                    : "bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-sm group-hover:from-cyan-200 group-hover:to-white",
                            )}
                        >
                            {t("brand")}
                        </span>
                    </Link>

                    <div className="hidden min-w-0 flex-1 justify-center md:flex">
                        <div
                            className={cn(
                                "flex max-w-full items-center gap-0.5 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:gap-1 [&::-webkit-scrollbar]:hidden",
                                scrolled &&
                                    "rounded-full border border-gray-200/60 bg-gray-50/50 px-1 dark:border-gray-700/60 dark:bg-gray-900/40",
                                !scrolled && "px-0.5",
                            )}
                        >
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = activeLink === link.slug;
                                return (
                                    <IntlLink
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setActiveLink(link.slug)}
                                        className={cn(
                                            desktopNavLinkClass(link.slug, isActive),
                                            "cursor-pointer",
                                        )}
                                    >
                                        <span className="relative z-10 flex items-center gap-1.5 lg:gap-2">
                                            <Icon
                                                className={desktopIconClass(isActive)}
                                                aria-hidden
                                            />
                                            <span className="whitespace-nowrap">
                                                {link.label}
                                            </span>
                                        </span>
                                    </IntlLink>
                                );
                            })}
                        </div>
                    </div>

                    <div className="hidden shrink-0 items-center gap-1.5 lg:gap-2 md:flex">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                !scrolled &&
                                    "[&_div.rounded-lg]:border-white/25 [&_svg]:text-white/90",
                            )}
                        >
                            <ThemeToggle />
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                !scrolled &&
                                    "[&_select]:border-white/30 [&_select]:bg-white/10 [&_select]:text-white [&_div_svg]:text-white/80",
                            )}
                        >
                            <LanguageSwitcher />
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                type="button"
                                onClick={handleAdherentClick}
                                variant="outline"
                                size="default"
                                className={cn(
                                    "h-9 cursor-pointer rounded-md px-3 text-sm font-medium transition-all duration-200 active:scale-95",
                                    scrolled
                                        ? "border-gray-200 hover:border-cyan-500 hover:shadow-sm hover:shadow-cyan-500/20 dark:border-gray-700 dark:hover:border-cyan-400"
                                        : "border-white/35 bg-white/5 text-white hover:border-cyan-300/80 hover:bg-white/15 hover:text-white",
                                )}
                            >
                                <User className="mr-2 h-3.5 w-3.5" />
                                <span>{t("loginAdherent")}</span>
                            </Button>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                type="button"
                                onClick={handleAgentClick}
                                size="default"
                                className="h-9 cursor-pointer rounded-md bg-gradient-to-r from-cyan-600 to-cyan-700 px-5 text-sm font-medium text-white shadow-md shadow-cyan-500/25 transition-all duration-200 hover:from-cyan-500 hover:to-cyan-600 hover:shadow-lg active:scale-95 dark:from-cyan-500 dark:to-cyan-600 dark:hover:from-cyan-400 dark:hover:to-cyan-500"
                            >
                                <Shield className="mr-2 h-3.5 w-3.5" />
                                <span>{t("loginAgent")}</span>
                            </Button>
                        </motion.div>
                    </div>

                    <motion.button
                        type="button"
                        className={cn(
                            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors md:hidden",
                            scrolled
                                ? "hover:bg-gray-100 dark:hover:bg-gray-800"
                                : "text-white hover:bg-white/10",
                        )}
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={t("toggleMenu")}
                        aria-expanded={isOpen}
                        whileTap={{ scale: 0.9 }}
                    >
                        <motion.div
                            animate={{ rotate: isOpen ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isOpen ? (
                                <X
                                    className={cn(
                                        "h-5 w-5",
                                        scrolled
                                            ? "text-gray-600 dark:text-gray-300"
                                            : "text-white",
                                    )}
                                />
                            ) : (
                                <Menu
                                    className={cn(
                                        "h-5 w-5",
                                        scrolled
                                            ? "text-gray-600 dark:text-gray-300"
                                            : "text-white",
                                    )}
                                />
                            )}
                        </motion.div>
                    </motion.button>
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="border-t border-gray-100 bg-white/95 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/95 md:hidden"
                        >
                            <motion.div
                                className="flex flex-col space-y-1 px-4 py-4"
                                initial={{ y: -12, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.08 }}
                            >
                                {navLinks.map((link, index) => {
                                    const Icon = link.icon;
                                    const isActive = activeLink === link.slug;
                                    return (
                                        <motion.div
                                            key={link.href}
                                            initial={{ x: -16, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.04 }}
                                        >
                                            <IntlLink
                                                href={link.href}
                                                className={cn(
                                                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium transition-all duration-300",
                                                    isActive
                                                        ? "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400"
                                                        : "text-gray-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-transparent hover:pl-4 hover:text-cyan-600 dark:text-gray-300 dark:hover:from-cyan-950/80 dark:hover:to-transparent dark:hover:text-cyan-400",
                                                    "cursor-pointer",
                                                )}
                                                onClick={() => {
                                                    setActiveLink(link.slug);
                                                    setIsOpen(false);
                                                }}
                                            >
                                                <Icon
                                                    className={cn(
                                                        "h-5 w-5 transition-all duration-300",
                                                        isActive
                                                            ? "text-cyan-600 dark:text-cyan-400"
                                                            : "group-hover:scale-110 group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
                                                    )}
                                                />
                                                {link.label}
                                                <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                                            </IntlLink>
                                        </motion.div>
                                    );
                                })}

                                <div className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <ThemeToggle />
                                    </motion.div>
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <LanguageSwitcher />
                                    </motion.div>
                                </div>

                                <div className="mt-3 flex gap-2">
                                    <motion.div
                                        className="flex-1"
                                        initial={{ x: -12, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setIsOpen(false);
                                                handleAdherentClick();
                                            }}
                                            variant="outline"
                                            size="default"
                                            className="h-10 w-full cursor-pointer transition-all duration-300 hover:border-cyan-500 hover:shadow-md"
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            {t("loginAdherent")}
                                        </Button>
                                    </motion.div>
                                    <motion.div
                                        className="flex-1"
                                        initial={{ x: 12, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setIsOpen(false);
                                                handleAgentClick();
                                            }}
                                            size="default"
                                            className="h-10 w-full cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-700 transition-all duration-300 hover:shadow-lg"
                                        >
                                            <Shield className="mr-2 h-4 w-4" />
                                            {t("loginAgent")}
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {scrolled && (
                <div className="pointer-events-none fixed top-16 z-40 h-px w-full bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent" />
            )}
        </>
    );
}
