"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════
   Types & Constants
══════════════════════════════════════════════════════ */
export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  isPersistent?: boolean;
}

export interface ToastOptions extends Omit<Toast, "id"> {
  id?: string;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  update: (id: string, options: Partial<ToastOptions>) => void;
}

/* ══════════════════════════════════════════════════════
   Configuration Constants
══════════════════════════════════════════════════════ */
const DEFAULT_DURATION = 4500;
const ANIMATION_DURATION = {
  enter: 250,
  exit: 220,
} as const;

export type ToastPosition = "bottom" | "top" | "right" | "left";

const POSITION_CLASSES: Record<ToastPosition, string> = {
  bottom: "bottom-5",
  top: "top-5",
  right: "right-5",
  left: "left-5",
};

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4" />,
  error: <XCircle className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
};

const STYLES: Record<ToastVariant, {
  border: string;
  icon: string;
  iconBg: string;
  bar: string;
  progress: string;
  ring: string;
}> = {
  success: {
    border: "border-primary/15",
    icon: "text-primary",
    iconBg: "bg-primary/10",
    bar: "bg-gradient-to-b from-primary to-primary/80",
    progress: "bg-primary/20",
    ring: "focus:ring-primary/40",
  },
  error: {
    border: "border-destructive/15",
    icon: "text-destructive",
    iconBg: "bg-destructive/10",
    bar: "bg-gradient-to-b from-destructive to-destructive/80",
    progress: "bg-destructive/20",
    ring: "focus:ring-destructive/40",
  },
  warning: {
    border: "border-accent/15",
    icon: "text-accent",
    iconBg: "bg-accent/10",
    bar: "bg-gradient-to-b from-accent to-accent/80",
    progress: "bg-accent/20",
    ring: "focus:ring-accent/40",
  },
  info: {
    border: "border-primary/15",
    icon: "text-primary",
    iconBg: "bg-primary/10",
    bar: "bg-gradient-to-b from-primary to-primary/80",
    progress: "bg-primary/20",
    ring: "focus:ring-primary/40",
  },
};

/* ══════════════════════════════════════════════════════
   Utility Functions
══════════════════════════════════════════════════════ */
const generateId = () => {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

/* ══════════════════════════════════════════════════════
   Context & Provider
══════════════════════════════════════════════════════ */
const ToastContext = React.createContext<ToastContextValue | null>(null);

interface AdminToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
  enableSound?: boolean;
}

export function AdminToastProvider({
  children,
  position = "bottom",
  maxToasts = 5,
  enableSound = false,
}: AdminToastProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Initialize audio if sound is enabled
  React.useEffect(() => {
    if (enableSound && typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/toast.mp3");
    }
  }, [enableSound]);

  const playSound = React.useCallback(() => {
    if (enableSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Silently fail if audio can't play
      });
    }
  }, [enableSound]);

  const toast = React.useCallback((options: ToastOptions): string => {
    const id = options.id || generateId();
    const isPersistent = options.isPersistent ?? false;

    setToasts((prev) => {
      const newToast = {
        ...options,
        id,
        duration: options.duration ?? DEFAULT_DURATION,
        isPersistent,
      };
      const updated = [...prev, newToast];
      // Limit number of toasts
      return updated.slice(-maxToasts);
    });

    // Play sound for non-persistent toasts
    if (!isPersistent) {
      playSound();
    }

    return id;
  }, [maxToasts, playSound]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => {
      const toastToDismiss = prev.find(t => t.id === id);
      if (toastToDismiss?.onDismiss) {
        toastToDismiss.onDismiss();
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const dismissAll = React.useCallback(() => {
    setToasts((prev) => {
      prev.forEach(toast => toast.onDismiss?.());
      return [];
    });
  }, []);

  const update = React.useCallback((id: string, options: Partial<ToastOptions>) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, ...options } : toast
      )
    );
  }, []);

  const value = React.useMemo(() => ({
    toasts,
    toast,
    dismiss,
    dismissAll,
    update,
  }), [toasts, toast, dismiss, dismissAll, update]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastRegion
        toasts={toasts}
        onDismiss={dismiss}
        position={position}
      />
    </ToastContext.Provider>
  );
}

/* ══════════════════════════════════════════════════════
   Hook with optional context check
══════════════════════════════════════════════════════ */
export function useAdminToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useAdminToast must be used inside AdminToastProvider");
  }
  return ctx;
}

/* ══════════════════════════════════════════════════════
   Toast Region
══════════════════════════════════════════════════════ */
interface ToastRegionProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position: ToastPosition;
}

