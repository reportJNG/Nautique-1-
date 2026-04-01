"use client";

import * as React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X, Bell, Volume2, VolumeX } from "lucide-react";
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

const POSITION = {
  bottom: "bottom-5",
  top: "top-5",
  right: "right-5",
  left: "left-5",
} as const;

export type ToastPosition = keyof typeof POSITION;

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
    border: "border-emerald-500/15",
    icon: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    bar: "bg-gradient-to-b from-emerald-400 to-emerald-600",
    progress: "bg-emerald-400/20",
    ring: "focus:ring-emerald-500/40",
  },
  error: {
    border: "border-red-400/15",
    icon: "text-red-400",
    iconBg: "bg-red-500/10",
    bar: "bg-gradient-to-b from-red-400 to-red-600",
    progress: "bg-red-400/20",
    ring: "focus:ring-red-500/40",
  },
  warning: {
    border: "border-amber-500/15",
    icon: "text-amber-400",
    iconBg: "bg-amber-500/10",
    bar: "bg-gradient-to-b from-amber-400 to-amber-600",
    progress: "bg-amber-400/20",
    ring: "focus:ring-amber-500/40",
  },
  info: {
    border: "border-cyan-500/15",
    icon: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    bar: "bg-gradient-to-b from-cyan-400 to-cyan-600",
    progress: "bg-cyan-400/20",
    ring: "focus:ring-cyan-500/40",
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
  const [soundEnabled, setSoundEnabled] = React.useState(enableSound);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Initialize audio if sound is enabled
  React.useEffect(() => {
    if (soundEnabled && typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/toast.mp3");
    }
  }, [soundEnabled]);

  const playSound = React.useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Silently fail if audio can't play
      });
    }
  }, [soundEnabled]);

  const toast = React.useCallback((options: ToastOptions): string => {
    const id = options.id || generateId();
    const duration = options.duration ?? DEFAULT_DURATION;
    const isPersistent = options.isPersistent ?? false;

    setToasts((prev) => {
      const newToast = { ...options, id, duration, isPersistent };
      const updated = [...prev, newToast];
      // Limit number of toasts
      return updated.slice(-maxToasts);
    });

    // Play sound for non-persistent toasts
    if (!isPersistent) {
      playSound();
    }

    // Auto-dismiss timer
    if (!isPersistent && duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
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
  if (toasts.length === 0) return null;

  const positionClasses = cn(
    "fixed z-[9999] flex flex-col gap-2.5 pointer-events-none",
    position === "bottom" && "bottom-5",
    position === "top" && "top-5",
    position === "right" && "right-5",
    position === "left" && "left-5",
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
      aria-label="Notifications"
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
  const [leaving, setLeaving] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = React.useRef<number | null>(null);
  const remainingTimeRef = React.useRef<number>(toast.duration ?? DEFAULT_DURATION);

  const s = STYLES[toast.variant];
  const duration = toast.duration ?? DEFAULT_DURATION;
  const isPersistent = toast.isPersistent ?? false;

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
  }, [isPaused, leaving, isPersistent]);

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

  const handleDismiss = () => {
    if (leaving) return;

    setLeaving(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, ANIMATION_DURATION.exit);
  };

  const handleAction = () => {
    toast.action?.onClick();
    if (!toast.isPersistent) {
      handleDismiss();
    }
  };

  // Animation variants based on position
  const getAnimationClasses = () => {
    const isHorizontal = position === "left" || position === "right";
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
        "bg-[#07111f]/96",
        "shadow-[0_12px_40px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.03)_inset]",
        s.border,
        getAnimationClasses(),
        "duration-250 ease-out",
        leaving && `duration-${ANIMATION_DURATION.exit} ease-in`
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
        <p className="text-[13px] font-bold text-[#f0f9ff] leading-snug">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-[11.5px] text-[#3a5a7a] mt-0.5 leading-relaxed">
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
              "bg-white/5 hover:bg-white/10 transition-colors",
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
        aria-label="Fermer la notification"
        className={cn(
          "flex-shrink-0 mt-0.5 p-1 rounded-lg",
          "text-[#253d56] transition-all duration-150",
          "hover:text-[#e2f0ff] hover:bg-white/8",
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