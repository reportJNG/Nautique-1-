"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  AlertTriangle,
  ArrowRight,
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

type CreateSaisonDialogProps = {
  locale: string;
  defaultStatus: SaisonStatusValue;
  hasOpenSeason: boolean;
  openSeasonDesignation?: string | null;
};

type FormErrors = Partial<Record<keyof CreateSaisonInput, string>>;

const STATUS_CONFIG = {
  PRE: {
    icon: Clock3,
    pillStyle: {
      background: "#EEEDFE",
      color: "#3C3489",
    },
    accentColor: "#AFA9EC",
  },
  OUV: {
    icon: CheckCircle2,
    pillStyle: {
      background: "#E1F5EE",
      color: "#085041",
    },
    accentColor: "#9FE1CB",
  },
  FER: {
    icon: Shield,
    pillStyle: {
      background: "#F1EFE8",
      color: "#444441",
    },
    accentColor: "#D3D1C7",
  },
  CLO: {
    icon: Lock,
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
    pillStyle: React.CSSProperties;
    accentColor: string;
  }
>;

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

function PreviewStrip({
  designation,
  dateDebut,
  dateFin,
  statut,
  locale,
  statusLabel,
  designationLabel,
  rangeLabel,
  statusTextLabel,
  emptyDesignation,
}: {
  designation: string;
  dateDebut: string;
  dateFin: string;
  statut: SaisonStatusValue;
  locale: string;
  statusLabel: string;
  designationLabel: string;
  rangeLabel: string;
  statusTextLabel: string;
  emptyDesignation: string;
}) {
  const startFmt = formatDateShort(dateDebut, locale);
  const endFmt = formatDateShort(dateFin, locale);
  const cfg = STATUS_CONFIG[statut];

  return (
    <div className="flex shrink-0 items-center gap-0 overflow-hidden border-b border-border/30 bg-muted/30 px-6 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {designationLabel}
        </span>
        <span className="truncate text-[13px] font-medium text-foreground">
          {designation.trim() || emptyDesignation}
        </span>
      </div>

      <div className="mx-4 h-8 w-px shrink-0 bg-border/40" />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {rangeLabel}
        </span>
        {startFmt && endFmt ? (
          <span className="inline-flex items-center gap-1.5 truncate text-[13px] font-medium text-foreground">
            <span className="truncate">{startFmt}</span>
            <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="truncate">{endFmt}</span>
          </span>
        ) : (
          <span className="truncate text-[13px] font-medium text-muted-foreground">
            -
          </span>
        )}
      </div>

      <div className="mx-4 h-8 w-px shrink-0 bg-border/40" />

      <div className="flex shrink-0 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {statusTextLabel}
        </span>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          style={cfg.pillStyle}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

function SegmentedControl({
  value,
  onChange,
  getStatusLabel,
}: {
  value: SaisonStatusValue;
  onChange: (value: SaisonStatusValue) => void;
  getStatusLabel: (status: SaisonStatusValue) => string;
}) {
  const options = Object.entries(STATUS_CONFIG) as [
    SaisonStatusValue,
    (typeof STATUS_CONFIG)[SaisonStatusValue],
  ][];

  return (
    <div className="flex gap-1 rounded-full border border-border/50 bg-muted/40 p-1">
      {options.map(([status, cfg]) => {
        const Icon = cfg.icon;
        const active = value === status;

        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium transition-all duration-150",
              active
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/30"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                active ? "opacity-100" : "opacity-60",
              )}
            />
            <span className="hidden sm:inline">{getStatusLabel(status)}</span>
          </button>
        );
      })}
    </div>
  );
}

function StatusInfo({
  statut,
  label,
  description,
}: {
  statut: SaisonStatusValue;
  label: string;
  description: string;
}) {
  const cfg = STATUS_CONFIG[statut];
  const Icon = cfg.icon;

  return (
    <div
      className="mt-3 flex items-start gap-3 rounded-lg border-l-[3px] bg-muted/20 px-4 py-3"
      style={{ borderLeftColor: cfg.accentColor }}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-[12px] font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1.5 text-[11px] font-medium text-destructive">{message}</p>
  );
}

