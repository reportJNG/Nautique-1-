"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  AlertTriangle,
  Plus,
  Shield,
  X,
} from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDayKey } from "@/lib/creneaux";
import { cn } from "@/lib/utils";
import {
  createCreneauSchema,
  isValidTimeInput,
  timeInputToUtcDate,
  type CreateCreneauInput,
  type CreateCreneauSchemaMessages,
} from "@/lib/validators/creneau";
import { createCreneau } from "./actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CreateCreneauDialogProps = {
  locale: string;
  oneBasedWeek: boolean;
  saisons: Array<{
    id: number;
    designation: string;
    statut: string;
  }>;
  disciplines: Array<{
    id: number;
    code: string;
    designation: string;
    espace: {
      code: string;
      designation: string;
    };
  }>;
};

type FormErrors = Partial<Record<keyof CreateCreneauInput, string>>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDateLocale(locale: string) {
  if (locale === "en") return "en-US";
  if (locale === "ar") return "ar-DZ";
  return "fr-FR";
}

function formatTimePreview(value: string, locale: string) {
  if (!isValidTimeInput(value)) return null;
  return new Intl.DateTimeFormat(getDateLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(timeInputToUtcDate(value));
}

function buildDefaultValues(
  oneBasedWeek: boolean,
  saisons: CreateCreneauDialogProps["saisons"],
  disciplines: CreateCreneauDialogProps["disciplines"],
): CreateCreneauInput {
  const defaultSaison = saisons.find((s) => s.statut === "OUV") ?? saisons[0];
  const defaultDiscipline = disciplines.length === 1 ? disciplines[0] : null;

  return {
    saisonId: defaultSaison ? String(defaultSaison.id) : "",
    disciplineId: defaultDiscipline ? String(defaultDiscipline.id) : "",
    jourSemaine: oneBasedWeek ? "1" : "0",
    heureDebut: "08:00",
    heureFin: "09:00",
    nombreMin: "5",
    nombreMax: "20",
    groupe: "",
    observations: "",
  };
}

function buildValidationMessages(
  t: ReturnType<typeof useTranslations>,
): CreateCreneauSchemaMessages {
  return {
    saisonRequired: t("creneauxUi.form.validation.saisonRequired"),
    disciplineRequired: t("creneauxUi.form.validation.disciplineRequired"),
    dayRequired: t("creneauxUi.form.validation.dayRequired"),
    heureDebutRequired: t("creneauxUi.form.validation.heureDebutRequired"),
    heureFinRequired: t("creneauxUi.form.validation.heureFinRequired"),
    invalidTime: t("creneauxUi.form.validation.invalidTime"),
    endBeforeStart: t("creneauxUi.form.validation.endBeforeStart"),
    nombreMinRequired: t("creneauxUi.form.validation.nombreMinRequired"),
    nombreMaxRequired: t("creneauxUi.form.validation.nombreMaxRequired"),
    minCapacityInvalid: t("creneauxUi.form.validation.minCapacityInvalid"),
    maxCapacityInvalid: t("creneauxUi.form.validation.maxCapacityInvalid"),
    maxLessThanMin: t("creneauxUi.form.validation.maxLessThanMin"),
    groupeMax: t("creneauxUi.form.validation.groupeMax"),
    observationsMax: t("creneauxUi.form.validation.observationsMax"),
  };
}

function buildDayOptions(
  oneBasedWeek: boolean,
  t: ReturnType<typeof useTranslations>,
) {
  const dayValues = oneBasedWeek
    ? [1, 2, 3, 4, 5, 6, 7]
    : [0, 1, 2, 3, 4, 5, 6];
  return dayValues.map((value) => {
    const dayKey = getDayKey(value, oneBasedWeek);
    return {
      value: String(value),
      label: dayKey ? t(`days.${dayKey}`) : String(value),
    };
  });
}

// ---------------------------------------------------------------------------
// CharRing – SVG progress ring for character count
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
  saison,
  discipline,
  dayLabel,
  startTime,
  endTime,
  minCapacity,
  maxCapacity,
  groupName,
  t,
}: {
  saison: CreateCreneauDialogProps["saisons"][0] | undefined;
  discipline: CreateCreneauDialogProps["disciplines"][0] | undefined;
  dayLabel: string;
  startTime: string | null;
  endTime: string | null;
  minCapacity: string;
  maxCapacity: string;
  groupName: string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0 overflow-hidden border-b border-border/30 bg-muted/30 px-6 py-3">
      {/* Season */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {t("creneauxUi.form.preview.seasonLabel")}
        </span>
        <span className="truncate text-[13px] font-medium text-foreground">
          {saison?.designation ?? "—"}
        </span>
      </div>

      <div className="mx-4 h-8 w-px shrink-0 bg-border/40" />

      {/* Discipline */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {t("creneauxUi.form.preview.disciplineLabel")}
        </span>
        <span className="truncate text-[13px] font-medium text-foreground">
          {discipline
            ? `${discipline.designation} (${discipline.espace.code})`
            : "—"}
        </span>
      </div>

      <div className="mx-4 h-8 w-px shrink-0 bg-border/40" />

      {/* Schedule + capacity */}
      <div className="flex shrink-0 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {t("creneauxUi.form.preview.scheduleLabel")}
        </span>
        <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <span>{dayLabel}</span>
          {startTime && endTime && (
            <>
              <span>•</span>
              <span>{`${startTime} → ${endTime}`}</span>
            </>
          )}
          {minCapacity && maxCapacity && (
            <>
              <span>•</span>
              <span>{`${minCapacity}–${maxCapacity}`}</span>
            </>
          )}
          {groupName && (
            <>
              <span>•</span>
              <span className="truncate max-w-[100px]">{groupName}</span>
            </>
          )}
        </div>
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
// Main Component
// ---------------------------------------------------------------------------

export function CreateCreneauDialog({
  locale,
  oneBasedWeek,
  saisons,
  disciplines,
}: CreateCreneauDialogProps) {
  const router = useRouter();
  const t = useTranslations("admin");
  const { toast } = useAdminToast();

  const dayOptions = React.useMemo(
    () => buildDayOptions(oneBasedWeek, t),
    [oneBasedWeek, t],
  );
  const hasReferenceData = saisons.length > 0 && disciplines.length > 0;

  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [values, setValues] = React.useState<CreateCreneauInput>(() =>
    buildDefaultValues(oneBasedWeek, saisons, disciplines),
  );
  const [errors, setErrors] = React.useState<FormErrors>({});

  const validationMessages = React.useMemo(
    () => buildValidationMessages(t),
    [t],
  );
  const schema = React.useMemo(
    () => createCreneauSchema(validationMessages),
    [validationMessages],
  );

  // Derived preview data
  const selectedSaison = saisons.find((s) => String(s.id) === values.saisonId);
  const selectedDiscipline = disciplines.find(
    (d) => String(d.id) === values.disciplineId,
  );
  const selectedDay = dayOptions.find((d) => d.value === values.jourSemaine);
  const previewStart = formatTimePreview(values.heureDebut, locale);
  const previewEnd = formatTimePreview(values.heureFin, locale);

  const resetForm = React.useCallback(() => {
    setValues(buildDefaultValues(oneBasedWeek, saisons, disciplines));
    setErrors({});
  }, [oneBasedWeek, saisons, disciplines]);

  const handleClose = React.useCallback(() => {
    if (submitting) return;
    setOpen(false);
    setTimeout(resetForm, 300);
  }, [submitting, resetForm]);

  const handleFieldChange = React.useCallback(
    <K extends keyof CreateCreneauInput>(
      field: K,
      value: CreateCreneauInput[K],
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

      if (!hasReferenceData) {
        toast({
          variant: "error",
          title: t("creneauxUi.form.toasts.errorTitle"),
          description: t("creneauxUi.form.feedback.missingReferences"),
        });
        return;
      }

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
          title: t("creneauxUi.form.toasts.validationTitle"),
          description: t("creneauxUi.form.toasts.validationDescription"),
        });
        return;
      }

      setSubmitting(true);
      setErrors({});

      const result = await createCreneau(locale, {
        ...parsed.data,
        saisonId: String(parsed.data.saisonId),
        disciplineId: String(parsed.data.disciplineId),
        jourSemaine: String(parsed.data.jourSemaine),
        nombreMin: String(parsed.data.nombreMin),
        nombreMax: String(parsed.data.nombreMax),
      });
      setSubmitting(false);

      if (!result.success) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        toast({
          variant: "error",
          title: t("creneauxUi.form.toasts.errorTitle"),
          description: result.error,
        });
        return;
      }

      toast({
        variant: "success",
        title: t("creneauxUi.form.toasts.successTitle"),
        description: t("creneauxUi.form.toasts.successDescription"),
      });

      handleClose();
      React.startTransition(() => router.refresh());
    },
    [handleClose, hasReferenceData, locale, router, schema, t, toast, values],
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
        {t("creneauxUi.newButton")}
      </Button>

      {/* Overlay + Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={t("creneauxUi.form.title")}
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
            {/* Header */}
            <div className="shrink-0 border-b border-border/30 px-6 py-5">
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

              <div className="flex items-start gap-3">
                <div className="mt-1 h-6 w-0.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <h2 className="text-xl font-semibold leading-tight text-foreground">
                    {t("creneauxUi.form.title")}
                  </h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {t("creneauxUi.form.description")}
                  </p>
                </div>
              </div>
            </div>

            {/* Live preview strip */}
            <PreviewStrip
              saison={selectedSaison}
              discipline={selectedDiscipline}
              dayLabel={selectedDay?.label ?? "—"}
              startTime={previewStart}
              endTime={previewEnd}
              minCapacity={values.nombreMin}
              maxCapacity={values.nombreMax}
              groupName={values.groupe}
              t={t}
            />

            {/* Scrollable form body */}
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
              noValidate
            >
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* Section: Selection */}
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("creneauxUi.form.sections.selection")}
                </p>

                {/* Season + Discipline */}
                <div className="mb-5 space-y-4">
                  <div>
                    <Label
                      htmlFor="creneau-saison"
                      className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                    >
                      {t("creneauxUi.form.fields.saison")}{" "}
                      <span className="text-destructive" aria-hidden>
                        *
                      </span>
                    </Label>
                    <select
                      id="creneau-saison"
                      value={values.saisonId}
                      onChange={(e) =>
                        handleFieldChange("saisonId", e.target.value)
                      }
                      className={cn(
                        "h-10 w-full rounded-lg border-border/50 bg-background px-3 text-[13px] focus-visible:ring-primary/30",
                        errors.saisonId && "border-destructive/60",
                      )}
                    >
                      <option value="">
                        {t("creneauxUi.form.placeholders.saison")}
                      </option>
                      {saisons.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.designation}
                        </option>
                      ))}
                    </select>
                    <FieldError message={errors.saisonId} />
                  </div>

                  <div>
                    <Label
                      htmlFor="creneau-discipline"
                      className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                    >
                      {t("creneauxUi.form.fields.discipline")}{" "}
                      <span className="text-destructive" aria-hidden>
                        *
                      </span>
                    </Label>
                    <select
                      id="creneau-discipline"
                      value={values.disciplineId}
                      onChange={(e) =>
                        handleFieldChange("disciplineId", e.target.value)
                      }
                      className={cn(
                        "h-10 w-full rounded-lg border-border/50 bg-background px-3 text-[13px] focus-visible:ring-primary/30",
                        errors.disciplineId && "border-destructive/60",
                      )}
                    >
                      <option value="">
                        {t("creneauxUi.form.placeholders.discipline")}
                      </option>
                      {disciplines.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.designation} ({d.espace.code})
                        </option>
                      ))}
                    </select>
                    <FieldError message={errors.disciplineId} />
                  </div>
                </div>

                <div className="my-6 border-t border-border/30" />

                {/* Section: Schedule */}
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("creneauxUi.form.sections.schedule")}
                </p>

                {/* Day selection */}
                <div className="mb-5">
                  <Label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
                    {t("creneauxUi.form.fields.day")}{" "}
                    <span className="text-destructive" aria-hidden>
                      *
                    </span>
                  </Label>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {dayOptions.map((day) => {
                      const active = values.jourSemaine === day.value;
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() =>
                            handleFieldChange("jourSemaine", day.value)
                          }
                          className={cn(
                            "rounded-full border px-2 py-1.5 text-[12px] font-medium transition-all",
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/50 bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/20",
                          )}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                  <FieldError message={errors.jourSemaine} />
                </div>

                {/* Time inputs */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="time"
                      value={values.heureDebut}
                      onChange={(e) =>
                        handleFieldChange("heureDebut", e.target.value)
                      }
                      className={cn(
                        "h-10 rounded-lg border-border/50 bg-background text-[13px]",
                        errors.heureDebut && "border-destructive/60",
                      )}
                    />
                    <FieldError message={errors.heureDebut} />
                  </div>
                  <span className="text-muted-foreground/50">→</span>
                  <div className="flex-1">
                    <Input
                      type="time"
                      value={values.heureFin}
                      onChange={(e) =>
                        handleFieldChange("heureFin", e.target.value)
                      }
                      className={cn(
                        "h-10 rounded-lg border-border/50 bg-background text-[13px]",
                        errors.heureFin && "border-destructive/60",
                      )}
                    />
                    <FieldError message={errors.heureFin} />
                  </div>
                </div>

                <div className="my-6 border-t border-border/30" />

                {/* Section: Capacity & Group */}
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("creneauxUi.form.sections.capacity")}
                </p>

                {/* Min / Max */}
                <div className="mb-5 flex gap-3">
                  <div className="flex-1">
                    <Label
                      htmlFor="nombreMin"
                      className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                    >
                      {t("creneauxUi.form.fields.nombreMin")}{" "}
                      <span className="text-destructive" aria-hidden>
                        *
                      </span>
                    </Label>
                    <Input
                      id="nombreMin"
                      type="number"
                      min="1"
                      value={values.nombreMin}
                      onChange={(e) =>
                        handleFieldChange("nombreMin", e.target.value)
                      }
                      className={cn(
                        "h-10 rounded-lg border-border/50 bg-background text-[13px]",
                        errors.nombreMin && "border-destructive/60",
                      )}
                    />
                    <FieldError message={errors.nombreMin} />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor="nombreMax"
                      className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                    >
                      {t("creneauxUi.form.fields.nombreMax")}{" "}
                      <span className="text-destructive" aria-hidden>
                        *
                      </span>
                    </Label>
                    <Input
                      id="nombreMax"
                      type="number"
                      min={values.nombreMin || "1"}
                      value={values.nombreMax}
                      onChange={(e) =>
                        handleFieldChange("nombreMax", e.target.value)
                      }
                      className={cn(
                        "h-10 rounded-lg border-border/50 bg-background text-[13px]",
                        errors.nombreMax && "border-destructive/60",
                      )}
                    />
                    <FieldError message={errors.nombreMax} />
                  </div>
                </div>

                {/* Groupe with CharRing */}
                <div className="mb-5">
                  <Label
                    htmlFor="groupe"
                    className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-muted-foreground"
                  >
                    <span>{t("creneauxUi.form.fields.groupe")}</span>
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <CharRing count={values.groupe.length} max={40} />
                      <span
                        className={cn(
                          "text-[11px]",
                          values.groupe.length / 40 >= 0.85
                            ? "text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        {values.groupe.length} / 40
                      </span>
                    </span>
                  </Label>
                  <Input
                    id="groupe"
                    value={values.groupe}
                    onChange={(e) =>
                      handleFieldChange("groupe", e.target.value)
                    }
                    maxLength={40}
                    placeholder={t("creneauxUi.form.placeholders.groupe")}
                    className={cn(
                      "h-10 rounded-lg border-border/50 bg-background text-[13px]",
                      errors.groupe && "border-destructive/60",
                    )}
                  />
                  <FieldError message={errors.groupe} />
                </div>

                {/* Observations with CharRing */}
                <div className="mb-5">
                  <Label
                    htmlFor="observations"
                    className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-muted-foreground"
                  >
                    <span>{t("creneauxUi.form.fields.observations")}</span>
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <CharRing count={values.observations.length} max={255} />
                      <span
                        className={cn(
                          "text-[11px]",
                          values.observations.length / 255 >= 0.85
                            ? "text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        {values.observations.length} / 255
                      </span>
                    </span>
                  </Label>
                  <Textarea
                    id="observations"
                    value={values.observations}
                    onChange={(e) =>
                      handleFieldChange("observations", e.target.value)
                    }
                    maxLength={255}
                    rows={3}
                    placeholder={t("creneauxUi.form.placeholders.observations")}
                    className={cn(
                      "rounded-lg border-border/50 bg-background text-[13px]",
                      errors.observations && "border-destructive/60",
                    )}
                  />
                  <FieldError message={errors.observations} />
                </div>

                {/* Missing reference data warning */}
                {!hasReferenceData && (
                  <div className="mt-4 flex items-start gap-3 border-l-[3px] border-amber-400 py-3 pl-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-[12px] font-medium text-foreground">
                        {t("creneauxUi.form.emptyData.title")}
                      </p>
                      <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
                        {t("creneauxUi.form.emptyData.description")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin note */}
                <div className="mt-5 flex items-start gap-3 rounded-lg bg-muted/30 px-4 py-3">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-[12px] font-medium text-foreground">
                      {t("creneauxUi.form.notes.adminTitle")}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
                      {t("creneauxUi.form.notes.adminDescription")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-border/30 bg-background px-6 py-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                    className="text-[13px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    {t("creneauxUi.form.actions.cancel")}
                  </button>
                  <Button
                    type="submit"
                    disabled={submitting || !hasReferenceData}
                    className="flex-1 h-10 rounded-lg bg-primary text-[13px] font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting
                      ? t("creneauxUi.form.actions.submitting")
                      : t("creneauxUi.form.actions.submit")}
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
