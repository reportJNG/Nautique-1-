"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Dumbbell,
  Hash,
  MapPin,
  Plus,
  Shield,
  Waves,
  X,
} from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createDisciplineSchema,
  createEspaceSchema,
  normalizeEntityCode,
  type CreateDisciplineInput,
  type CreateDisciplineSchemaMessages,
  type CreateEspaceInput,
  type CreateEspaceSchemaMessages,
} from "@/lib/validators/discipline";
import { createDiscipline, createEspace } from "./actions";

type CreateDisciplineEspaceDialogProps = {
  locale: string;
  espaces: Array<{
    id: number;
    code: string;
    designation: string;
  }>;
};

type CreateMode = "discipline" | "espace";
type EspaceErrors = Partial<Record<keyof CreateEspaceInput, string>>;
type DisciplineErrors = Partial<Record<keyof CreateDisciplineInput, string>>;

const MODE_CONFIG: Record<
  CreateMode,
  {
    icon: React.ElementType;
    badgeStyle: React.CSSProperties;
  }
> = {
  espace: {
    icon: Waves,
    badgeStyle: {
      background: "#EEEDFE",
      color: "#3C3489",
    },
  },
  discipline: {
    icon: Dumbbell,
    badgeStyle: {
      background: "#E1F5EE",
      color: "#085041",
    },
  },
};

function buildDefaultMode(espaces: CreateDisciplineEspaceDialogProps["espaces"]) {
  return espaces.length > 0 ? "discipline" : "espace";
}

function buildDefaultEspaceValues(): CreateEspaceInput {
  return {
    code: "",
    designation: "",
    description: "",
  };
}

function buildDefaultDisciplineValues(
  espaces: CreateDisciplineEspaceDialogProps["espaces"],
): CreateDisciplineInput {
  return {
    espaceId: espaces[0] ? String(espaces[0].id) : "",
    code: "",
    designation: "",
  };
}

function buildEspaceValidationMessages(
  t: ReturnType<typeof useTranslations>,
): CreateEspaceSchemaMessages {
  return {
    codeRequired: t("espace.codeRequired"),
    codeInvalid: t("espace.codeInvalid"),
    designationRequired: t("espace.designationRequired"),
    designationMin: t("espace.designationMin"),
    designationMax: t("espace.designationMax"),
    descriptionMax: t("espace.descriptionMax"),
  };
}

function buildDisciplineValidationMessages(
  t: ReturnType<typeof useTranslations>,
): CreateDisciplineSchemaMessages {
  return {
    espaceRequired: t("discipline.espaceRequired"),
    codeRequired: t("discipline.codeRequired"),
    codeInvalid: t("discipline.codeInvalid"),
    designationRequired: t("discipline.designationRequired"),
    designationMin: t("discipline.designationMin"),
    designationMax: t("discipline.designationMax"),
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1.5 text-[11px] font-medium text-destructive">{message}</p>
  );
}

