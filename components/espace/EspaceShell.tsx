"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { EspaceSidebar } from "./EspaceSidebar";
import { EspaceTopbar } from "./EspacebarTopbar";

const SIDEBAR_WIDTH = 320;
const DESKTOP_BREAKPOINT = 1024;

interface ShellNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  variant: "info" | "success" | "warning" | "neutral" | "danger";
}

interface Props {
  adherent: {
    nom: string;
    prenom: string;
    numeroDossier: string;
    email?: string | null;
    telephone?: string | null;
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
  notifications: ShellNotification[];
  children: React.ReactNode;
}

export function EspaceShell({
  adherent,
  centre,
  stats,
  context,
  notifications,
  children,
}: Props) {
  const t = useTranslations("espace.client.shell");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const previousDesktop = useRef<boolean | null>(null);
  const headerOffset = desktop ? "3.5rem" : "5.75rem";

  useEffect(() => {
    const sync = () => {
      const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;

      setDesktop(isDesktop);

      if (previousDesktop.current === null) {
        setSidebarOpen(isDesktop);
      } else if (previousDesktop.current !== isDesktop) {
        setSidebarOpen(isDesktop);
      }

      previousDesktop.current = isDesktop;
    };

    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    if (desktop || !sidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [desktop, sidebarOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.13),_transparent_35%),linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(240,249,255,1)_100%)] text-foreground dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_30%),linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(3,7,18,1)_100%)]">
      <EspaceTopbar
        adherent={adherent}
        centre={centre ?? null}
        stats={stats}
        notifications={notifications}
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen((value) => !value)}
      />

      <div
        className="relative min-h-screen transition-[padding-left,padding-top] duration-300 ease-out"
        style={{
          paddingLeft: desktop && sidebarOpen ? `${SIDEBAR_WIDTH}px` : "0px",
          paddingTop: headerOffset,
        }}
      >
        <AnimatePresence>
          {sidebarOpen && !desktop ? (
            <motion.button
              aria-label={t("closeNavigation")}
              className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          ) : null}
        </AnimatePresence>

        <EspaceSidebar
          adherent={adherent}
          centre={centre ?? null}
          stats={stats}
          context={context}
          isOpen={sidebarOpen}
          desktop={desktop}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="relative min-w-0">
          <motion.div
            key={`${desktop ? "desktop" : "mobile"}-${sidebarOpen ? "open" : "closed"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
