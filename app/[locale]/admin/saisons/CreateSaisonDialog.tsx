"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Lock,
  Plus,
  Shield,
  X,
} from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createSaisonSchema,
  dateInputToUtcDate,
  isValidDateInput,
  type CreateSaisonInput,
  type CreateSaisonSchemaMessages,
  type SaisonStatusValue,
} from "@/lib/validators/saison";
import { createSaison } from "./actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CreateSaisonDialogProps = {
  locale: string;
  defaultStatus: SaisonStatusValue;
  hasOpenSeason: boolean;
  openSeasonDesignation?: string | null;
};

type FormErrors = Partial<Record<keyof CreateSaisonInput, string>>;

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  PRE: {
    icon: Clock3,
    label: "Pre-season",
    description:
      "The season is being prepared. Registrations are not yet accessible.",
    pillStyle: {
      background: "#EEEDFE",
      color: "#3C3489",
    },
    accentColor: "#AFA9EC",
  },
  OUV: {
    icon: CheckCircle2,
    label: "Open",
    description:
      "The season is active. Registrations and matches are in progress.",
    pillStyle: {
      background: "#E1F5EE",
      color: "#085041",
    },
    accentColor: "#9FE1CB",
  },
  FER: {
    icon: Shield,
    label: "Closed",
    description:
      "The season has ended. Data is read-only; no further changes accepted.",
    pillStyle: {
      background: "#F1EFE8",
      color: "#444441",
    },
    accentColor: "#D3D1C7",
  },
  CLO: {
    icon: Lock,
    label: "Locked",
    description:
      "The season is archived and fully locked. Contact support to unlock.",
    pillStyle: {
      background: "#FCEBEB",
      color: "#791F1F",
    },
    accentColor: "#F7C1C1",
  },
} satisfies Record<
  SaisonStatusValue,
  {
    icon: React.ElementType;
    label: string;
    description: string;
    pillStyle: React.CSSProperties;
    accentColor: string;
  }
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDateLocale(locale: string) {
  if (locale === "en") return "en-US";
  if (locale === "ar") return "ar-DZ";
  return "fr-FR";
}

function formatDateShort(value: string, locale: string) {
  if (!isValidDateInput(value)) return null;
  return new Intl.DateTimeFormat(getDateLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateInputToUtcDate(value));
}

function buildValidationMessages(
  t: ReturnType<typeof useTranslations>,
): CreateSaisonSchemaMessages {
  return {
    designationRequired: t("designationRequired"),
    designationMin: t("designationMin"),
    designationMax: t("designationMax"),
    dateDebutRequired: t("dateDebutRequired"),
    dateFinRequired: t("dateFinRequired"),
    invalidDate: t("invalidDate"),
    endBeforeStart: t("endBeforeStart"),
    statusRequired: t("statusRequired"),
  };
}

function buildDefaultValues(
  defaultStatus: SaisonStatusValue,
): CreateSaisonInput {
  return {
    designation: "",
    dateDebut: "",
    dateFin: "",
    statut: defaultStatus,
  };
}

// ---------------------------------------------------------------------------
// CharRing — SVG progress ring for character count
// ---------------------------------------------------------------------------

