"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  KeyRound,
  Mail,
  Shield,
  Trash2,
  UserCog,
} from "lucide-react";

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
  createAgentSchema,
  type AgentFormInput,
  type AgentSchemaMessages,
} from "@/lib/validators/agent";

import { createAgent, deleteAgent, updateAgent } from "./actions";

type FormErrors = Partial<Record<keyof AgentFormInput, string>>;

type AgentRoleOption = {
  code: string;
  label: string;
};

type AgentFormProps = {
  locale: string;
  mode: "create" | "edit";
  roleOptions: AgentRoleOption[];
  currentRoleLabel?: string;
  agentId?: number;
  initialValues?: AgentFormInput;
  isProtectedAdmin?: boolean;
  isSelf?: boolean;
  linkedRecordsCount?: number;
};

function buildValidationMessages(
  t: ReturnType<typeof useTranslations>,
): AgentSchemaMessages {
  return {
    nomRequired: t("nomRequired"),
    nomMin: t("nomMin"),
    nomMax: t("nomMax"),
    prenomRequired: t("prenomRequired"),
    prenomMin: t("prenomMin"),
    prenomMax: t("prenomMax"),
    loginRequired: t("loginRequired"),
    loginMin: t("loginMin"),
    loginMax: t("loginMax"),
    loginPattern: t("loginPattern"),
    emailInvalid: t("emailInvalid"),
    roleRequired: t("roleRequired"),
    statusRequired: t("statusRequired"),
    passwordRequired: t("passwordRequired"),
    passwordMin: t("passwordMin"),
    passwordMax: t("passwordMax"),
    passwordPattern: t("passwordPattern"),
    confirmPasswordRequired: t("confirmPasswordRequired"),
    confirmPasswordMismatch: t("confirmPasswordMismatch"),
    adminRoleForbidden: t("adminRoleForbidden"),
  };
}

