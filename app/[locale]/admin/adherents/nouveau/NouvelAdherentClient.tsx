// app/[locale]/admin/adherents/nouveau/NouvelAdherentClient.tsx
"use client";

import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAdminToast } from "@/components/admin/AdminToast";
import { createAdherent } from "../actions";
import {
  ArrowLeft, User, Mail, Phone, Calendar, Lock, Building2, Save,
  AlertCircle, Eye, EyeOff
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface Organisation {
  id: number;
  code: string;
  designation: string;
}

interface NouvelAdherentClientProps {
  organisations: Organisation[];
}

export function NouvelAdherentClient({ organisations }: NouvelAdherentClientProps) {
  const locale = useLocale();
  const t = useTranslations("admin");
  const { toast } = useAdminToast();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    sexe: '',
    organisationId: '',
    password: ''
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return "L'email est requis";
        if (!emailRegex.test(value)) return "Email invalide";
        return '';
      case 'password':
        if (!value) return "Le mot de passe est requis";
        if (value.length < 8) return "Au moins 8 caractères";
        return '';
      case 'nom':
      case 'prenom':
        if (!value) return "Ce champ est requis";
        return '';
      case 'dateNaissance':
        if (!value) return "La date de naissance est requise";
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        if (age < 12) return "L'adhérent doit avoir au moins 12 ans";
        if (age > 100) return "Âge invalide";
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        variant: "warning",
        title: t("toast.validationError.title"),
        description: "Veuillez corriger les erreurs dans le formulaire"
      });
      return;
    }

    setLoading(true);
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) fd.append(key, value);
    });

    const result = await createAdherent(fd);
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

    toast({ variant: "success", title: t("toast.createSuccess.title"), description: t("toast.createSuccess.desc") });
    router.push(`/${locale}/admin/adherents`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href={`/${locale}/admin/adherents`}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 text-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("adherentsUi.new.back")}
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          {t("adherentsUi.new.title")}
        </h1>
        <p className="text-slate-400 text-sm">
          {t("adherentsUi.new.infoTitle")}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-cyan-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-200">
              {t("adherentsUi.new.infoTitle")}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5" />
                  {t("adherentsUi.new.nom")}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all ${errors.nom
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20'
                    }`}
                  placeholder={t("adherentsUi.new.nom")}
                />
                {errors.nom && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.nom}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5" />
                  {t("adherentsUi.new.prenom")}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all ${errors.prenom
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20'
                    }`}
                  placeholder={t("adherentsUi.new.prenom")}
                />
                {errors.prenom && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.prenom}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Mail className="w-3.5 h-3.5" />
                  {t("adherentsUi.new.email")}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all ${errors.email
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20'
                    }`}
                  placeholder="adherent@email.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Phone className="w-3.5 h-3.5" />
                  {t("adherentsUi.new.telephone")}
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  placeholder="+213 5XX XX XX XX"
                />
              </div>
            </div>

            {/* Identity Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  {t("adherentsUi.new.birthDate")}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="dateNaissance"
                  value={formData.dateNaissance}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-1 transition-all ${errors.dateNaissance
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20'
                    }`}
                />
                {errors.dateNaissance && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.dateNaissance}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5" />
                  {t("adherentsUi.new.sexe")}
                  <span className="text-red-400">*</span>
                </label>
                <select
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-1 transition-all ${errors.sexe
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20'
                    }`}
                >
                  <option value="" disabled>Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
                {errors.sexe && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.sexe}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" />
                  {t("adherentsUi.new.organisation")}
                  <span className="text-red-400">*</span>
                </label>
                <select
                  name="organisationId"
                  value={formData.organisationId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-1 transition-all ${errors.organisationId
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20'
                    }`}
                >
                  <option value="" disabled>Sélectionner</option>
                  {organisations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.code} - {org.designation}
                    </option>
                  ))}
                </select>
                {errors.organisationId && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.organisationId}
                  </p>
                )}
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* Password */}
            <div className="max-w-md space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                {t("adherentsUi.new.motDePasseInitial")}
                <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all ${errors.password
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
              <p className="text-xs text-slate-500">
                Minimum 8 caractères
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5">
            <Link
              href={`/${locale}/admin/adherents`}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/30 hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création...
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