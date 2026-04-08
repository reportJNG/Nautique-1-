"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  CalendarDays,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  User,
  KeyRound,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Activity,
  Loader2,
  Shield,
  Fingerprint,
  Clock,
  Waves,
  Anchor,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { changePassword, updateProfile } from "./actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  profile: {
    adherent: {
      nom: string;
      prenom: string;
      email: string | null;
      telephone: string | null;
      adresse: string | null;
      numeroDossier: string;
      numeroMatricule: string | null;
      dateNaissance: Date;
      organisation: { designation: string };
    };
    stats: {
      activeAbonnements: number;
      paidFactures: number;
      acces: number;
      organisation: string;
    };
    recentActivity: Array<{
      id: string;
      title: string;
      description: string;
    }>;
  };
}

export function ProfilClient({ profile }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("espace.client.profile");
  const [profilePending, startProfileTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [profileForm, setProfileForm] = useState({
    nom: profile.adherent.nom,
    prenom: profile.adherent.prenom,
    telephone: profile.adherent.telephone ?? "",
    adresse: profile.adherent.adresse ?? "",
  });

  const [originalProfileForm, setOriginalProfileForm] = useState({
    nom: profile.adherent.nom,
    prenom: profile.adherent.prenom,
    telephone: profile.adherent.telephone ?? "",
    adresse: profile.adherent.adresse ?? "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const formRef = useRef<HTMLFormElement>(null);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges =
      profileForm.nom !== originalProfileForm.nom ||
      profileForm.prenom !== originalProfileForm.prenom ||
      profileForm.telephone !== originalProfileForm.telephone ||
      profileForm.adresse !== originalProfileForm.adresse;
    setHasUnsavedChanges(hasChanges);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [profileForm, originalProfileForm]);

  // Password strength checker
  useEffect(() => {
    const password = passwordForm.newPassword;
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback([]);
      return;
    }

    const checks = [
      {
        regex: /.{8,}/,
        message: t("passwordValidation.minLength"),
        points: 25,
      },
      {
        regex: /[A-Z]/,
        message: t("passwordValidation.uppercase"),
        points: 25,
      },
      {
        regex: /[a-z]/,
        message: t("passwordValidation.lowercase"),
        points: 25,
      },
      { regex: /[0-9]/, message: t("passwordValidation.number"), points: 25 },
    ];

    let strength = 0;
    const failed: string[] = [];
    checks.forEach(({ regex, message, points }) => {
      if (regex.test(password)) {
        strength += points;
      } else {
        failed.push(message);
      }
    });

    setPasswordStrength(strength);
    setPasswordFeedback(failed);
  }, [passwordForm.newPassword, t]);

  const initials =
    `${profile.adherent.prenom.charAt(0)}${profile.adherent.nom.charAt(0)}`.toUpperCase();

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profileForm.nom.trim() || !profileForm.prenom.trim()) {
      toast.error(t("toasts.validationError"), {
        description: t("toasts.requiredFields"),
      });
      return;
    }

    const formData = new FormData();
    Object.entries(profileForm).forEach(([key, value]) =>
      formData.set(key, value),
    );

    startProfileTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        toast.error(t("toasts.profileError"), { description: result.error });
        return;
      }

      setOriginalProfileForm({ ...profileForm });
      setHasUnsavedChanges(false);
      toast.success(t("toasts.profileSaved"), {
        description: t("toasts.profileSavedDescription"),
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      });
      router.refresh();
    });
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (passwordStrength < 100) {
      toast.error(t("toasts.passwordWeak"), {
        description: t("toasts.passwordWeakDescription"),
      });
      return;
    }

    const formData = new FormData();
    Object.entries(passwordForm).forEach(([key, value]) =>
      formData.set(key, value),
    );

    startPasswordTransition(async () => {
      const result = await changePassword(formData);
      if (result.error) {
        toast.error(t("toasts.passwordError"), { description: result.error });
        return;
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsPasswordDialogOpen(false);
      toast.success(t("toasts.passwordChanged"), {
        description: t("toasts.passwordChangedDescription"),
        icon: <Shield className="size-4 text-emerald-500" />,
      });
    });
  }

  function handleCancelChanges() {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true);
    }
  }

  function confirmCancel() {
    setProfileForm({ ...originalProfileForm });
    setHasUnsavedChanges(false);
    setShowCancelDialog(false);
    toast.info(t("toasts.changesDiscarded"), {
      description: t("toasts.changesDiscardedDescription"),
    });
  }

  function handleFieldChange(field: keyof typeof profileForm, value: string) {
    setProfileForm((state) => ({ ...state, [field]: value }));
    setTouchedFields((prev) => new Set(prev).add(field));
  }

  const isFormValid = profileForm.nom.trim() && profileForm.prenom.trim();
  const isPasswordValid =
    passwordForm.currentPassword &&
    passwordForm.newPassword &&
    passwordForm.confirmPassword &&
    passwordForm.newPassword === passwordForm.confirmPassword &&
    passwordStrength === 100;

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 100) return "bg-emerald-500";
    if (passwordStrength >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section with ocean gradient */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 shadow-xl dark:from-blue-950/40 dark:via-slate-950/60 dark:to-cyan-950/30"
      >
        {/* Decorative wave */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="relative group">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-bold text-white shadow-lg transition-all duration-300 group-hover:scale-105 dark:from-blue-400 dark:to-cyan-300">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1.5 ring-2 ring-white shadow-sm dark:ring-slate-950">
                <CheckCircle2 className="size-3 text-white" />
              </div>
            </div>
            <div>
              <Badge className="mb-2 bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-200">
                <Anchor className="mr-1 size-3" />
                {t("statusActive")}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {profile.adherent.prenom} {profile.adherent.nom}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="size-3" />
                {profile.adherent.organisation.designation} •{" "}
                {t("fileNumber", { value: profile.adherent.numeroDossier })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label={t("stats.activeSubscriptions")}
              value={String(profile.stats.activeAbonnements)}
              gradient="from-blue-500 to-cyan-500"
              icon={Activity}
            />
            <StatCard
              label={t("stats.paidInvoices")}
              value={String(profile.stats.paidFactures)}
              gradient="from-emerald-500 to-teal-500"
              icon={CreditCard}
            />
            <StatCard
              label={t("stats.recordedAccesses")}
              value={String(profile.stats.acces)}
              gradient="from-purple-500 to-pink-500"
              icon={Fingerprint}
            />
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        {/* Profile Form - Glass card */}
        <motion.form
          ref={formRef}
          onSubmit={handleProfileSubmit}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur-md transition-all duration-300 dark:border-white/10 dark:bg-slate-950/70"
        >
          <AnimatePresence>
            {hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -top-3 left-6 rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white shadow-lg"
              >
                {t("unsavedChanges")}
              </motion.div>
            )}
          </AnimatePresence>

          <SectionHeading
            icon={User}
            title={t("sections.personalInfo.title")}
            subtitle={t("sections.personalInfo.subtitle")}
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field
              label={t("fields.lastName")}
              icon={User}
              value={profileForm.nom}
              onChange={(value) => handleFieldChange("nom", value)}
              required
              error={
                touchedFields.has("nom") && !profileForm.nom.trim()
                  ? t("validation.required")
                  : undefined
              }
            />
            <Field
              label={t("fields.firstName")}
              icon={User}
              value={profileForm.prenom}
              onChange={(value) => handleFieldChange("prenom", value)}
              required
              error={
                touchedFields.has("prenom") && !profileForm.prenom.trim()
                  ? t("validation.required")
                  : undefined
              }
            />
            <ReadonlyField
              label={t("fields.email")}
              icon={Mail}
              value={profile.adherent.email ?? t("emptyValue")}
              tooltip={t("fields.emailTooltip")}
            />
            <Field
              label={t("fields.phone")}
              icon={Phone}
              value={profileForm.telephone}
              onChange={(value) => handleFieldChange("telephone", value)}
              type="tel"
              placeholder={t("fields.phonePlaceholder")}
            />
            <div className="sm:col-span-2">
              <Field
                label={t("fields.address")}
                icon={MapPin}
                value={profileForm.adresse}
                onChange={(value) => handleFieldChange("adresse", value)}
                placeholder={t("fields.addressPlaceholder")}
              />
            </div>
          </div>

          <Separator className="my-6 bg-border/50" />

          <div className="grid gap-4 sm:grid-cols-2">
            <ReadonlyField
              label={t("fields.organization")}
              icon={Building2}
              value={profile.adherent.organisation.designation}
            />
            <ReadonlyField
              label={t("fields.birthDate")}
              icon={CalendarDays}
              value={new Intl.DateTimeFormat(locale, {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(profile.adherent.dateNaissance)}
            />
            <ReadonlyField
              label={t("fields.employeeNumber")}
              icon={CreditCard}
              value={profile.adherent.numeroMatricule ?? t("emptyValue")}
            />
            <ReadonlyField
              label={t("fields.fileNumber")}
              icon={ShieldCheck}
              value={profile.adherent.numeroDossier}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <AnimatePresence>
              {hasUnsavedChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancelChanges}
                    className="h-11 rounded-2xl border border-border/50 bg-white/50 hover:bg-red-50 hover:text-red-600 dark:bg-slate-900/50 dark:hover:bg-red-950/30"
                    disabled={profilePending}
                  >
                    <X className="mr-2 size-4" />
                    {t("actions.cancel")}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              type="submit"
              className="btn-nautical h-11 rounded-2xl px-6 font-semibold shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50"
              disabled={profilePending || !isFormValid || !hasUnsavedChanges}
            >
              {profilePending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("actions.saving")}
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  {t("actions.saveProfile")}
                </>
              )}
            </Button>
          </div>
        </motion.form>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Security Card - Glass */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur-md transition-all duration-300 dark:border-white/10 dark:bg-slate-950/70"
          >
            <SectionHeading
              icon={ShieldCheck}
              title={t("sections.security.title")}
              subtitle={t("sections.security.subtitle")}
            />

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-cyan-50/80 p-4 transition-all duration-300 hover:bg-cyan-50 dark:bg-cyan-950/30 dark:hover:bg-cyan-950/50">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/20">
                    <Lock className="size-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {t("security.status")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("security.protected")}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-cyan-500 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300"
                  >
                    {t("security.active")}
                  </Badge>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setIsPasswordDialogOpen(true)}
                className="h-12 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <KeyRound className="mr-2 size-4" />
                {t("actions.changePassword")}
              </Button>

              <p className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
                <Clock className="size-3" />
                {t("passwordHint")}
              </p>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-950/70"
          >
            <SectionHeading
              icon={Activity}
              title={t("sections.recentActivity.title")}
              subtitle={t("sections.recentActivity.subtitle")}
            />
            <div className="mt-6 space-y-3">
              {profile.recentActivity.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <div className="rounded-full bg-cyan-100 p-3 dark:bg-cyan-950/40">
                    <Waves className="size-6 text-cyan-500" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t("noRecentActivity")}
                  </p>
                </motion.div>
              ) : (
                profile.recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="group rounded-2xl border border-white/30 bg-white/40 p-4 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-md dark:border-white/10 dark:bg-slate-900/30"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {activity.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>
        </div>
      </div>

      {/* Password Change Dialog - Glass style */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-md overflow-hidden rounded-3xl border border-white/30 bg-white/90 p-0 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
          <div className="p-6">
            <DialogHeader className="space-y-3">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20">
                  <KeyRound className="size-5 text-amber-600 dark:text-amber-400" />
                </div>
                {t("passwordDialog.title")}
              </DialogTitle>
              <DialogDescription className="text-base">
                {t("passwordDialog.description")}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5 px-6 pb-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t("passwordFields.current")}
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((state) => ({
                      ...state,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="h-11 rounded-2xl pr-10 focus:ring-2 focus:ring-amber-500/20"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={
                    showCurrentPassword
                      ? t("passwordToggle.hide")
                      : t("passwordToggle.show")
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t("passwordFields.new")}
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((state) => ({
                      ...state,
                      newPassword: e.target.value,
                    }))
                  }
                  className="h-11 rounded-2xl pr-10 focus:ring-2 focus:ring-amber-500/20"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={
                    showNewPassword
                      ? t("passwordToggle.hide")
                      : t("passwordToggle.show")
                  }
                >
                  {showNewPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {passwordForm.newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {t("passwordStrength")}
                    </span>
                    <span className="font-medium">
                      {passwordStrength === 100 && (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {t("strong")}
                        </span>
                      )}
                      {passwordStrength >= 50 && passwordStrength < 100 && (
                        <span className="text-amber-600 dark:text-amber-400">
                          {t("medium")}
                        </span>
                      )}
                      {passwordStrength < 50 && (
                        <span className="text-red-600 dark:text-red-400">
                          {t("weak")}
                        </span>
                      )}
                    </span>
                  </div>
                  <Progress
                    value={passwordStrength}
                    className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                  />
                  {passwordFeedback.length > 0 && passwordStrength < 100 && (
                    <div className="mt-3 space-y-1.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                      {passwordFeedback.map((feedback, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300"
                        >
                          <AlertCircle className="size-3 shrink-0" />
                          {feedback}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t("passwordFields.confirm")}
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((state) => ({
                      ...state,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="h-11 rounded-2xl pr-10 focus:ring-2 focus:ring-amber-500/20"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={
                    showConfirmPassword
                      ? t("passwordToggle.hide")
                      : t("passwordToggle.show")
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {passwordForm.confirmPassword &&
                passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center gap-1 text-xs text-red-500"
                  >
                    <AlertCircle className="size-3" />
                    {t("passwordValidation.match")}
                  </motion.p>
                )}
            </div>

            <DialogFooter className="gap-2 pt-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                className="rounded-2xl"
              >
                {t("actions.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={passwordPending || !isPasswordValid}
                className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50"
              >
                {passwordPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t("actions.updatingPassword")}
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 size-4" />
                    {t("actions.changePassword")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">
              {t("actions.keepEditing")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="rounded-2xl bg-red-500 text-white hover:bg-red-600"
            >
              {t("actions.discard")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ========== Helper Components with Nautical styling ==========

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 text-cyan-700 shadow-sm dark:text-cyan-300">
        <Icon className="size-5" />
      </div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder,
  error,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 rounded-2xl border-border/50 bg-white/50 transition-all duration-200 focus:ring-2 focus:ring-cyan-500/20 dark:bg-slate-900/50 ${
          error ? "border-red-500 focus:ring-red-500/20" : ""
        }`}
        required={required}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
      />
      {error && (
        <p
          id={`${label}-error`}
          className="mt-1 flex items-center gap-1 text-xs text-red-500"
        >
          <AlertCircle className="size-3" />
          {error}
        </p>
      )}
    </label>
  );
}

function ReadonlyField({
  label,
  icon: Icon,
  value,
  tooltip,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  tooltip?: string;
}) {
  return (
    <div className="group">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
        {tooltip && (
          <span
            className="cursor-help text-muted-foreground/70"
            title={tooltip}
          >
            ⓘ
          </span>
        )}
      </div>
      <div className="flex h-11 items-center rounded-2xl border border-border/50 bg-slate-50/50 px-4 text-sm text-foreground shadow-sm dark:bg-slate-900/50">
        {value}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  gradient,
  icon: Icon,
}: {
  label: string;
  value: string;
  gradient: string;
  icon: React.ElementType;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/50 p-4 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/30"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 transition-opacity duration-300 group-hover:opacity-10`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className="rounded-xl bg-white/50 p-2 dark:bg-slate-900/50">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>
    </motion.div>
  );
}