function ToastRegion({ toasts, onDismiss, position }: ToastRegionProps) {
  const t = useTranslations("common.ui");
  if (toasts.length === 0) return null;

  const positionClasses = cn(
    "fixed z-[9999] flex flex-col gap-2.5 pointer-events-none",
    POSITION_CLASSES[position],
    // Center alignment for top/bottom
    (position === "top" || position === "bottom") && "left-1/2 -translate-x-1/2",
    // Width based on position
    (position === "left" || position === "right") && "w-[360px] max-w-[calc(100vw-24px)]",
    (position === "top" || position === "bottom") && "w-[400px] max-w-[calc(100vw-48px)]"
  );

  return (
    <div
      className={positionClasses}
      role="region"
      aria-label={t("notificationRegion")}
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          position={position}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Individual Toast Component
══════════════════════════════════════════════════════ */
interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  position: ToastPosition;
}

function ToastItem({ toast, onDismiss, position }: ToastItemProps) {
  const t = useTranslations("common.ui");
  const [leaving, setLeaving] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = React.useRef<number | null>(null);
  const remainingTimeRef = React.useRef<number>(toast.duration ?? DEFAULT_DURATION);

  const s = STYLES[toast.variant];
  const duration = toast.duration ?? DEFAULT_DURATION;
  const isPersistent = toast.isPersistent ?? false;

  const handleDismiss = React.useCallback(() => {
    setLeaving((current) => {
      if (current) return current;

      setTimeout(() => {
        onDismiss(toast.id);
      }, ANIMATION_DURATION.exit);

      return true;
    });
  }, [onDismiss, toast.id]);

  // Handle auto-dismiss with pause on hover
  React.useEffect(() => {
    if (isPersistent || leaving) return;

    const startTimer = (remaining: number) => {
      startTimeRef.current = Date.now();
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, remaining);
    };

    if (!isPaused) {
      startTimer(remainingTimeRef.current);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleDismiss, isPaused, leaving, isPersistent]);

  const handleMouseEnter = () => {
    if (!isPersistent && !leaving) {
      // Pause timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      }
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPersistent && !leaving && remainingTimeRef.current > 0) {
      setIsPaused(false);
    }
  };

  const handleAction = () => {
    toast.action?.onClick();
    if (!toast.isPersistent) {
      handleDismiss();
    }
  };

  // Animation variants based on position
  const getAnimationClasses = () => {
    const isRight = position === "right";
    const isLeft = position === "left";
    const isTop = position === "top";
    const isBottom = position === "bottom";

    if (leaving) {
      if (isRight) return "animate-out slide-out-to-right-6 fade-out";
      if (isLeft) return "animate-out slide-out-to-left-6 fade-out";
      if (isTop) return "animate-out slide-out-to-top-6 fade-out";
      if (isBottom) return "animate-out slide-out-to-bottom-6 fade-out";
      return "animate-out fade-out";
    }

    if (isRight) return "animate-in slide-in-from-right-6 fade-in";
    if (isLeft) return "animate-in slide-in-from-left-6 fade-in";
    if (isTop) return "animate-in slide-in-from-top-6 fade-in";
    if (isBottom) return "animate-in slide-in-from-bottom-6 fade-in";
    return "animate-in fade-in";
  };

  return (
    <div
      role="alert"
      aria-atomic="true"
      className={cn(
        "relative pointer-events-auto rounded-2xl border backdrop-blur-2xl",
        "p-3.5 pl-[14px] pr-3 flex items-start gap-3 overflow-hidden",
        "bg-card/96",
        "shadow-[0_12px_40px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.03)_inset]",
        s.border,
        getAnimationClasses(),
        "duration-250 ease-out",
        leaving && "ease-in"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Left accent bar */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl", s.bar)} />

      {/* Progress bar - only for non-persistent toasts */}
      {!isPersistent && !leaving && (
        <div
          className={cn(
            "absolute bottom-0 left-[3px] right-0 h-[2px] origin-left",
            s.progress
          )}
          style={{
            animation: `toast-drain ${duration}ms linear forwards`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        />
      )}

      {/* Icon */}
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
        s.iconBg, s.icon
      )}>
        {ICONS[toast.variant]}
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[13px] font-bold text-foreground leading-snug">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">
            {toast.description}
          </p>
        )}

        {/* Action Button */}
        {toast.action && (
          <button
            type="button"
            onClick={handleAction}
            className={cn(
              "mt-2 text-[11px] font-medium px-2 py-1 rounded-lg",
              "bg-muted/50 hover:bg-muted/70 transition-colors",
              "focus:outline-none focus:ring-2",
              s.ring
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t("closeNotification")}
        className={cn(
          "flex-shrink-0 mt-0.5 p-1 rounded-lg",
          "text-muted-foreground/70 transition-all duration-150",
          "hover:text-foreground hover:bg-muted/50",
          "focus:outline-none focus:ring-2",
          s.ring,
          "active:scale-90"
        )}
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Keyframe animation styles */}
      <style jsx>{`
        @keyframes toast-drain {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Helper Functions for Common Toast Types
══════════════════════════════════════════════════════ */
export const toastHelpers = {
  success: (title: string, options?: Partial<ToastOptions>) => ({
    title,
    variant: "success" as const,
    ...options,
  }),

  error: (title: string, options?: Partial<ToastOptions>) => ({
    title,
    variant: "error" as const,
    ...options,
  }),

  warning: (title: string, options?: Partial<ToastOptions>) => ({
    title,
    variant: "warning" as const,
    ...options,
  }),

  info: (title: string, options?: Partial<ToastOptions>) => ({
    title,
    variant: "info" as const,
    ...options,
  }),
};

/* ══════════════════════════════════════════════════════
   Optional: ToastContainer for manual rendering
══════════════════════════════════════════════════════ */
interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: ToastPosition;
}

export function ToastContainer({
  toasts,
  onDismiss,
  position = "bottom"
}: ToastContainerProps) {
  return (
    <ToastRegion
      toasts={toasts}
      onDismiss={onDismiss}
      position={position}
    />
  );
}
