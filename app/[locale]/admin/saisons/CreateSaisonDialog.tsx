"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Lock,
  Plus,
  Shield,
} from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

function getDateLocale(locale: string) {
  if (locale === "en") return "en-US";
  if (locale === "ar") return "ar-DZ";
  return "fr-FR";
}

function formatDatePreview(value: string, locale: string) {
  if (!isValidDateInput(value)) {
    return null;
  }

  return new Intl.DateTimeFormat(getDateLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateInputToUtcDate(value));
}

function getSeasonYearLabel(start: string, end: string) {
  if (!isValidDateInput(start) || !isValidDateInput(end)) {
    return null;
  }

  const startYear = dateInputToUtcDate(start).getUTCFullYear();
  const endYear = dateInputToUtcDate(end).getUTCFullYear();

  return `${startYear}-${endYear}`;
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

function buildDefaultValues(defaultStatus: SaisonStatusValue): CreateSaisonInput {
  return {
    designation: "",
    dateDebut: "",
    dateFin: "",
    statut: defaultStatus,
  };
}

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

  const startPreview = formatDatePreview(values.dateDebut, locale);
  const endPreview = formatDatePreview(values.dateFin, locale);
  const seasonYearLabel = getSeasonYearLabel(values.dateDebut, values.dateFin);

  const statusOptions = React.useMemo(
    () =>
      [
        {
          value: "PRE" as const,
          icon: Clock3,
          chipClass:
            "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300",
        },
        {
          value: "OUV" as const,
          icon: CheckCircle2,
          chipClass:
            "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
        },
        {
          value: "FER" as const,
          icon: Shield,
          chipClass:
            "border-slate-500/25 bg-slate-500/10 text-slate-600 dark:text-slate-300",
        },
        {
          value: "CLO" as const,
          icon: Lock,
          chipClass:
            "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-300",
        },
      ].map((item) => ({
        ...item,
        label: t(`saisonStatus.${item.value}`),
        description: t(`form.statusOptions.${item.value}.description`),
      })),
    [t],
  );

  const resetForm = React.useCallback(() => {
    setValues(buildDefaultValues(defaultStatus));
    setErrors({});
  }, [defaultStatus]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && !submitting) {
        resetForm();
      }

      setOpen(nextOpen);
    },
    [resetForm, submitting],
  );

  const handleFieldChange = React.useCallback(
    <K extends keyof CreateSaisonInput>(field: K, value: CreateSaisonInput[K]) => {
      setValues((current) => ({
        ...current,
        [field]: value,
      }));

      setErrors((current) => {
        if (!current[field]) {
          return current;
        }

        return {
          ...current,
          [field]: undefined,
        };
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

      handleOpenChange(false);
      React.startTransition(() => {
        router.refresh();
      });
    },
    [handleOpenChange, locale, router, schema, t, toast, values],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          {t("newButton")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl gap-0 overflow-hidden border-border/60 bg-background/95 p-0">
        <div className="border-b border-border/40 bg-gradient-to-br from-primary/12 via-background to-background px-6 py-5">
          <DialogHeader className="space-y-3 text-left">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <Shield className="h-3.5 w-3.5" />
              {t("form.adminOnlyBadge")}
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black tracking-tight">
                {t("form.title")}
              </DialogTitle>
              <DialogDescription className="max-w-2xl text-sm leading-6">
                {t("form.description")}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6 px-6 py-6">
            <div className="rounded-2xl border border-border/50 bg-card/50 p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  {t("form.sections.identity")}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="saison-designation" className="text-sm font-semibold">
                    {t("form.fields.designation")}
                  </Label>
                  <Input
                    id="saison-designation"
                    value={values.designation}
                    onChange={(event) =>
                      handleFieldChange("designation", event.target.value)
                    }
                    placeholder={t("form.placeholders.designation")}
                    className={cn(
                      "h-11 rounded-xl border-border/50 bg-background/80 shadow-sm",
                      errors.designation &&
                        "border-destructive/60 focus:border-destructive focus:ring-destructive/20",
                    )}
                    aria-invalid={Boolean(errors.designation)}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      {t("form.hints.designation")}
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      {values.designation.trim().length}/80
                    </span>
                  </div>
                  {errors.designation ? (
                    <p className="text-xs font-medium text-destructive">
                      {errors.designation}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="saison-date-debut" className="text-sm font-semibold">
                      {t("form.fields.dateDebut")}
                    </Label>
                    <Input
                      id="saison-date-debut"
                      type="date"
                      value={values.dateDebut}
                      onChange={(event) =>
                        handleFieldChange("dateDebut", event.target.value)
                      }
                      className={cn(
                        "h-11 rounded-xl border-border/50 bg-background/80 shadow-sm",
                        errors.dateDebut &&
                          "border-destructive/60 focus:border-destructive focus:ring-destructive/20",
                      )}
                      aria-invalid={Boolean(errors.dateDebut)}
                    />
                    {errors.dateDebut ? (
                      <p className="text-xs font-medium text-destructive">
                        {errors.dateDebut}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="saison-date-fin" className="text-sm font-semibold">
                      {t("form.fields.dateFin")}
                    </Label>
                    <Input
                      id="saison-date-fin"
                      type="date"
                      value={values.dateFin}
                      onChange={(event) =>
                        handleFieldChange("dateFin", event.target.value)
                      }
                      className={cn(
                        "h-11 rounded-xl border-border/50 bg-background/80 shadow-sm",
                        errors.dateFin &&
                          "border-destructive/60 focus:border-destructive focus:ring-destructive/20",
                      )}
                      aria-invalid={Boolean(errors.dateFin)}
                    />
                    {errors.dateFin ? (
                      <p className="text-xs font-medium text-destructive">
                        {errors.dateFin}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-3 text-xs leading-5 text-muted-foreground">
                  {t("form.hints.dateRange")}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/50 p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  {t("form.sections.status")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = values.statut === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleFieldChange("statut", option.value)}
                      className={cn(
                        "group rounded-2xl border p-4 text-left transition-all duration-200",
                        "hover:-translate-y-0.5 hover:shadow-lg",
                        selected
                          ? "border-primary/50 bg-primary/10 shadow-[0_10px_30px_-18px_hsl(var(--primary)/0.75)]"
                          : "border-border/50 bg-background/70 hover:border-primary/25",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl border",
                            selected ? option.chipClass : "border-border/50 bg-muted/30 text-muted-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
                            selected
                              ? "border-primary/25 bg-primary/10 text-primary"
                              : "border-border/60 bg-background text-muted-foreground",
                          )}
                        >
                          {option.label}
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-foreground">
                          {option.label}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {errors.statut ? (
                <p className="mt-3 text-xs font-medium text-destructive">
                  {errors.statut}
                </p>
              ) : null}
            </div>
          </div>

          <div className="border-t border-border/40 bg-muted/10 px-6 py-6 md:border-l md:border-t-0">
            <div className="space-y-5">
              <div className="rounded-3xl border border-border/50 bg-card/80 p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.7)] backdrop-blur">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      {t("form.preview.eyebrow")}
                    </p>
                    <h3 className="mt-1 text-lg font-bold tracking-tight text-foreground">
                      {t("form.preview.title")}
                    </h3>
                  </div>
                  <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                    {t("form.preview.live")}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/50 bg-background/80 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {t("form.preview.designationLabel")}
                    </p>
                    <p className="mt-2 text-xl font-black tracking-tight text-foreground">
                      {values.designation.trim() || t("form.preview.emptyDesignation")}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {seasonYearLabel
                        ? t("form.preview.seasonYear", { years: seasonYearLabel })
                        : t("form.preview.seasonYearFallback")}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                    <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {t("form.preview.rangeLabel")}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {startPreview && endPreview
                          ? t("detail.dateRange", {
                              start: startPreview,
                              end: endPreview,
                            })
                          : t("form.preview.emptyRange")}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {t("form.preview.statusLabel")}
                      </p>
                      <span className="mt-2 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        {t(`saisonStatus.${values.statut}`)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/15 bg-primary/8 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl border border-primary/20 bg-primary/12 p-2 text-primary">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {t("form.notes.adminTitle")}
                    </p>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {t("form.notes.adminDescription")}
                    </p>
                  </div>
                </div>
              </div>

              {hasOpenSeason && values.statut === "OUV" ? (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {t("form.notes.openSeasonTitle")}
                      </p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {t("form.notes.openSeasonDescription", {
                          designation:
                            openSeasonDesignation ?? t("form.notes.anotherSeason"),
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter className="col-span-full border-t border-border/40 bg-background/95 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
              className="rounded-xl"
            >
              {t("form.actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
            >
              {submitting ? t("form.actions.submitting") : t("form.actions.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
