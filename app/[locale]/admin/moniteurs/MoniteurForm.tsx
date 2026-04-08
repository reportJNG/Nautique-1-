"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAdminToast } from "@/components/admin/AdminToast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createMoniteurSchema,
  type MoniteurFormInput,
  type MoniteurSchemaMessages,
} from "@/lib/validators/moniteur";
import { createMoniteur, deleteMoniteur, updateMoniteur } from "./actions";
import {
  Mail,
  Phone,
  Shield,
  Star,
  Trash2,
} from "lucide-react";

type FormErrors = Partial<Record<keyof MoniteurFormInput, string>>;

type MoniteurFormProps = {
  locale: string;
  mode: "create" | "edit";
  moniteurId?: number;
  assignmentCount?: number;
  initialValues?: MoniteurFormInput;
};

function buildValidationMessages(
  t: ReturnType<typeof useTranslations>,
): MoniteurSchemaMessages {
  return {
    nomRequired: t("nomRequired"),
    nomMin: t("nomMin"),
    nomMax: t("nomMax"),
    prenomRequired: t("prenomRequired"),
    prenomMin: t("prenomMin"),
    prenomMax: t("prenomMax"),
    sexeRequired: t("sexeRequired"),
    telephoneMax: t("telephoneMax"),
    emailInvalid: t("emailInvalid"),
    specialiteMax: t("specialiteMax"),
    statusRequired: t("statusRequired"),
  };
}

function buildDefaultValues(
  initialValues?: MoniteurFormInput,
): MoniteurFormInput {
  if (initialValues) {
    return initialValues;
  }

  return {
    nom: "",
    prenom: "",
    sexe: "M",
    telephone: "",
    email: "",
    specialite: "",
    actif: "1",
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1.5 text-[11px] font-medium text-destructive">
      {message}
    </p>
  );
}

function InfoCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/30 bg-card/70 p-5 backdrop-blur-md",
        className,
      )}
    >
      <h2 className="mb-4 text-[13px] font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function MoniteurForm({
  locale,
  mode,
  moniteurId,
  assignmentCount = 0,
  initialValues,
}: MoniteurFormProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const commonT = useTranslations("common");
  const moniteursT = useTranslations("admin.moniteursUi");
  const formT = useTranslations("admin.moniteursUi.form");
  const validationT = useTranslations("admin.moniteursUi.form.validation");

  const isEdit = mode === "edit";
  const [values, setValues] = React.useState<MoniteurFormInput>(() =>
    buildDefaultValues(initialValues),
  );
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const validationMessages = React.useMemo(
    () => buildValidationMessages(validationT),
    [validationT],
  );
  const schema = React.useMemo(
    () => createMoniteurSchema(validationMessages),
    [validationMessages],
  );

  const initials = `${values.prenom?.[0] ?? ""}${values.nom?.[0] ?? ""}`
    .trim()
    .toUpperCase() || "M";
  const statusLabel =
    values.actif === "1"
      ? moniteursT("status.active")
      : moniteursT("status.inactive");
  const specialityValue = values.specialite || formT("preview.none");
  const contactValue = [values.email, values.telephone]
    .filter(Boolean)
    .join(" / ") || formT("preview.none");

  const handleFieldChange = React.useCallback(
    <K extends keyof MoniteurFormInput>(
      field: K,
      value: MoniteurFormInput[K],
    ) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => {
        if (!current[field]) {
          return current;
        }

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
          title: formT("toasts.validationTitle"),
          description: formT("toasts.validationDescription"),
        });
        return;
      }

      setSubmitting(true);
      setErrors({});
      setValues(parsed.data);

      const result = isEdit
        ? await updateMoniteur(locale, moniteurId ?? 0, parsed.data)
        : await createMoniteur(locale, parsed.data);

      setSubmitting(false);

      if (!result.success) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }

        toast({
          variant: "error",
          title: formT("toasts.errorTitle"),
          description: result.error,
        });
        return;
      }

      if (isEdit) {
        toast({
          variant: "success",
          title: formT("toasts.updateSuccessTitle"),
          description: formT("toasts.updateSuccessDescription"),
        });
        React.startTransition(() => router.refresh());
        return;
      }

      toast({
        variant: "success",
        title: formT("toasts.createSuccessTitle"),
        description: formT("toasts.createSuccessDescription"),
      });

      if (result.createdId) {
        React.startTransition(() => {
          router.push(`/admin/moniteurs/${result.createdId}`);
          router.refresh();
        });
      }
    },
    [formT, isEdit, locale, moniteurId, router, schema, toast, values],
  );

  const handleDelete = React.useCallback(async () => {
    if (!isEdit || !moniteurId) {
      return;
    }

    setDeleting(true);

    const result = await deleteMoniteur(locale, moniteurId);

    setDeleting(false);

    if (!result.success) {
      toast({
        variant: "error",
        title: formT("toasts.errorTitle"),
        description: result.error,
      });
      return;
    }

    setDeleteDialogOpen(false);

    toast({
      variant: "success",
      title: formT("toasts.deleteSuccessTitle"),
      description: formT("toasts.deleteSuccessDescription", {
        count: result.deletedAssignments ?? 0,
      }),
    });

    React.startTransition(() => {
      router.push("/admin/moniteurs");
      router.refresh();
    });
  }, [formT, isEdit, locale, moniteurId, router, toast]);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,340px)]"
        noValidate
      >
        <div className="flex flex-col gap-5">
          <InfoCard title={formT("sections.identity")}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label
                  htmlFor="moniteur-prenom"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  {formT("fields.prenom")}
                </Label>
                <Input
                  id="moniteur-prenom"
                  value={values.prenom}
                  onChange={(event) =>
                    handleFieldChange("prenom", event.target.value)
                  }
                  placeholder={formT("placeholders.prenom")}
                  aria-invalid={Boolean(errors.prenom)}
                  className={cn(
                    "h-10 rounded-lg border-border/50 bg-background text-[13px] focus-visible:ring-primary/30",
                    errors.prenom && "border-destructive/60",
                  )}
                />
                <FieldError message={errors.prenom} />
              </div>

              <div>
                <Label
                  htmlFor="moniteur-nom"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  {formT("fields.nom")}
                </Label>
                <Input
                  id="moniteur-nom"
                  value={values.nom}
                  onChange={(event) =>
                    handleFieldChange("nom", event.target.value)
                  }
                  placeholder={formT("placeholders.nom")}
                  aria-invalid={Boolean(errors.nom)}
                  className={cn(
                    "h-10 rounded-lg border-border/50 bg-background text-[13px] focus-visible:ring-primary/30",
                    errors.nom && "border-destructive/60",
                  )}
                />
                <FieldError message={errors.nom} />
              </div>

              <div>
                <Label
                  htmlFor="moniteur-sexe"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  {formT("fields.sexe")}
                </Label>
                <select
                  id="moniteur-sexe"
                  value={values.sexe}
                  onChange={(event) =>
                    handleFieldChange("sexe", event.target.value as "M" | "F")
                  }
                  aria-invalid={Boolean(errors.sexe)}
                  className={cn(
                    "h-10 w-full rounded-lg border border-border/50 bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30",
                    errors.sexe && "border-destructive/60",
                  )}
                >
                  <option value="M">{formT("options.sexe.M")}</option>
                  <option value="F">{formT("options.sexe.F")}</option>
                </select>
                <FieldError message={errors.sexe} />
              </div>

              <div>
                <Label
                  htmlFor="moniteur-actif"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  {formT("fields.actif")}
                </Label>
                <select
                  id="moniteur-actif"
                  value={values.actif}
                  onChange={(event) =>
                    handleFieldChange("actif", event.target.value as "1" | "0")
                  }
                  aria-invalid={Boolean(errors.actif)}
                  className={cn(
                    "h-10 w-full rounded-lg border border-border/50 bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30",
                    errors.actif && "border-destructive/60",
                  )}
                >
                  <option value="1">{formT("options.status.active")}</option>
                  <option value="0">{formT("options.status.inactive")}</option>
                </select>
                <FieldError message={errors.actif} />
              </div>
            </div>
          </InfoCard>

          <InfoCard title={formT("sections.contact")}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label
                  htmlFor="moniteur-email"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  {formT("fields.email")}
                </Label>
                <Input
                  id="moniteur-email"
                  type="email"
                  value={values.email}
                  onChange={(event) =>
                    handleFieldChange("email", event.target.value)
                  }
                  placeholder={formT("placeholders.email")}
                  aria-invalid={Boolean(errors.email)}
                  className={cn(
                    "h-10 rounded-lg border-border/50 bg-background text-[13px] focus-visible:ring-primary/30",
                    errors.email && "border-destructive/60",
                  )}
                />
                <FieldError message={errors.email} />
              </div>

              <div>
                <Label
                  htmlFor="moniteur-telephone"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  {formT("fields.telephone")}
                </Label>
                <Input
                  id="moniteur-telephone"
                  value={values.telephone}
                  onChange={(event) =>
                    handleFieldChange("telephone", event.target.value)
                  }
                  placeholder={formT("placeholders.telephone")}
                  aria-invalid={Boolean(errors.telephone)}
                  className={cn(
                    "h-10 rounded-lg border-border/50 bg-background text-[13px] focus-visible:ring-primary/30",
                    errors.telephone && "border-destructive/60",
                  )}
                />
                <FieldError message={errors.telephone} />
              </div>
            </div>
          </InfoCard>

          <InfoCard title={formT("sections.professional")}>
            <div>
              <Label
                htmlFor="moniteur-specialite"
                className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
              >
                {formT("fields.specialite")}
              </Label>
              <Input
                id="moniteur-specialite"
                value={values.specialite}
                onChange={(event) =>
                  handleFieldChange("specialite", event.target.value)
                }
                placeholder={formT("placeholders.specialite")}
                aria-invalid={Boolean(errors.specialite)}
                className={cn(
                  "h-10 rounded-lg border-border/50 bg-background text-[13px] focus-visible:ring-primary/30",
                  errors.specialite && "border-destructive/60",
                )}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {formT("hints.specialite")}
              </p>
              <FieldError message={errors.specialite} />
            </div>
          </InfoCard>

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href={`/${locale}/admin/moniteurs`}>
                {commonT("cancel")}
              </Link>
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? `${isEdit ? commonT("save") : commonT("create")}...`
                : isEdit
                  ? commonT("save")
                  : commonT("create")}
            </Button>
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          <InfoCard title={formT("preview.title")}>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-lg font-bold text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.25)]">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-foreground">
                  {values.prenom || values.nom
                    ? `${values.prenom} ${values.nom}`.trim()
                    : formT("preview.emptyName")}
                </p>
                <span
                  className={cn(
                    "mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                    values.actif === "1"
                      ? "border-primary/25 bg-primary/12 text-primary"
                      : "border-border/40 bg-muted/20 text-muted-foreground",
                  )}
                >
                  {statusLabel}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-border/30 bg-background/70 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {formT("preview.specialite")}
                </p>
                <p className="mt-1 flex items-center gap-2 text-[13px] text-foreground">
                  <Star className="h-3.5 w-3.5 text-primary" />
                  <span className="min-w-0 truncate">{specialityValue}</span>
                </p>
              </div>

              <div className="rounded-xl border border-border/30 bg-background/70 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {formT("preview.contact")}
                </p>
                <div className="mt-1.5 space-y-1.5 text-[13px] text-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="min-w-0 truncate">
                      {values.email || formT("preview.none")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="min-w-0 truncate">
                      {values.telephone || formT("preview.none")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/30 bg-background/70 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {formT("preview.summary")}
                </p>
                <div className="mt-2 grid gap-2 text-[12px] text-muted-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span>{formT("fields.sexe")}</span>
                    <span className="font-medium text-foreground">
                      {formT(`options.sexe.${values.sexe}`)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>{formT("preview.assignmentsLabel")}</span>
                    <span className="font-medium text-foreground">
                      {formT("preview.assignments", { count: assignmentCount })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>{formT("preview.contactLine")}</span>
                    <span className="max-w-[160px] truncate text-right font-medium text-foreground">
                      {contactValue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard title={formT("security.title")}>
            <div className="flex items-start gap-3 text-[12px] leading-5 text-muted-foreground">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>{formT("security.description")}</p>
            </div>
          </InfoCard>

          {isEdit ? (
            <InfoCard
              title={formT("deleteCard.title")}
              className="border-destructive/20"
            >
              <p className="text-[12px] leading-5 text-muted-foreground">
                {formT("deleteCard.description", { count: assignmentCount })}
              </p>
              <Button
                type="button"
                variant="destructive"
                className="mt-4 w-full"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? `${commonT("delete")}...` : commonT("delete")}
              </Button>
            </InfoCard>
          ) : null}
        </aside>
      </form>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{formT("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {formT("deleteDialog.description", { count: assignmentCount })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {commonT("cancel")}
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? `${commonT("delete")}...` : commonT("delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
