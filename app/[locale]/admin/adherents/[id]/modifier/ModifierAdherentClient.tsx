"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  Save,
  Loader2,
  Hash,
  MapPin,
  Award,
  AtSign,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

interface Organisation {
  id: number;
  designation: string;
  code: string;
}

interface Adherent {
  id: number;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  dateNaissance: Date;
  sexe: string;
  adresse: string | null;
  numeroDossier: string;
  numeroMatricule: string | null;
  organisationId: number;
  actif: number;
}

interface Props {
  adherent: Adherent;
  organisations: Organisation[];
  locale: string;
}

export function ModifierAdherentClient({
  adherent,
  organisations,
  locale,
}: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const [form, setForm] = useState({
    nom: adherent.nom,
    prenom: adherent.prenom,
    email: adherent.email ?? "",
    telephone: adherent.telephone ?? "",
    dateNaissance: new Date(adherent.dateNaissance).toISOString().split("T")[0],
    sexe: adherent.sexe,
    adresse: adherent.adresse ?? "",
    numeroMatricule: adherent.numeroMatricule ?? "",
    organisationId: String(adherent.organisationId),
    actif: String(adherent.actif),
    password: "",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const body: Record<string, unknown> = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email || null,
        telephone: form.telephone || null,
        dateNaissance: form.dateNaissance,
        sexe: form.sexe,
        adresse: form.adresse || null,
        numeroMatricule: form.numeroMatricule || null,
        organisationId: Number.parseInt(form.organisationId, 10),
        actif: Number.parseInt(form.actif, 10),
      };

      if (form.password) {
        body.password = form.password;
      }

      const response = await fetch(`/api/admin/adherents/${adherent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("adherentsUi.edit.unknownError"));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/admin/adherents/${adherent.id}`);
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("adherentsUi.edit.unknownError"));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-card/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:bg-card/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
  const labelClass =
    "mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

  const sections = [
    {
      id: "identity",
      icon: User,
      title: t("adherentsUi.edit.sections.identity.title"),
      subtitle: t("adherentsUi.edit.sections.identity.subtitle"),
      gradient: "from-primary to-primary/80",
    },
    {
      id: "contact",
      icon: Mail,
      title: t("adherentsUi.edit.sections.contact.title"),
      subtitle: t("adherentsUi.edit.sections.contact.subtitle"),
      gradient: "from-primary to-primary/80",
    },
    {
      id: "organisation",
      icon: Building2,
      title: t("adherentsUi.edit.sections.organisation.title"),
      subtitle: t("adherentsUi.edit.sections.organisation.subtitle"),
      gradient: "from-primary to-primary/80",
    },
    {
      id: "security",
      icon: ShieldCheck,
      title: t("adherentsUi.edit.sections.security.title"),
      subtitle: t("adherentsUi.edit.sections.security.subtitle"),
      gradient: "from-primary to-primary/80",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/90 via-card/80 to-card/90 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/10" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-pulse delay-1000" />

        <div className="relative p-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary blur-xl opacity-50" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-2xl font-bold text-primary-foreground shadow-xl ring-4 ring-primary/30">
                {adherent.prenom[0]}
                {adherent.nom[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-border bg-primary">
                <CheckCircle className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-2xl font-bold text-transparent">
                  {adherent.prenom} {adherent.nom}
                </h1>
                <span
                  className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                    Number.parseInt(form.actif, 10) === 1
                      ? "border-primary/30 bg-primary/20 text-primary"
                      : "border-destructive/30 bg-destructive/20 text-destructive"
                  }`}
                >
                  {Number.parseInt(form.actif, 10) === 1
                    ? t("adherentsUi.edit.status.active")
                    : t("adherentsUi.edit.status.inactive")}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" />
                  {adherent.numeroDossier}
                </span>
                {adherent.numeroMatricule && (
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    {adherent.numeroMatricule}
                  </span>
                )}
              </div>
            </div>

            <div className="hidden text-right sm:block">
              <div className="text-xs uppercase tracking-wider text-muted-foreground/60">
                {t("adherentsUi.edit.memberSinceLabel")}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">
                {new Date(adherent.dateNaissance).getFullYear()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="relative overflow-hidden rounded-xl border border-destructive/30 bg-gradient-to-r from-destructive/10 to-destructive/10 p-4 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-destructive/20 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/10 p-4 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 animate-pulse">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-medium text-primary">
              {t("adherentsUi.edit.successMessage")}
            </p>
          </div>
        </div>
      )}

      {sections.map((section) => (
        <div
          key={section.id}
          className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border/50"
          onMouseEnter={() => setActiveSection(section.id)}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-r ${section.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
          />

          <div className="relative">
            <div className="flex items-center justify-between border-b border-border/50 bg-card/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${section.gradient} opacity-20 transition-transform duration-300 group-hover:scale-110`}
                >
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {section.title}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground/60">
                    {section.subtitle}
                  </p>
                </div>
              </div>
              {activeSection === section.id && (
                <ChevronRight className="h-4 w-4 animate-pulse text-muted-foreground/60" />
              )}
            </div>

            <div className="p-6">
              {section.id === "identity" && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      {t("adherentsUi.edit.fields.firstName")}
                    </label>
                    <input
                      name="prenom"
                      value={form.prenom}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder={t("adherentsUi.edit.placeholders.firstName")}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("adherentsUi.edit.fields.lastName")}
                    </label>
                    <input
                      name="nom"
                      value={form.nom}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder={t("adherentsUi.edit.placeholders.lastName")}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {t("adherentsUi.edit.fields.birthDate")}
                      </span>
                    </label>
                    <input
                      type="date"
                      name="dateNaissance"
                      value={form.dateNaissance}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-2">
                        <Award className="h-3 w-3" />
                        {t("adherentsUi.edit.fields.gender")}
                      </span>
                    </label>
                    <select
                      name="sexe"
                      value={form.sexe}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="M">{t("adherentsUi.edit.genderOptions.M")}</option>
                      <option value="F">{t("adherentsUi.edit.genderOptions.F")}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-2">
                        <Hash className="h-3 w-3" />
                        {t("adherentsUi.edit.fields.employeeNumber")}
                      </span>
                    </label>
                    <input
                      name="numeroMatricule"
                      value={form.numeroMatricule}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder={t("adherentsUi.edit.placeholders.employeeNumber")}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("adherentsUi.edit.fields.status")}
                    </label>
                    <select
                      name="actif"
                      value={form.actif}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="1">{t("adherentsUi.edit.status.activeOption")}</option>
                      <option value="0">{t("adherentsUi.edit.status.inactiveOption")}</option>
                    </select>
                  </div>
                </div>
              )}

              {section.id === "contact" && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-2">
                        <AtSign className="h-3 w-3" />
                        {t("adherentsUi.edit.fields.email")}
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder={t("adherentsUi.edit.placeholders.email")}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {t("adherentsUi.edit.fields.phone")}
                      </span>
                    </label>
                    <input
                      name="telephone"
                      value={form.telephone}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder={t("adherentsUi.edit.placeholders.phone")}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <span className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {t("adherentsUi.edit.fields.address")}
                      </span>
                    </label>
                    <textarea
                      name="adresse"
                      value={form.adresse}
                      onChange={handleChange}
                      rows={3}
                      className={`${inputClass} resize-none`}
                      placeholder={t("adherentsUi.edit.placeholders.address")}
                    />
                  </div>
                </div>
              )}

              {section.id === "organisation" && (
                <div>
                  <label className={labelClass}>
                    {t("adherentsUi.edit.fields.organisation")}
                  </label>
                  <select
                    name="organisationId"
                    value={form.organisationId}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    {organisations.map((organisation) => (
                      <option key={organisation.id} value={organisation.id}>
                        [{organisation.code}] {organisation.designation}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-muted-foreground/60">
                    {t("adherentsUi.edit.organisationHint")}
                  </p>
                </div>
              )}

              {section.id === "security" && (
                <div>
                  <label className={labelClass}>
                    {t("adherentsUi.edit.fields.newPassword")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className={`${inputClass} pr-12`}
                      placeholder={t("adherentsUi.edit.placeholders.newPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground/60">
                    <ShieldCheck className="h-3 w-3" />
                    {t("adherentsUi.edit.passwordHint")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="sticky bottom-6 flex justify-end gap-3 pb-2 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="group relative overflow-hidden rounded-xl border border-border bg-card/50 px-6 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-destructive/0 via-destructive/5 to-destructive/0 transition-all duration-500 group-hover:from-destructive/10 group-hover:via-destructive/5 group-hover:to-destructive/0" />
          <span className="relative flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            {t("adherentsUi.edit.cancel")}
          </span>
        </button>

        <button
          type="submit"
          disabled={loading || success}
          className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 px-8 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:from-primary/90 hover:to-primary/70 hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-primary/30"
        >
          <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/10 to-white/0 transition-transform duration-1000 group-hover:translate-x-[100%]" />
          <span className="relative flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? t("adherentsUi.edit.saving") : t("adherentsUi.edit.save")}
          </span>
        </button>
      </div>
    </form>
  );
}