function buildDefaultValues(
  roleOptions: AgentRoleOption[],
  initialValues?: AgentFormInput,
): AgentFormInput {
  if (initialValues) {
    return initialValues;
  }

  return {
    nom: "",
    prenom: "",
    login: "",
    email: "",
    roleCode: roleOptions[0]?.code ?? "",
    actif: "1",
    password: "",
    confirmPassword: "",
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

export function AgentForm({
  locale,
  mode,
  roleOptions,
  currentRoleLabel,
  agentId,
  initialValues,
  isProtectedAdmin = false,
  isSelf = false,
  linkedRecordsCount = 0,
}: AgentFormProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const adminT = useTranslations("admin");
  const commonT = useTranslations("common");
  const formT = useTranslations("admin.agentsUi.form");
  const validationT = useTranslations("admin.agentsUi.form.validation");

  const isEdit = mode === "edit";
  const canDelete = isEdit && !isProtectedAdmin && !isSelf;
  const roleLocked = isProtectedAdmin || isSelf;
  const statusLocked = isProtectedAdmin || isSelf;

  const [values, setValues] = React.useState<AgentFormInput>(() =>
    buildDefaultValues(roleOptions, initialValues),
  );
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const validationMessages = buildValidationMessages(validationT);
  const schema = createAgentSchema(validationMessages, {
    requirePassword: !isEdit,
    allowAdminRole: isProtectedAdmin,
  });

  const initials = `${values.prenom?.[0] ?? ""}${values.nom?.[0] ?? ""}`
    .trim()
    .toUpperCase() || "AG";
  const activeStatusLabel =
    values.actif === "1" ? adminT("status.active") : adminT("status.inactive");
  const roleLabel =
    roleOptions.find((role) => role.code === values.roleCode)?.label ??
    currentRoleLabel ??
    values.roleCode;
  const displayName =
    values.prenom || values.nom
      ? `${values.prenom} ${values.nom}`.trim()
      : formT("preview.emptyName");

  function handleFieldChange<K extends keyof AgentFormInput>(
    field: K,
    value: AgentFormInput[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      return { ...current, [field]: undefined };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
      ? await updateAgent(locale, agentId ?? 0, parsed.data)
      : await createAgent(locale, parsed.data);

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
      setValues((current) => ({
        ...current,
        password: "",
        confirmPassword: "",
      }));

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
        router.push(`/admin/agents/${result.createdId}`);
        router.refresh();
      });
    }
  }

  async function handleDelete() {
    if (!canDelete || !agentId) {
      return;
    }

    setDeleting(true);

    const result = await deleteAgent(locale, agentId);

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
        count: result.clearedReferences ?? 0,
      }),
    });

    React.startTransition(() => {
      router.push("/admin/agents");
      router.refresh();
    });
  }

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
                  htmlFor="agent-prenom"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  {formT("fields.prenom")}
                </Label>
                <Input
                  id="agent-prenom"
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
                  htmlFor="agent-nom"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  {formT("fields.nom")}
                </Label>
                <Input
                  id="agent-nom"
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
                  htmlFor="agent-login"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  {formT("fields.login")}
                </Label>
                <Input
                  id="agent-login"
                  value={values.login}
                  onChange={(event) =>
                    handleFieldChange("login", event.target.value)
                  }
                  placeholder={formT("placeholders.login")}
                  aria-invalid={Boolean(errors.login)}
                  className={cn(
                    "h-10 rounded-lg border-border/50 bg-background text-[13px] focus-visible:ring-primary/30",
                    errors.login && "border-destructive/60",
                  )}
                />
                <FieldError message={errors.login} />
              </div>

              <div>
                <Label
                  htmlFor="agent-email"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  {formT("fields.email")}
                </Label>
                <Input
                  id="agent-email"
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
            </div>
          </InfoCard>

          <InfoCard title={formT("sections.access")}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label
                  htmlFor="agent-role"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  {formT("fields.role")}
                </Label>

                {roleLocked ? (
                  <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5 text-[13px] font-medium text-foreground">
                    {roleLabel}
                  </div>
                ) : (
                  <select
                    id="agent-role"
                    value={values.roleCode}
                    onChange={(event) =>
                      handleFieldChange("roleCode", event.target.value)
                    }
                    aria-invalid={Boolean(errors.roleCode)}
                    className={cn(
                      "h-10 w-full rounded-lg border border-border/50 bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30",
                      errors.roleCode && "border-destructive/60",
                    )}
                  >
                    {roleOptions.map((role) => (
                      <option key={role.code} value={role.code}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                )}

                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {roleLocked
                    ? isSelf
                      ? formT("hints.selfRoleLocked")
                      : formT("hints.adminRoleLocked")
                    : formT("hints.role")}
                </p>
                <FieldError message={errors.roleCode} />
              </div>

              <div>
                <Label
                  htmlFor="agent-status"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  {formT("fields.actif")}
                </Label>

                {statusLocked ? (
                  <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5 text-[13px] font-medium text-foreground">
                    {activeStatusLabel}
                  </div>
                ) : (
                  <select
                    id="agent-status"
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
                    <option value="1">{adminT("status.active")}</option>
                    <option value="0">{adminT("status.inactive")}</option>
                  </select>
                )}

                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {statusLocked
                    ? isSelf
                      ? formT("hints.selfStatusLocked")
                      : formT("hints.adminStatusLocked")
                    : formT("hints.status")}
                </p>
                <FieldError message={errors.actif} />
              </div>
            </div>
          </InfoCard>

          <InfoCard title={formT("sections.security")}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label
                  htmlFor="agent-password"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  {formT("fields.password")}
                </Label>
                <Input
                  id="agent-password"
                  type="password"
                  value={values.password}
                  onChange={(event) =>
                    handleFieldChange("password", event.target.value)
                  }
                  placeholder={formT("placeholders.password")}
                  aria-invalid={Boolean(errors.password)}
                  className={cn(
                    "h-10 rounded-lg border-border/50 bg-background text-[13px] focus-visible:ring-primary/30",
                    errors.password && "border-destructive/60",
                  )}
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {isEdit ? formT("hints.passwordEdit") : formT("hints.passwordCreate")}
                </p>
                <FieldError message={errors.password} />
              </div>

              <div>
                <Label
                  htmlFor="agent-confirm-password"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  {formT("fields.confirmPassword")}
                </Label>
                <Input
                  id="agent-confirm-password"
                  type="password"
                  value={values.confirmPassword}
                  onChange={(event) =>
                    handleFieldChange("confirmPassword", event.target.value)
                  }
                  placeholder={formT("placeholders.confirmPassword")}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  className={cn(
                    "h-10 rounded-lg border-border/50 bg-background text-[13px] focus-visible:ring-primary/30",
                    errors.confirmPassword && "border-destructive/60",
                  )}
                />
                <FieldError message={errors.confirmPassword} />
              </div>
            </div>
          </InfoCard>

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href={`/${locale}/admin/agents`}>{commonT("cancel")}</Link>
            </Button>
            <Button
              type="submit"
              disabled={submitting || (!isEdit && roleOptions.length === 0)}
            >
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
                  {displayName}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full border border-primary/25 bg-primary/12 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    {roleLabel}
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                      values.actif === "1"
                        ? "border-primary/25 bg-primary/12 text-primary"
                        : "border-border/40 bg-muted/20 text-muted-foreground",
                    )}
                  >
                    {activeStatusLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-border/30 bg-background/70 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {formT("preview.login")}
                </p>
                <p className="mt-1 text-[13px] font-medium text-foreground">
                  {values.login || formT("preview.none")}
                </p>
              </div>

              <div className="rounded-xl border border-border/30 bg-background/70 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {formT("preview.contact")}
                </p>
                <p className="mt-1 flex items-center gap-2 text-[13px] text-foreground">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="min-w-0 truncate">
                    {values.email || formT("preview.none")}
                  </span>
                </p>
              </div>

              <div className="rounded-xl border border-border/30 bg-background/70 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {formT("preview.references")}
                </p>
                <p className="mt-1 text-[13px] font-medium text-foreground">
                  {formT("preview.referencesValue", { count: linkedRecordsCount })}
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title={formT("security.title")}>
            <div className="flex items-start gap-3 text-[12px] leading-5 text-muted-foreground">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>{formT("security.description")}</p>
            </div>
          </InfoCard>

          {isProtectedAdmin ? (
            <InfoCard title={formT("protectedCard.title")} className="border-primary/20">
              <div className="flex items-start gap-3 text-[12px] leading-5 text-muted-foreground">
                <UserCog className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>{formT("protectedCard.description")}</p>
              </div>
            </InfoCard>
          ) : null}

          {isSelf ? (
            <InfoCard title={formT("selfCard.title")} className="border-accent/20">
              <div className="flex items-start gap-3 text-[12px] leading-5 text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <p>{formT("selfCard.description")}</p>
              </div>
            </InfoCard>
          ) : null}

          {canDelete ? (
            <InfoCard title={formT("deleteCard.title")} className="border-destructive/20">
              <p className="text-[12px] leading-5 text-muted-foreground">
                {formT("deleteCard.description", { count: linkedRecordsCount })}
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

          {!isProtectedAdmin && !isSelf ? (
            <InfoCard title={formT("passwordCard.title")}>
              <div className="flex items-start gap-3 text-[12px] leading-5 text-muted-foreground">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>{formT("passwordCard.description")}</p>
              </div>
            </InfoCard>
          ) : null}
        </aside>
      </form>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{formT("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {formT("deleteDialog.description", { count: linkedRecordsCount })}
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
