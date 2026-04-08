"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Building2,
  Save,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useAdminToast } from "@/components/admin/AdminToast";
import { createAdherent } from "../actions";

interface Organisation {
  id: number;
  code: string;
  designation: string;
}

interface NouvelAdherentClientProps {
  organisations: Organisation[];
}

export function NouvelAdherentClient({
  organisations,
}: NouvelAdherentClientProps) {
  const locale = useLocale();
  const t = useTranslations("admin");
  const { toast } = useAdminToast();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    dateNaissance: "",
    sexe: "",
    organisationId: "",
    password: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return t("adherentsUi.new.validation.emailRequired");
        if (!emailRegex.test(value)) return t("adherentsUi.new.validation.emailInvalid");
        return "";
      }
      case "password":
        if (!value) return t("adherentsUi.new.validation.passwordRequired");
        if (value.length < 8) return t("adherentsUi.new.validation.passwordMin");
        return "";
      case "nom":
      case "prenom":
      case "organisationId":
      case "sexe":
        if (!value) return t("adherentsUi.new.validation.required");
        return "";
      case "dateNaissance": {
        if (!value) return t("adherentsUi.new.validation.birthDateRequired");
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        if (age < 12) return t("adherentsUi.new.validation.minAge");
        if (age > 100) return t("adherentsUi.new.validation.maxAge");
        return "";
      }
      default:
        return "";
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        variant: "warning",
        title: t("toast.validationError.title"),
        description: t("adherentsUi.new.formErrorDescription"),
      });
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        formDataToSend.append(key, value);
      }
    });

    const result = await createAdherent(formDataToSend);
    setLoading(false);

    if (result?.error) {
      const isEmail = result.error.toLowerCase().includes("email");
      toast({
        variant: "error",
        title: isEmail ? t("toast.emailExists.title") : t("toast.createError.title"),
        description: isEmail ? t("toast.emailExists.desc") : result.error,
      });
      return;
    }

    toast({
      variant: "success",
      title: t("toast.createSuccess.title"),
      description: t("toast.createSuccess.desc"),
    });
    router.push("/admin/adherents");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href={`/${locale}/admin/adherents`}
        className="inline-flex items-center gap-2 rounded-lg border border-border/30 bg-muted/20 px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("adherentsUi.new.back")}
      </Link>

      <div className="space-y-2">
        <h1 className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-3xl font-bold text-transparent">
          {t("adherentsUi.new.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("adherentsUi.new.infoTitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 border-b border-border/30 bg-muted/20 px-6 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              {t("adherentsUi.new.infoTitle")}
            </h2>
          </div>

          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  {t("adherentsUi.new.nom")}
                  <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-1 ${
                    errors.nom
                      ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                      : "border-border/30 focus:border-primary/50 focus:ring-primary/20"
                  }`}
                  placeholder={t("adherentsUi.new.nom")}
                />
                {errors.nom && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.nom}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  {t("adherentsUi.new.prenom")}
                  <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-1 ${
                    errors.prenom
                      ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                      : "border-border/30 focus:border-primary/50 focus:ring-primary/20"
                  }`}
                  placeholder={t("adherentsUi.new.prenom")}
                />
                {errors.prenom && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.prenom}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {t("adherentsUi.new.email")}
                  <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-1 ${
                    errors.email
                      ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                      : "border-border/30 focus:border-primary/50 focus:ring-primary/20"
                  }`}
                  placeholder={t("adherentsUi.new.placeholders.email")}
                />
                {errors.email && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {t("adherentsUi.new.telephone")}
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border/30 bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder={t("adherentsUi.new.placeholders.phone")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {t("adherentsUi.new.birthDate")}
                  <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  name="dateNaissance"
                  value={formData.dateNaissance}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-muted/20 px-3 py-2 text-sm text-foreground transition-all focus:outline-none focus:ring-1 ${
                    errors.dateNaissance
                      ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                      : "border-border/30 focus:border-primary/50 focus:ring-primary/20"
                  }`}
                />
                {errors.dateNaissance && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.dateNaissance}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  {t("adherentsUi.new.sexe")}
                  <span className="text-destructive">*</span>
                </label>
                <select
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-muted/20 px-3 py-2 text-sm text-foreground transition-all focus:outline-none focus:ring-1 ${
                    errors.sexe
                      ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                      : "border-border/30 focus:border-primary/50 focus:ring-primary/20"
                  }`}
                >
                  <option value="" disabled>
                    {t("adherentsUi.new.select")}
                  </option>
                  <option value="M">{t("adherentsUi.new.sexeOptions.M")}</option>
                  <option value="F">{t("adherentsUi.new.sexeOptions.F")}</option>
                </select>
                {errors.sexe && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.sexe}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  {t("adherentsUi.new.organisation")}
                  <span className="text-destructive">*</span>
                </label>
                <select
                  name="organisationId"
                  value={formData.organisationId}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-muted/20 px-3 py-2 text-sm text-foreground transition-all focus:outline-none focus:ring-1 ${
                    errors.organisationId
                      ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                      : "border-border/30 focus:border-primary/50 focus:ring-primary/20"
                  }`}
                >
                  <option value="" disabled>
                    {t("adherentsUi.new.select")}
                  </option>
                  {organisations.map((organisation) => (
                    <option key={organisation.id} value={organisation.id}>
                      {organisation.code} - {organisation.designation}
                    </option>
                  ))}
                </select>
                {errors.organisationId && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.organisationId}
                  </p>
                )}
              </div>
            </div>

            <div className="h-px bg-border/30" />

            <div className="max-w-md space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                {t("adherentsUi.new.motDePasseInitial")}
                <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-1 ${
                    errors.password
                      ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                      : "border-border/30 focus:border-primary/50 focus:ring-primary/20"
                  }`}
                  placeholder={t("adherentsUi.new.placeholders.password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
              <p className="text-xs text-muted-foreground/50">
                {t("adherentsUi.new.passwordHint")}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border/30 bg-muted/20 px-6 py-4">
            <Link
              href={`/${locale}/admin/adherents`}
              className="rounded-lg border border-border/30 bg-muted/20 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground"
            >
              {t("adherentsUi.new.cancel")}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-6 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  {t("adherentsUi.new.creating")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t("adherentsUi.new.submit")}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
