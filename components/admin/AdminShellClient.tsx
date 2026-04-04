"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavbar } from "./AdminNavbar";
import { cn } from "@/lib/utils";
import { AdminToastProvider } from "@/components/admin/AdminToast";

/* ══════════════════════════════════════════════════════
   Types & Interfaces
══════════════════════════════════════════════════════ */
interface Agent {
  nom: string;
  prenom: string;
  roleCode: string;
}

interface AdminShellClientProps {
  agent: Agent;
  children: React.ReactNode;
}

interface SidebarState {
  isMobileOpen: boolean;
  isCollapsed: boolean;
}

/* ══════════════════════════════════════════════════════
   Constants
══════════════════════════════════════════════════════ */
const BREAKPOINTS = {
  lg: 1024,
  md: 768,
} as const;

const ANIMATION_DURATION = {
  sidebar: 300,
  backdrop: 300,
} as const;

const SIDEBAR_WIDTHS = {
  collapsed: 0,
  expanded: 256,
} as const;

const STORAGE_KEY = "admin-sidebar-state";

/* ══════════════════════════════════════════════════════
   Custom Hooks
══════════════════════════════════════════════════════ */

function useSidebarState(): SidebarState & {
  setMobileOpen: (open: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
} {
  const [state, setState] = useState<SidebarState>({
    isMobileOpen: false,
    isCollapsed: true,
  });

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          isCollapsed: parsed.isCollapsed ?? true,
        }));
      }
    } catch {
      // Fallback to default
    }
    setIsHydrated(true);
  }, []);

  const setMobileOpen = useCallback((isMobileOpen: boolean) => {
    setState(prev => ({ ...prev, isMobileOpen }));
  }, []);

  const setCollapsed = useCallback((isCollapsed: boolean) => {
    setState(prev => ({ ...prev, isCollapsed }));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ isCollapsed }));
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setState(prev => {
      const newCollapsed = !prev.isCollapsed;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ isCollapsed: newCollapsed }));
      }
      return { ...prev, isCollapsed: newCollapsed };
    });
  }, []);

  return {
    ...state,
    setMobileOpen,
    setCollapsed,
    toggleCollapsed,
  };
}

function useBodyScrollLock(shouldLock: boolean) {
  useEffect(() => {
    if (shouldLock) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [shouldLock]);
}

function useResponsiveSidebar(
  isMobileOpen: boolean,
  setMobileOpen: (open: boolean) => void
) {
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= BREAKPOINTS.lg && isMobileOpen) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileOpen, setMobileOpen]);
}

function useKeyboardShortcuts(
  isMobileOpen: boolean,
  closeMobile: () => void,
  toggleCollapsed: () => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        e.preventDefault();
        closeMobile();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toggleCollapsed();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, closeMobile, toggleCollapsed]);
}

/* ══════════════════════════════════════════════════════
   Subcomponents
══════════════════════════════════════════════════════ */

const BackgroundGrid = () => (
  <div
    className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]"
    style={{
      backgroundImage: `
        linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
        linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
      `,
      backgroundSize: "60px 60px",
    }}
    aria-hidden="true"
  />
);

const MobileBackdrop = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const t = useTranslations("admin.shell");

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 lg:hidden",
        "bg-background/80 backdrop-blur-sm",
        "transition-opacity duration-300 ease-in-out",
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter") {
          onClose();
        }
      }}
      role="button"
      tabIndex={isOpen ? 0 : -1}
      aria-label={t("closeOverlaySr")}
      aria-hidden={!isOpen}
    />
  );
};

const DesktopSidebar = ({
  agent,
  isCollapsed,
  setCollapsed,
}: {
  agent: Agent;
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) => {
  const width = isCollapsed ? SIDEBAR_WIDTHS.collapsed : SIDEBAR_WIDTHS.expanded;

  return (
    <aside
      className="hidden lg:flex h-full flex-shrink-0 relative z-20"
      style={{ width: `${width}px` }}
      aria-label="Sidebar navigation"
      suppressHydrationWarning
    >
      <div className="absolute inset-0 transition-[width] duration-300 ease-in-out">
        <AdminSidebar
          agent={agent}
          collapsed={isCollapsed}
          setCollapsed={setCollapsed}
        />
      </div>
    </aside>
  );
};

const MobileDrawer = ({
  agent,
  isOpen,
  onClose,
}: {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-50 h-full w-[272px] lg:hidden",
        "transition-transform duration-300 ease-in-out shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
      aria-label="Mobile navigation drawer"
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal={isOpen}
      suppressHydrationWarning
    >
      <AdminSidebar
        agent={agent}
        collapsed={false}
        isMobileOpen={isOpen}
        onClose={onClose}
        onNavigate={onClose}
      />
    </aside>
  );
};

/* ══════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════ */
export function AdminShellClient({ agent, children }: AdminShellClientProps) {
  const t = useTranslations("admin.shell");

  const {
    isMobileOpen,
    isCollapsed,
    setMobileOpen,
    setCollapsed,
    toggleCollapsed,
  } = useSidebarState();

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, [setMobileOpen]);

  const handleMobileMenuOpen = useCallback(() => {
    setMobileOpen(true);
  }, [setMobileOpen]);

  useBodyScrollLock(isMobileOpen);
  useResponsiveSidebar(isMobileOpen, setMobileOpen);
  useKeyboardShortcuts(isMobileOpen, closeMobile, toggleCollapsed);

  const sidebarWidth = useMemo(() => {
    return isCollapsed ? SIDEBAR_WIDTHS.collapsed : SIDEBAR_WIDTHS.expanded;
  }, [isCollapsed]);

  return (
    <AdminToastProvider position="bottom" maxToasts={5}>
      <div
        className="flex h-screen bg-background overflow-hidden text-foreground font-sans selection:bg-primary/30 selection:text-primary-foreground/80"
        suppressHydrationWarning
      >
        <BackgroundGrid />

        <DesktopSidebar
          agent={agent}
          isCollapsed={isCollapsed}
          setCollapsed={setCollapsed}
        />

        <MobileBackdrop isOpen={isMobileOpen} onClose={closeMobile} />
        <MobileDrawer
          agent={agent}
          isOpen={isMobileOpen}
          onClose={closeMobile}
        />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
          <AdminNavbar
            agent={agent}
            sidebarCollapsed={isCollapsed}
            onToggleSidebar={toggleCollapsed}
            onMobileMenuOpen={handleMobileMenuOpen}
          />

          <main
            className="flex-1 overflow-y-auto overflow-x-hidden"
            id="main-content"
            role="main"
            aria-label={t("mainContentLabel")}
          >
            {children}
          </main>
        </div>
      </div>
    </AdminToastProvider>
  );
}
/* ══════════════════════════════════════════════════════
   Error Boundary
══════════════════════════════════════════════════════ */
export class AdminShellErrorBoundary extends React.Component<{ children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("AdminShellClient error:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center h-screen bg-background text-foreground">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground">
                Please refresh the page or contact support.
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}