function ModeSwitcher({
  value,
  onChange,
  t,
}: {
  value: CreateMode;
  onChange: (mode: CreateMode) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const modes = Object.entries(MODE_CONFIG) as [
    CreateMode,
    (typeof MODE_CONFIG)[CreateMode],
  ][];

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {modes.map(([mode, config]) => {
        const Icon = config.icon;
        const active = value === mode;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition-all duration-150",
              active
                ? "border-primary/40 bg-primary/10 shadow-sm"
                : "border-border/40 bg-background hover:border-border hover:bg-muted/20",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  active ? "bg-background text-foreground" : "bg-muted/30 text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground">
                  {t(`form.modes.${mode}.label`)}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  {t(`form.modes.${mode}.description`)}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PreviewStrip({
  mode,
  espaceValues,
  disciplineValues,
  selectedEspace,
  t,
}: {
  mode: CreateMode;
  espaceValues: CreateEspaceInput;
  disciplineValues: CreateDisciplineInput;
  selectedEspace: CreateDisciplineEspaceDialogProps["espaces"][number] | null;
  t: ReturnType<typeof useTranslations>;
}) {
  const config = MODE_CONFIG[mode];
  const Icon = config.icon;
  const code =
    mode === "espace"
      ? normalizeEntityCode(espaceValues.code)
      : normalizeEntityCode(disciplineValues.code);
  const designation =
    mode === "espace"
      ? espaceValues.designation.trim()
      : disciplineValues.designation.trim();

  return (
    <div className="flex shrink-0 items-center gap-0 overflow-hidden border-b border-border/30 bg-muted/30 px-6 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {t("form.preview.modeLabel")}
        </span>
        <span
          className="inline-flex w-fit items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={config.badgeStyle}
        >
          <Icon className="h-3.5 w-3.5" />
          {t(`form.modes.${mode}.label`)}
        </span>
      </div>

      <div className="mx-4 h-8 w-px shrink-0 bg-border/40" />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {t("form.preview.codeLabel")}
        </span>
        <span className="truncate text-[13px] font-medium text-foreground">
          {code || t("form.preview.emptyCode")}
        </span>
      </div>

      <div className="mx-4 h-8 w-px shrink-0 bg-border/40" />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {t("form.preview.targetLabel")}
        </span>
        {mode === "espace" ? (
          <span className="truncate text-[13px] font-medium text-foreground">
            {designation || t("form.preview.emptyDesignation")}
          </span>
        ) : (
          <div className="inline-flex min-w-0 items-center gap-1.5 text-[13px] font-medium text-foreground">
            <span className="truncate">
              {selectedEspace?.designation || t("form.preview.spaceFallback")}
            </span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {designation || t("form.preview.emptyDesignation")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CreateDisciplineEspaceDialog({
  locale,
  espaces,
}: CreateDisciplineEspaceDialogProps) {
  const router = useRouter();
  const t = useTranslations("admin.disciplinesUi");
  const uiT = useTranslations("common.ui");
  const validationT = useTranslations("admin.disciplinesUi.form.validation");
  const { toast } = useAdminToast();

  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<CreateMode>(() => buildDefaultMode(espaces));
  const [submitting, setSubmitting] = React.useState(false);
  const [espaceValues, setEspaceValues] = React.useState<CreateEspaceInput>(
    () => buildDefaultEspaceValues(),
  );
  const [disciplineValues, setDisciplineValues] =
    React.useState<CreateDisciplineInput>(() => buildDefaultDisciplineValues(espaces));
  const [espaceErrors, setEspaceErrors] = React.useState<EspaceErrors>({});
  const [disciplineErrors, setDisciplineErrors] =
    React.useState<DisciplineErrors>({});

  const hasEspaces = espaces.length > 0;
  const selectedEspace =
    espaces.find((item) => String(item.id) === disciplineValues.espaceId) ?? null;

  const espaceSchema = React.useMemo(
    () => createEspaceSchema(buildEspaceValidationMessages(validationT)),
    [validationT],
  );
  const disciplineSchema = React.useMemo(
    () => createDisciplineSchema(buildDisciplineValidationMessages(validationT)),
    [validationT],
  );

  const resetForm = React.useCallback(() => {
    setMode(buildDefaultMode(espaces));
    setEspaceValues(buildDefaultEspaceValues());
    setDisciplineValues(buildDefaultDisciplineValues(espaces));
    setEspaceErrors({});
    setDisciplineErrors({});
  }, [espaces]);

  const handleClose = React.useCallback(() => {
    if (submitting) return;
    setOpen(false);
    setTimeout(resetForm, 300);
  }, [resetForm, submitting]);

  const handleEspaceFieldChange = React.useCallback(
    <K extends keyof CreateEspaceInput>(field: K, value: CreateEspaceInput[K]) => {
      setEspaceValues((current) => ({ ...current, [field]: value }));
      setEspaceErrors((current) => {
        if (!current[field]) return current;
        return { ...current, [field]: undefined };
      });
    },
    [],
  );

  const handleDisciplineFieldChange = React.useCallback(
    <K extends keyof CreateDisciplineInput>(
      field: K,
      value: CreateDisciplineInput[K],
    ) => {
      setDisciplineValues((current) => ({ ...current, [field]: value }));
      setDisciplineErrors((current) => {
        if (!current[field]) return current;
        return { ...current, [field]: undefined };
      });
    },
    [],
  );

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (mode === "espace") {
        const parsed = espaceSchema.safeParse(espaceValues);

        if (!parsed.success) {
          const nextErrors = Object.fromEntries(
            Object.entries(parsed.error.flatten().fieldErrors)
              .map(([field, messages]) => [field, messages?.[0]])
              .filter((entry): entry is [string, string] => Boolean(entry[1])),
          ) as EspaceErrors;

          setEspaceErrors(nextErrors);
          toast({
            variant: "error",
            title: t("form.toasts.validationTitle"),
            description: t("form.toasts.validationDescription"),
          });
          return;
        }

        setSubmitting(true);
        setEspaceErrors({});

        const result = await createEspace(locale, parsed.data);

        setSubmitting(false);

        if (!result.success) {
          if (result.fieldErrors) {
            setEspaceErrors(result.fieldErrors);
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
          description: t("form.toasts.spaceSuccessDescription"),
        });

        handleClose();
        React.startTransition(() => router.refresh());
        return;
      }

      if (!hasEspaces) {
        const message = t("form.notes.emptySpacesDescription");
        setDisciplineErrors({ espaceId: message });
        toast({
          variant: "error",
          title: t("form.toasts.errorTitle"),
          description: message,
        });
        return;
      }

      const parsed = disciplineSchema.safeParse(disciplineValues);

      if (!parsed.success) {
        const nextErrors = Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors)
            .map(([field, messages]) => [field, messages?.[0]])
            .filter((entry): entry is [string, string] => Boolean(entry[1])),
        ) as DisciplineErrors;

        setDisciplineErrors(nextErrors);
        toast({
          variant: "error",
          title: t("form.toasts.validationTitle"),
          description: t("form.toasts.validationDescription"),
        });
        return;
      }

      setSubmitting(true);
      setDisciplineErrors({});

      const result = await createDiscipline(locale, disciplineValues);

      setSubmitting(false);

      if (!result.success) {
        if (result.fieldErrors) {
          setDisciplineErrors(result.fieldErrors);
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
        description: t("form.toasts.disciplineSuccessDescription"),
      });

      handleClose();
      React.startTransition(() => router.refresh());
    },
    [
      disciplineSchema,
      disciplineValues,
      espaceSchema,
      espaceValues,
      handleClose,
      hasEspaces,
      locale,
      mode,
      router,
      t,
      toast,
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
              "sm:w-[520px] sm:border-l sm:border-border/40",
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
              mode={mode}
              espaceValues={espaceValues}
              disciplineValues={disciplineValues}
              selectedEspace={selectedEspace}
              t={t}
            />

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
              noValidate
            >
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("form.sections.mode")}
                </p>

                <ModeSwitcher value={mode} onChange={setMode} t={t} />

                <div className="my-6 border-t border-border/30" />
                {mode === "espace" ? (
                  <>
                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("form.sections.details")}
                    </p>

                    <div className="mb-5">
                      <Label
                        htmlFor="espace-code"
                        className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                      >
                        {t("form.fields.code")}{" "}
                        <span className="text-destructive" aria-hidden>
                          *
                        </span>
                      </Label>
                      <div className="relative">
                        <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                        <Input
                          id="espace-code"
                          value={espaceValues.code}
                          onChange={(event) =>
                            handleEspaceFieldChange("code", event.target.value)
                          }
                          placeholder={t("form.placeholders.espace.code")}
                          maxLength={10}
                          aria-invalid={Boolean(espaceErrors.code)}
                          className={cn(
                            "h-10 rounded-lg border-border/50 bg-background pl-9 text-[13px] uppercase placeholder:text-muted-foreground/50 focus-visible:ring-primary/30",
                            espaceErrors.code && "border-destructive/60",
                          )}
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {t("form.hints.code")}
                      </p>
                      <FieldError message={espaceErrors.code} />
                    </div>

                    <div className="mb-5">
                      <Label
                        htmlFor="espace-designation"
                        className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-muted-foreground"
                      >
                        <span>
                          {t("form.fields.designation")}{" "}
                          <span className="text-destructive" aria-hidden>
                            *
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 tabular-nums">
                          <CharRing count={espaceValues.designation.length} max={80} />
                          <span
                            className={cn(
                              "text-[11px]",
                              espaceValues.designation.length / 80 >= 0.85
                                ? "text-destructive"
                                : "text-muted-foreground",
                            )}
                          >
                            {espaceValues.designation.length} / 80
                          </span>
                        </span>
                      </Label>
                      <Input
                        id="espace-designation"
                        value={espaceValues.designation}
                        onChange={(event) =>
                          handleEspaceFieldChange("designation", event.target.value)
                        }
                        placeholder={t("form.placeholders.espace.designation")}
                        maxLength={80}
                        aria-invalid={Boolean(espaceErrors.designation)}
                        className={cn(
                          "h-10 rounded-lg border-border/50 bg-background text-[13px] placeholder:text-muted-foreground/50 focus-visible:ring-primary/30",
                          espaceErrors.designation && "border-destructive/60",
                        )}
                      />
                      <FieldError message={espaceErrors.designation} />
                    </div>

                    <div className="mb-5">
                      <Label
                        htmlFor="espace-description"
                        className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-muted-foreground"
                      >
                        <span>{t("form.fields.description")}</span>
                        <span className="flex items-center gap-1.5 tabular-nums">
                          <CharRing count={espaceValues.description.length} max={255} />
                          <span
                            className={cn(
                              "text-[11px]",
                              espaceValues.description.length / 255 >= 0.85
                                ? "text-destructive"
                                : "text-muted-foreground",
                            )}
                          >
                            {espaceValues.description.length} / 255
                          </span>
                        </span>
                      </Label>
                      <Textarea
                        id="espace-description"
                        value={espaceValues.description}
                        onChange={(event) =>
                          handleEspaceFieldChange("description", event.target.value)
                        }
                        placeholder={t("form.placeholders.espace.description")}
                        maxLength={255}
                        rows={4}
                        aria-invalid={Boolean(espaceErrors.description)}
                        className={cn(
                          "rounded-lg border-border/50 bg-background text-[13px] placeholder:text-muted-foreground/50 focus-visible:ring-primary/30",
                          espaceErrors.description && "border-destructive/60",
                        )}
                      />
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {t("form.hints.spaceDescription")}
                      </p>
                      <FieldError message={espaceErrors.description} />
                    </div>

                    <div className="mt-5 flex items-start gap-3 rounded-lg bg-muted/30 px-4 py-3">
                      <Waves className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-[12px] font-medium text-foreground">
                          {t("form.notes.espaceTitle")}
                        </p>
                        <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
                          {t("form.notes.espaceDescription")}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("form.sections.linking")}
                    </p>

                    <div className="mb-5">
                      <Label
                        htmlFor="discipline-espace"
                        className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                      >
                        {t("form.fields.espace")}{" "}
                        <span className="text-destructive" aria-hidden>
                          *
                        </span>
                      </Label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                        <select
                          id="discipline-espace"
                          value={disciplineValues.espaceId}
                          onChange={(event) =>
                            handleDisciplineFieldChange("espaceId", event.target.value)
                          }
                          aria-invalid={Boolean(disciplineErrors.espaceId)}
                          className={cn(
                            "h-10 w-full rounded-lg border border-border/50 bg-background pl-9 pr-3 text-[13px] focus-visible:ring-primary/30",
                            disciplineErrors.espaceId && "border-destructive/60",
                          )}
                        >
                          <option value="">{t("form.placeholders.discipline.espace")}</option>
                          {espaces.map((espace) => (
                            <option key={espace.id} value={espace.id}>
                              {espace.designation} ({espace.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <FieldError message={disciplineErrors.espaceId} />
                    </div>

                    <div className="my-6 border-t border-border/30" />

                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("form.sections.details")}
                    </p>

                    <div className="mb-5">
                      <Label
                        htmlFor="discipline-code"
                        className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                      >
                        {t("form.fields.code")}{" "}
                        <span className="text-destructive" aria-hidden>
                          *
                        </span>
                      </Label>
                      <div className="relative">
                        <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                        <Input
                          id="discipline-code"
                          value={disciplineValues.code}
                          onChange={(event) =>
                            handleDisciplineFieldChange("code", event.target.value)
                          }
                          placeholder={t("form.placeholders.discipline.code")}
                          maxLength={10}
                          aria-invalid={Boolean(disciplineErrors.code)}
                          className={cn(
                            "h-10 rounded-lg border-border/50 bg-background pl-9 text-[13px] uppercase placeholder:text-muted-foreground/50 focus-visible:ring-primary/30",
                            disciplineErrors.code && "border-destructive/60",
                          )}
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {t("form.hints.code")}
                      </p>
                      <FieldError message={disciplineErrors.code} />
                    </div>

                    <div className="mb-5">
                      <Label
                        htmlFor="discipline-designation"
                        className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-muted-foreground"
                      >
                        <span>
                          {t("form.fields.designation")}{" "}
                          <span className="text-destructive" aria-hidden>
                            *
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 tabular-nums">
                          <CharRing count={disciplineValues.designation.length} max={80} />
                          <span
                            className={cn(
                              "text-[11px]",
                              disciplineValues.designation.length / 80 >= 0.85
                                ? "text-destructive"
                                : "text-muted-foreground",
                            )}
                          >
                            {disciplineValues.designation.length} / 80
                          </span>
                        </span>
                      </Label>
                      <Input
                        id="discipline-designation"
                        value={disciplineValues.designation}
                        onChange={(event) =>
                          handleDisciplineFieldChange(
                            "designation",
                            event.target.value,
                          )
                        }
                        placeholder={t("form.placeholders.discipline.designation")}
                        maxLength={80}
                        aria-invalid={Boolean(disciplineErrors.designation)}
                        className={cn(
                          "h-10 rounded-lg border-border/50 bg-background text-[13px] placeholder:text-muted-foreground/50 focus-visible:ring-primary/30",
                          disciplineErrors.designation && "border-destructive/60",
                        )}
                      />
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {t("form.hints.disciplineSpace")}
                      </p>
                      <FieldError message={disciplineErrors.designation} />
                    </div>

                    {!hasEspaces && (
                      <div className="mt-4 flex items-start gap-3 border-l-[3px] border-amber-400 py-3 pl-4">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        <div>
                          <p className="text-[12px] font-medium text-foreground">
                            {t("form.notes.emptySpacesTitle")}
                          </p>
                          <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
                            {t("form.notes.emptySpacesDescription")}
                          </p>
                        </div>
                      </div>
                    )}

                    {hasEspaces && (
                      <div className="mt-5 flex items-start gap-3 rounded-lg bg-muted/30 px-4 py-3">
                        <Dumbbell className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-[12px] font-medium text-foreground">
                            {t("form.notes.disciplineTitle")}
                          </p>
                          <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
                            {t("form.notes.disciplineDescription")}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
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
                    disabled={submitting || (mode === "discipline" && !hasEspaces)}
                    className="h-10 flex-1 rounded-lg bg-primary text-[13px] font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting
                      ? t("form.actions.submitting")
                      : t(
                          mode === "espace"
                            ? "form.actions.submitEspace"
                            : "form.actions.submitDiscipline",
                        )}
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