function CharRing({ count, max }: { count: number; max: number }) {
  const r = 9;
  const circ = 2 * Math.PI * r;
  const filled = circ * Math.min(count / max, 1);
  const isNearLimit = count / max >= 0.85;

  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
      <circle
        cx="11"
        cy="11"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-border"
        opacity={0.3}
      />
      <circle
        cx="11"
        cy="11"
        r={r}
        fill="none"
        stroke={isNearLimit ? "#E24B4A" : "#534AB7"}
        strokeWidth="2"
        strokeDasharray={`${filled.toFixed(1)} ${circ.toFixed(1)}`}
        strokeLinecap="round"
        transform="rotate(-90 11 11)"
        style={{ transition: "stroke-dasharray 0.18s ease" }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PreviewStrip
// ---------------------------------------------------------------------------

function PreviewStrip({
  designation,
  dateDebut,
  dateFin,
  statut,
  locale,
}: {
  designation: string;
  dateDebut: string;
  dateFin: string;
  statut: SaisonStatusValue;
  locale: string;
}) {
  const startFmt = formatDateShort(dateDebut, locale);
  const endFmt = formatDateShort(dateFin, locale);
  const cfg = STATUS_CONFIG[statut];

  return (
    <div className="flex shrink-0 items-center gap-0 overflow-hidden border-b border-border/30 bg-muted/30 px-6 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Designation
        </span>
        <span className="truncate text-[13px] font-medium text-foreground">
          {designation.trim() || "—"}
        </span>
      </div>

      <div className="mx-4 h-8 w-px shrink-0 bg-border/40" />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Period
        </span>
        <span className="truncate text-[13px] font-medium text-foreground">
          {startFmt && endFmt ? `${startFmt} → ${endFmt}` : "—"}
        </span>
      </div>

      <div className="mx-4 h-8 w-px shrink-0 bg-border/40" />

      <div className="flex shrink-0 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Status
        </span>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          style={cfg.pillStyle}
        >
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SegmentedControl
// ---------------------------------------------------------------------------

function SegmentedControl({
  value,
  onChange,
}: {
  value: SaisonStatusValue;
  onChange: (v: SaisonStatusValue) => void;
}) {
  const options = Object.entries(STATUS_CONFIG) as [
    SaisonStatusValue,
    (typeof STATUS_CONFIG)[SaisonStatusValue],
  ][];

  return (
    <div className="flex rounded-full border border-border/50 bg-muted/40 p-1 gap-1">
      {options.map(([val, cfg]) => {
        const Icon = cfg.icon;
        const active = value === val;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium transition-all duration-150",
              active
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/30"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                active ? "opacity-100" : "opacity-60",
              )}
            />
            <span className="hidden sm:inline">{cfg.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatusInfo
// ---------------------------------------------------------------------------

function StatusInfo({ statut }: { statut: SaisonStatusValue }) {
  const cfg = STATUS_CONFIG[statut];
  const Icon = cfg.icon;

  return (
    <div
      className="mt-3 flex items-start gap-3 rounded-lg border-l-[3px] bg-muted/20 px-4 py-3"
      style={{ borderLeftColor: cfg.accentColor }}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-[12px] font-medium text-foreground">{cfg.label}</p>
        <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
          {cfg.description}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FieldError
// ---------------------------------------------------------------------------

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-[11px] font-medium text-destructive">{message}</p>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CreateSaisonDialog({
  locale,
  defaultStatus,
  hasOpenSeason,
  openSeasonDesignation,
}: CreateSaisonDialogProps) {
  const router = useRouter();
  const t = useTranslations("admin.saisonsUi");
  const validationT = useTranslations("admin.saisonsUi.form.validation");
  const { toast } = useAdminToast();

  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [values, setValues] = React.useState<CreateSaisonInput>(() =>
    buildDefaultValues(defaultStatus),
  );
  const [errors, setErrors] = React.useState<FormErrors>({});

  const validationMessages = React.useMemo(
    () => buildValidationMessages(validationT),
    [validationT],
  );
  const schema = React.useMemo(
    () => createSaisonSchema(validationMessages),
    [validationMessages],
  );

  const charCount = values.designation.length;

  const resetForm = React.useCallback(() => {
    setValues(buildDefaultValues(defaultStatus));
    setErrors({});
  }, [defaultStatus]);

  const handleClose = React.useCallback(() => {
    if (submitting) return;
    setOpen(false);
    setTimeout(resetForm, 300);
  }, [submitting, resetForm]);

  const handleFieldChange = React.useCallback(
    <K extends keyof CreateSaisonInput>(
      field: K,
      value: CreateSaisonInput[K],
    ) => {
      setValues((cur) => ({ ...cur, [field]: value }));
      setErrors((cur) => {
        if (!cur[field]) return cur;
        return { ...cur, [field]: undefined };
      });
    },
    [],
  );

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const parsed = schema.safeParse(values);
      if (!parsed.success) {
        const flattened = parsed.error.flatten().fieldErrors;
        const nextErrors = Object.fromEntries(
          Object.entries(flattened)
            .map(([field, msgs]) => [field, msgs?.[0]])
            .filter((entry): entry is [string, string] => Boolean(entry[1])),
        ) as FormErrors;
        setErrors(nextErrors);
        toast({
          variant: "error",
          title: t("form.toasts.validationTitle"),
          description: t("form.toasts.validationDescription"),
        });
        return;
      }

      setSubmitting(true);
      setErrors({});

      const result = await createSaison(locale, parsed.data);
      setSubmitting(false);

      if (!result.success) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        toast({
          variant: "error",
          title: t("form.toasts.errorTitle"),
          description: result.error,
        });
        return;
      }

      toast({
        variant: "success",
        title: t("form.toasts.successTitle"),
        description: t("form.toasts.successDescription"),
      });

      handleClose();
      React.startTransition(() => router.refresh());
    },
    [handleClose, locale, router, schema, t, toast, values],
  );

  // Trap focus + close on Escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  // Prevent body scroll while open
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Trigger */}
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95"
      >
        <Plus className="h-4 w-4" />
        {t("newButton")}
      </Button>

      {/* Overlay + Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={t("form.title")}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={handleClose}
            aria-hidden
          />

          {/* Drawer panel */}
          <div
            className={cn(
              "relative z-10 flex h-full w-full flex-col bg-background shadow-2xl",
              "sm:w-[480px] sm:border-l sm:border-border/40",
              "animate-in slide-in-from-right duration-300",
            )}
          >
            {/* ── Header ─────────────────────────────────────── */}
            <div className="shrink-0 border-b border-border/30 px-6 py-5">
              {/* Admin badge row */}
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Admin only
                </span>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  aria-label="Close"
                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-full border border-border/40 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Title with left accent */}
              <div className="flex items-start gap-3">
                <div className="mt-1 h-6 w-0.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <h2 className="text-xl font-semibold leading-tight text-foreground">
                    {t("form.title")}
                  </h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {t("form.description")}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Live preview strip ──────────────────────────── */}
            <PreviewStrip
              designation={values.designation}
              dateDebut={values.dateDebut}
              dateFin={values.dateFin}
              statut={values.statut}
              locale={locale}
            />

            {/* ── Scrollable body ─────────────────────────────── */}
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
              noValidate
            >
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* Section: Identity */}
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Identity
                </p>

                {/* Designation */}
                <div className="mb-5">
                  <Label
                    htmlFor="designation"
                    className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-muted-foreground"
                  >
                    <span>
                      Designation{" "}
                      <span className="text-destructive" aria-hidden>
                        *
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <CharRing count={charCount} max={80} />
                      <span
                        className={cn(
                          "text-[11px]",
                          charCount / 80 >= 0.85
                            ? "text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        {charCount} / 80
                      </span>
                    </span>
                  </Label>
                  <Input
                    id="designation"
                    value={values.designation}
                    onChange={(e) =>
                      handleFieldChange("designation", e.target.value)
                    }
                    placeholder={t("form.placeholders.designation")}
                    maxLength={80}
                    className={cn(
                      "h-10 rounded-lg border-border/50 bg-background text-[13px] placeholder:text-muted-foreground/50 focus-visible:ring-primary/30",
                      errors.designation && "border-destructive/60",
                    )}
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {t("form.hints.designation")}
                  </p>
                  <FieldError message={errors.designation} />
                </div>

                {/* Date range */}
                <div className="mb-5">
                  <Label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
                    Date range{" "}
                    <span className="text-destructive" aria-hidden>
                      *
                    </span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        id="dateDebut"
                        type="date"
                        value={values.dateDebut}
                        onChange={(e) =>
                          handleFieldChange("dateDebut", e.target.value)
                        }
                        className={cn(
                          "h-10 rounded-lg border-border/50 bg-background text-[13px] focus-visible:ring-primary/30",
                          errors.dateDebut && "border-destructive/60",
                        )}
                      />
                      <FieldError message={errors.dateDebut} />
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                    <div className="flex-1">
                      <Input
                        id="dateFin"
                        type="date"
                        value={values.dateFin}
                        onChange={(e) =>
                          handleFieldChange("dateFin", e.target.value)
                        }
                        className={cn(
                          "h-10 rounded-lg border-border/50 bg-background text-[13px] focus-visible:ring-primary/30",
                          errors.dateFin && "border-destructive/60",
                        )}
                      />
                      <FieldError message={errors.dateFin} />
                    </div>
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {t("form.hints.dateRange")}
                  </p>
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-border/30" />

                {/* Section: Status */}
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Status
                </p>

                <SegmentedControl
                  value={values.statut}
                  onChange={(v) => handleFieldChange("statut", v)}
                />

                <FieldError message={errors.statut} />

                <StatusInfo statut={values.statut} />

                {/* Open season warning */}
                {hasOpenSeason && values.statut === "OUV" && (
                  <div className="mt-4 flex items-start gap-3 border-l-[3px] border-amber-400 py-3 pl-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-[12px] font-medium text-foreground">
                        {t("form.notes.openSeasonTitle")}
                      </p>
                      <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
                        {t("form.notes.openSeasonDescription", {
                          designation:
                            openSeasonDesignation ??
                            t("form.notes.anotherSeason"),
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin note */}
                <div className="mt-5 flex items-start gap-3 rounded-lg bg-muted/30 px-4 py-3">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-[12px] font-medium text-foreground">
                      {t("form.notes.adminTitle")}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
                      {t("form.notes.adminDescription")}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Footer ─────────────────────────────────────── */}
              <div className="shrink-0 border-t border-border/30 bg-background px-6 py-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                    className="text-[13px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    {t("form.actions.cancel")}
                  </button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-10 rounded-lg bg-primary text-[13px] font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting
                      ? t("form.actions.submitting")
                      : t("form.actions.submit")}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