export function CreateSaisonDialog({
  locale,
  defaultStatus,
  hasOpenSeason,
  openSeasonDesignation,
}: CreateSaisonDialogProps) {
  const router = useRouter();
  const t = useTranslations("admin.saisonsUi");
  const statusT = useTranslations("admin.saisonStatus");
  const uiT = useTranslations("common.ui");
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
  const activeStatusLabel = statusT(values.statut);
  const activeStatusDescription = t(
    `form.statusOptions.${values.statut}.description`,
  );
  const openSeasonLabel =
    openSeasonDesignation?.trim() || t("form.notes.anotherSeason");
  const openSeasonConflict = hasOpenSeason && values.statut === "OUV";

  const resetForm = React.useCallback(() => {
    setValues(buildDefaultValues(defaultStatus));
    setErrors({});
  }, [defaultStatus]);

  const handleClose = React.useCallback(() => {
    if (submitting) return;
    setOpen(false);
    setTimeout(resetForm, 300);
  }, [resetForm, submitting]);

  const handleFieldChange = React.useCallback(
    <K extends keyof CreateSaisonInput>(
      field: K,
      value: CreateSaisonInput[K],
    ) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => {
        if (!current[field]) return current;
        return { ...current, [field]: undefined };
      });
    },
    [],
  );

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const parsed = schema.safeParse(values);

      if (!parsed.success) {
        const flattened = parsed.error.flatten().fieldErrors;
        const nextErrors = Object.fromEntries(
          Object.entries(flattened)
            .map(([field, messages]) => [field, messages?.[0]])
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

      if (openSeasonConflict) {
        const conflictMessage = t("form.feedback.openSeasonExists", {
          designation: openSeasonLabel,
        });

        setErrors((current) => ({ ...current, statut: conflictMessage }));
        toast({
          variant: "error",
          title: t("form.toasts.errorTitle"),
          description: conflictMessage,
        });
        return;
      }

      setSubmitting(true);
      setErrors({});

      const result = await createSaison(locale, parsed.data);

      setSubmitting(false);

      if (!result.success) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }

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
    [
      handleClose,
      locale,
      openSeasonConflict,
      openSeasonLabel,
      router,
      schema,
      t,
      toast,
      values,
    ],
  );

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleClose, open]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const getStatusLabel = React.useCallback(
    (status: SaisonStatusValue) => statusT(status),
    [statusT],
  );

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95"
      >
        <Plus className="h-4 w-4" />
        {t("newButton")}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={t("form.title")}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={handleClose}
            aria-hidden
          />

          <div
            className={cn(
              "relative z-10 flex h-full w-full flex-col bg-background shadow-2xl",
              "animate-in slide-in-from-right duration-300",
              "sm:w-[480px] sm:border-l sm:border-border/40",
            )}
          >
            <div className="shrink-0 border-b border-border/30 px-6 py-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  {t("form.adminOnlyBadge")}
                </span>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  aria-label={uiT("close")}
                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-full border border-border/40 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

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

            <PreviewStrip
              designation={values.designation}
              dateDebut={values.dateDebut}
              dateFin={values.dateFin}
              statut={values.statut}
              locale={locale}
              statusLabel={activeStatusLabel}
              designationLabel={t("form.preview.designationLabel")}
              rangeLabel={t("form.preview.rangeLabel")}
              statusTextLabel={t("form.preview.statusLabel")}
              emptyDesignation={t("form.preview.emptyDesignation")}
            />

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
              noValidate
            >
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("form.sections.identity")}
                </p>

                <div className="mb-5">
                  <Label
                    htmlFor="designation"
                    className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-muted-foreground"
                  >
                    <span>
                      {t("form.fields.designation")}{" "}
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
                    onChange={(event) =>
                      handleFieldChange("designation", event.target.value)
                    }
                    placeholder={t("form.placeholders.designation")}
                    maxLength={80}
                    aria-invalid={Boolean(errors.designation)}
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

                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label
                        htmlFor="dateDebut"
                        className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                      >
                        {t("form.fields.dateDebut")}
                      </Label>
                      <Input
                        id="dateDebut"
                        type="date"
                        value={values.dateDebut}
                        onChange={(event) =>
                          handleFieldChange("dateDebut", event.target.value)
                        }
                        aria-invalid={Boolean(errors.dateDebut)}
                        className={cn(
                          "h-10 rounded-lg border-border/50 bg-background text-[13px] focus-visible:ring-primary/30",
                          errors.dateDebut && "border-destructive/60",
                        )}
                      />
                      <FieldError message={errors.dateDebut} />
                    </div>

                    <ArrowRight className="mt-7 h-4 w-4 shrink-0 text-muted-foreground/50" />

                    <div className="flex-1">
                      <Label
                        htmlFor="dateFin"
                        className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                      >
                        {t("form.fields.dateFin")}
                      </Label>
                      <Input
                        id="dateFin"
                        type="date"
                        value={values.dateFin}
                        min={values.dateDebut || undefined}
                        onChange={(event) =>
                          handleFieldChange("dateFin", event.target.value)
                        }
                        aria-invalid={Boolean(errors.dateFin)}
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

                <div className="my-6 border-t border-border/30" />

                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("form.sections.status")}
                </p>

                <SegmentedControl
                  value={values.statut}
                  onChange={(status) => handleFieldChange("statut", status)}
                  getStatusLabel={getStatusLabel}
                />

                <FieldError message={errors.statut} />

                <StatusInfo
                  statut={values.statut}
                  label={activeStatusLabel}
                  description={activeStatusDescription}
                />

                {hasOpenSeason && values.statut === "OUV" && (
                  <div className="mt-4 flex items-start gap-3 border-l-[3px] border-amber-400 py-3 pl-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-[12px] font-medium text-foreground">
                        {t("form.notes.openSeasonTitle")}
                      </p>
                      <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
                        {t("form.notes.openSeasonDescription", {
                          designation: openSeasonLabel,
                        })}
                      </p>
                    </div>
                  </div>
                )}

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
                    className="h-10 flex-1 rounded-lg bg-primary text-[13px] font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
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
