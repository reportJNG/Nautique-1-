"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Link as IntlLink, useRouter } from "@/i18n/navigation";
import { getLandingRedirectForArea } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Waves, Menu, X, Home, Zap, Clock, Images, MessageCircle, User, Shield, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
export function LandingNav() {
    const t = useTranslations("nav");
    const locale = useLocale();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState("");
    const sectionIds = ["disciplines", "horaires", "gallery", "testimonials", "contact"];
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
            const headerOffset = 110;
            const nearBottom = headerOffset;
            const nearTop = headerOffset + 200;
            let bestSection = "";
            let bestTop = -Infinity;
            for (const id of sectionIds) {
                const element = document.getElementById(id);
                if (!element)
                    continue;
                const rect = element.getBoundingClientRect();
                if (rect.bottom < nearBottom)
                    continue;
                if (rect.top > nearTop)
                    continue;
                if (rect.top > bestTop) {
                    bestTop = rect.top;
                    bestSection = id;
                }
            }
            setActiveLink(bestSection || (window.scrollY < 200 ? "hero" : ""));
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
        { href: "/#hero", label: t("home"), icon: Home },
        { href: "/#horaires", label: t("schedule"), icon: Clock },
        { href: "/#disciplines", label: t("disciplines"), icon: Zap },
        { href: "/#gallery", label: t("gallery"), icon: Images },
        { href: "/#testimonials", label: t("testimonials"), icon: MessageCircle },
    ];
    const handleAdherentClick = async () => {
        const { href } = await getLandingRedirectForArea("adherent");
        router.push(href);
    };
    const handleAgentClick = async () => {
        const { href } = await getLandingRedirectForArea("agent");
        router.push(href);
    };
    return (<>
      <nav className={`sticky top-0 z-50 w-full transition-all duration-500 ${scrolled
            ? "border-b border-gray-200/20 bg-white/95 backdrop-blur-xl shadow-lg dark:border-gray-800/50 dark:bg-gray-950/95"
            : "bg-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <Link href={`/${locale}`} className="group relative flex items-center gap-2 transition-all duration-300 hover:scale-105">
            <div className="relative">
              <Waves className="h-8 w-8 text-cyan-600 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 dark:text-cyan-500"/>
              
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent transition-all duration-300 group-hover:from-cyan-600 group-hover:to-cyan-800 dark:from-white dark:to-gray-300 dark:group-hover:from-cyan-400 dark:group-hover:to-cyan-600">
              {t("brand")}
            </span>
          </Link>

          
          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeLink === link.href.replace("/#", "");
            return (<IntlLink key={link.href} href={link.href} onClick={() => setActiveLink(link.href.replace("/#", ""))} className={`group relative px-3 py-2 text-sm font-medium transition-all duration-300 cursor-pointer${isActive
                    ? "text-cyan-600 dark:text-cyan-400"
                    : "text-gray-600 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400"}`}>
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`h-4 w-4 transition-all duration-300 ${isActive
                    ? "text-cyan-600 dark:text-cyan-400"
                    : "group-hover:scale-110 group-hover:text-cyan-600 dark:group-hover:text-cyan-400"}`}/>
                    {link.label}
                  </span>
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-cyan-500 to-cyan-600 transition-all duration-300 group-hover:w-full dark:from-cyan-400 dark:to-cyan-500"></span>
                  {isActive && (<span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-cyan-500 to-cyan-600 dark:from-cyan-400 dark:to-cyan-500"></span>)}
                </IntlLink>);
        })}
          </div>

          
          <div className="hidden items-center gap-2 md:flex">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ThemeToggle />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <LanguageSwitcher />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="button" onClick={handleAdherentClick} variant="outline" size="default" className="h-9 px-3 rounded-md text-sm font-medium 
                border border-gray-200 dark:border-gray-700
                transition-all duration-200
                hover:border-cyan-500 hover:shadow-sm hover:shadow-cyan-500/20
                active:scale-95
                dark:hover:border-cyan-400
                cursor-pointer">
                <User className="mr-2 h-3.5 w-3.5"/>
                <span>{t("loginAdherent")}</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="button" onClick={handleAgentClick} size="default" className="h-9 px-5 bg-gradient-to-r from-cyan-600 to-cyan-700 
rounded-md text-sm font-medium text-white
transition-all duration-200
hover:from-cyan-500 hover:to-cyan-600
hover:shadow-md hover:shadow-cyan-500/25
active:scale-95
dark:from-cyan-500 dark:to-cyan-600
dark:hover:from-cyan-400 dark:hover:to-cyan-500
cursor-pointer">
                <Shield className="mr-2 h-3.5 w-3.5"/>
                <span>{t("loginAgent")}</span>
              </Button>
            </motion.div>
          </div>

          
          <motion.button className="relative flex h-10 w-10 items-center justify-center rounded-md md:hidden hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsOpen(!isOpen)} aria-label={t("toggleMenu")} whileTap={{ scale: 0.9 }}>
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              {isOpen ? (<X className="h-5 w-5 text-gray-600 dark:text-gray-300"/>) : (<Menu className="h-5 w-5 text-gray-600 dark:text-gray-300"/>)}
            </motion.div>
          </motion.button>
        </div>

        
        <AnimatePresence>
          {isOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="border-t border-gray-100 bg-white/95 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/95 md:hidden">
              <motion.div className="flex flex-col space-y-1 px-4 py-4" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                {navLinks.map((link, index) => {
                const Icon = link.icon;
                return (<motion.div key={link.href} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.05 }}>
                      <IntlLink href={link.href} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-gray-600 transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-transparent hover:pl-4 hover:text-cyan-600 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-cyan-950 dark:hover:to-transparent dark:hover:text-cyan-400 cursor-pointer" onClick={() => {
                        setActiveLink(link.href.replace("/#", ""));
                        setIsOpen(false);
                    }}>
                        <Icon className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:text-cyan-600 dark:group-hover:text-cyan-400"/>
                        {link.label}
                        <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1"/>
                      </IntlLink>
                    </motion.div>);
            })}
                
                <div className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <ThemeToggle />
                  </motion.div>
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35 }}>
                    <LanguageSwitcher />
                  </motion.div>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <motion.div className="flex-1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                    <Button type="button" onClick={() => {
                setIsOpen(false);
                handleAdherentClick();
            }} variant="outline" size="default" className="h-10 w-full transition-all duration-300 hover:border-cyan-500 hover:shadow-md cursor-pointer">
                      <User className="mr-2 h-4 w-4"/>
                      {t("loginAdherent")}
                    </Button>
                  </motion.div>
                  <motion.div className="flex-1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.45 }}>
                    <Button type="button" onClick={() => {
                setIsOpen(false);
                handleAgentClick();
            }} size="default" className="h-10 w-full bg-gradient-to-r from-cyan-600 to-cyan-700 transition-all duration-300 hover:shadow-lg cursor-pointer">
                      <Shield className="mr-2 h-4 w-4"/>
                      {t("loginAgent")}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>)}
        </AnimatePresence>
      </nav>
      
      
      {scrolled && (<div className="fixed top-16 z-40 h-px w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>)}
    </>);
}
