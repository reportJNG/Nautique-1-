"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({
  currentStep,
  items,
  progressLabel,
  stepLabel,
}: {
  currentStep: number;
  items: string[];
  progressLabel: string;
  stepLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span>{progressLabel}</span>
        <span>{stepLabel}</span>
      </div>

      <div className="flex items-center gap-3">
        {items.map((label, index) => {
          const stepNumber = index + 1;
          const completed = stepNumber < currentStep;
          const active = stepNumber === currentStep;

          return (
            <div key={label} className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all",
                  completed || active
                    ? "border-cyan-500 bg-cyan-500 text-white"
                    : "border-border/70 bg-background text-muted-foreground",
                )}
              >
                {completed ? <Check className="size-4" /> : stepNumber}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {label}
                </p>
              </div>
              {stepNumber < items.length ? (
                <div
                  className={cn(
                    "h-px flex-1 transition-colors",
                    completed ? "bg-cyan-400" : "bg-border/70",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
        <Icon className="size-4" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function SelectionGroupLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      {label}
    </p>
  );
}

export function BeneficiaryCard({
  active,
  icon: Icon,
  title,
  subtitle,
  onSelect,
  children,
}: {
  active: boolean;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "rounded-[28px] border p-5 text-left transition-all",
        active
          ? "border-cyan-300 bg-white shadow-[0_16px_40px_rgba(8,145,178,0.12)] dark:border-cyan-900/60 dark:bg-slate-950/70"
          : "border-border/50 bg-background/70 hover:border-cyan-200 hover:bg-white dark:hover:border-cyan-900/60 dark:hover:bg-slate-950/60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
            <Icon className="size-4" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-full border transition-all",
            active
              ? "border-cyan-500 bg-cyan-500 text-white"
              : "border-border/70 bg-background text-transparent",
          )}
        >
          <Check className="size-4" />
        </span>
      </div>

      <div className="mt-4">{children}</div>
    </motion.div>
  );
}

export function SelectionCard({
  active,
  disabled = false,
  title,
  description,
  onClick,
  tag,
}: {
  active: boolean;
  disabled?: boolean;
  title: string;
  description: string;
  onClick: () => void;
  tag?: { label: string; tone: "green" | "muted" | "cyan" };
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-[28px] border p-4 text-left transition-all",
        active
          ? "border-cyan-300 bg-white shadow-[0_12px_34px_rgba(8,145,178,0.12)] dark:border-cyan-900/60 dark:bg-slate-950/70"
          : "border-border/50 bg-background/70",
        !active &&
          !disabled &&
          "hover:border-cyan-200 hover:bg-white dark:hover:border-cyan-900/60 dark:hover:bg-slate-950/60",
        disabled &&
          "cursor-not-allowed opacity-60 hover:border-border/50 hover:bg-background/70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {tag ? <StatusTag tone={tag.tone} label={tag.label} /> : null}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <span
          className={cn(
            "mt-0.5 inline-flex size-6 items-center justify-center rounded-full border transition-all",
            active
              ? "border-cyan-500 bg-cyan-500 text-white"
              : "border-border/70 bg-background text-transparent",
          )}
        >
          <Check className="size-3.5" />
        </span>
      </div>
    </button>
  );
}

export function TypeCard({
  active,
  title,
  description,
  amount,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  amount: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[28px] border p-5 text-left transition-all",
        active
          ? "border-cyan-300 bg-white shadow-[0_16px_40px_rgba(8,145,178,0.14)] dark:border-cyan-900/60 dark:bg-slate-950/70"
          : "border-border/50 bg-background/70 hover:border-cyan-200 hover:bg-white dark:hover:border-cyan-900/60 dark:hover:bg-slate-950/60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-4">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-2xl transition-all",
              active
                ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300"
                : "bg-slate-100 text-slate-700 dark:bg-slate-900/70 dark:text-slate-300",
            )}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
            {amount}
          </p>
        </div>

        <span
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-full border transition-all",
            active
              ? "border-cyan-500 bg-cyan-500 text-white"
              : "border-border/70 bg-background text-transparent",
          )}
        >
          <Check className="size-4" />
        </span>
      </div>
    </button>
  );
}

export function ScheduleSlotButton({
  checked,
  time,
  group,
  onClick,
}: {
  checked: boolean;
  time: string;
  group: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-[22px] border p-3 text-left transition-all",
        checked
          ? "border-cyan-500 bg-cyan-500 text-white shadow-sm"
          : "border-border/50 bg-background/70 hover:border-cyan-200 hover:bg-cyan-50/40 dark:hover:border-cyan-900/60 dark:hover:bg-cyan-950/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{time}</p>
          <p
            className={cn(
              "mt-1 text-xs",
              checked ? "text-cyan-50/90" : "text-muted-foreground",
            )}
          >
            {group}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex size-5 shrink-0 items-center justify-center rounded-full border",
            checked
              ? "border-white/60 bg-white/15 text-white"
              : "border-border/60 text-transparent",
          )}
        >
          <Check className="size-3" />
        </span>
      </div>
    </button>
  );
}

export function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[24px] border border-border/50 bg-background/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function InlineChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-800 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-200">
      {label}
    </span>
  );
}

function StatusTag({
  tone,
  label,
}: {
  tone: "green" | "muted" | "cyan";
  label: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        tone === "green" &&
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
        tone === "muted" &&
          "bg-slate-100 text-slate-500 dark:bg-slate-900/70 dark:text-slate-400",
        tone === "cyan" &&
          "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300",
      )}
    >
      {label}
    </span>
  );
}
