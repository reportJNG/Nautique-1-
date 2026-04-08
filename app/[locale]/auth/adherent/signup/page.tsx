"use client";
import { useState, useRef, useEffect, type ChangeEvent, } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Waves, Eye, EyeOff, ArrowLeft, User, Mail, Phone, MapPin, Lock, IdCard, CalendarDays, Loader2, AlertCircle, Check, X, } from "lucide-react";
import { signupAction } from "./actions";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { adherentSignupSchema, type AdherentSignupInput } from "@/lib/validators/auth";
import { ThemeToggle } from "@/components/theme-toggle";

type AdherentSignupFieldErrors = Partial<Record<keyof AdherentSignupInput, string>>;
function FieldError({ message }: {
  message: string;
}) {
  return (<motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="flex items-center gap-1.5 text-xs font-medium text-destructive">
    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
    {message}
  </motion.p>);
}
function PasswordStrength({ password }: {
  password: string;
}) {
  const t = useTranslations("auth");
  if (!password)
    return null;
  const checks = [
    { label: t("adherentSignup.passwordChecks.length"), ok: password.length >= 8 },
    { label: t("adherentSignup.passwordChecks.uppercase"), ok: /[A-Z]/.test(password) },
    { label: t("adherentSignup.passwordChecks.number"), ok: /[0-9]/.test(password) },
  ];
  const passed = checks.filter((c) => c.ok).length;
  const color = passed === 0 ? "bg-destructive" :
    passed === 1 ? "bg-orange-400" :
      passed === 2 ? "bg-yellow-400" :
        "bg-primary";
  return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">

    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (<div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passed ? color : "bg-muted"}`} />))}
    </div>

    <div className="flex flex-wrap gap-2">
      {checks.map((c) => (<span key={c.label} className={`flex items-center gap-1 text-xs transition-colors ${c.ok ? "text-primary" : "text-muted-foreground"}`}>
        {c.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
        {c.label}
      </span>))}
    </div>
  </motion.div>);
}
function inputClass(hasError: boolean) {
  return `border-2 transition-all duration-200 focus:ring-4 ${hasError
    ? "border-destructive focus:border-destructive focus:ring-destructive/15"
    : "border-border focus:border-primary focus:ring-primary/15"}`;
}
export default function AdherentSignupPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AdherentSignupFieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AdherentSignupInput, boolean>>>({});
  const [formData, setFormData] = useState<AdherentSignupInput>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    sexe: "M" as const,
    dateNaissance: "",
    adresse: "",
    numeroMatricule: "",
    password: "",
    confirmPassword: "",
  });
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);
  const validate = (name: keyof AdherentSignupInput, value: string): string => {
    const result = adherentSignupSchema.shape[name].safeParse(value);
    if (!result.success) {
      return result.error.issues[0]?.message || "";
    }
    return "";
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === 'email') {
      sanitizedValue = value.toLowerCase().slice(0, 100);
    } else if (name === 'nom' || name === 'prenom') {
      sanitizedValue = value.replace(/[^a-zA-Z\s\-']/g, '').slice(0, 50);
    } else if (name === 'telephone') {
      sanitizedValue = value.replace(/[^\d\+\s\-\(\)]/g, '').slice(0, 20);
    } else if (name === 'numeroMatricule') {
      sanitizedValue = value.replace(/[^a-zA-Z0-9\-]/g, '').toUpperCase().slice(0, 20);
    } else if (name === 'adresse') {
      sanitizedValue = value.slice(0, 200);
    } else if (name === 'password' || name === 'confirmPassword') {
      sanitizedValue = value.slice(0, 128);
    } else {
      sanitizedValue = value;
    }

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    if (fieldErrors[name as keyof AdherentSignupInput]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  const handleBlur = (name: keyof AdherentSignupInput) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };
  const getError = (name: keyof AdherentSignupInput) => {
    if (fieldErrors[name])
      return fieldErrors[name]!;
    if (!touched[name])
      return "";
    return validate(name, formData[name] || "");
  };
  const handleGoBack = () => {
    router.push(`/`);
  };
  async function handleSubmit() {
    const required: (keyof AdherentSignupInput)[] = [
      "nom", "prenom", "email", "sexe", "dateNaissance", "password", "confirmPassword",
    ];
    const newTouched = Object.fromEntries(required.map((k) => [k, true]));
    setTouched((prev) => ({ ...prev, ...newTouched }));

    const result = adherentSignupSchema.safeParse(formData);
    if (!result.success) {
      const errors: AdherentSignupFieldErrors = {};
      result.error.issues.forEach((error) => {
        if (error.path.length > 0) {
          errors[error.path[0] as keyof AdherentSignupInput] = error.message;
        }
      });
      setFieldErrors(errors);
      toast.error(t("adherentSignup.notifications.incomplete.title"), {
        description: t("adherentSignup.notifications.incomplete.message"),
        duration: 5000,
      });
      return;
    }

    setIsPending(true);
    setFieldErrors({});
    try {
      const sanitizedFd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'email') {
          sanitizedFd.set(key, value.trim().toLowerCase());
        } else if (key === 'nom' || key === 'prenom') {
          sanitizedFd.set(key, value.trim());
        } else if (key === 'numeroMatricule') {
          sanitizedFd.set(key, value.trim().toUpperCase());
        } else {
          sanitizedFd.set(key, value);
        }
      });
      const signupResult = await signupAction(sanitizedFd);
      if ("error" in signupResult) {
        if (signupResult.fieldErrors)
          setFieldErrors(signupResult.fieldErrors as Partial<AdherentSignupInput>);
        toast.error(t("adherentSignup.notifications.failed.title"), {
          description: signupResult.error,
          duration: 5000,
        });
        setIsPending(false);
      }
      else {
        toast.success(t("adherentSignup.notifications.success.title"), {
          description:
            signupResult.message || t("adherentSignup.notifications.success.message"),
          duration: 5000,
        });
        setTimeout(() => {
          setIsNavigating(true);
          router.push("/espace");
        }, 1500);
      }
    }
    catch {
      toast.error(t("adherentSignup.notifications.unexpected.title"), {
        description: t("adherentSignup.notifications.unexpected.message"),
        duration: 5000,
      });
      setIsPending(false);
    }
  }
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };
  const itemVariants: Variants = {
    hidden: { y: 14, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 14 },
    },
  };
  if (isNavigating) {
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
      <div className="flex flex-col items-center gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-14 w-14 rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">
          {t("adherentSignup.loading")}
        </p>
      </div>
    </motion.div>);
  }
  return (<div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">

    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/10 to-primary/10 blur-3xl" />
    </div>
    <div className="fixed right-4 top-4 z-20 sm:right-8 sm:top-8">
      <ThemeToggle />
    </div>

    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="fixed left-4 top-4 z-20 sm:left-8 sm:top-8">
      <button onClick={handleGoBack} className="group flex cursor-pointer items-center gap-2 rounded-xl bg-card/80 px-4 py-2 text-sm font-medium text-foreground shadow-md backdrop-blur-sm transition-all duration-200 hover:gap-3 hover:bg-card hover:shadow-lg">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="hidden sm:inline">{t("adherentSignup.back")}</span>
      </button>
    </motion.div>


    <div className="relative flex min-h-screen items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-lg">
        <Card className="overflow-hidden border-0 bg-card/85 shadow-2xl backdrop-blur-xl">

          <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/80 to-primary" />

          <CardHeader className="space-y-4 pb-6 pt-8 text-center">
            <motion.div variants={itemVariants} className="flex justify-center">
              <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-3 shadow-lg shadow-primary/25">
                <Waves className="h-10 w-10 text-primary-foreground" />
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h1 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-2xl font-bold text-transparent">
                {t("signup")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("adherentSignup.subtitle")}
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-8">
            <form ref={formRef} action={handleSubmit} className="space-y-4" noValidate>

              <motion.p variants={itemVariants} className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("adherentSignup.sections.identity")}
              </motion.p>


              <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="nom" className="text-sm font-semibold text-foreground">
                    {t("adherentSignup.fields.nom")} <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${getError("nom") ? "text-destructive" : "text-muted-foreground"}`} />
                    <Input ref={firstInputRef} id="nom" name="nom" required placeholder={t("adherentSignup.placeholders.nom")} value={formData.nom} onChange={handleChange} onBlur={() => handleBlur("nom")} disabled={isPending} autoComplete="family-name" autoCapitalize="words" className={`pl-10 ${inputClass(!!getError("nom"))}`} />
                  </div>
                  <AnimatePresence>
                    {getError("nom") && <FieldError message={getError("nom")} />}
                  </AnimatePresence>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prenom" className="text-sm font-semibold text-foreground">
                    {t("adherentSignup.fields.prenom")} <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${getError("prenom") ? "text-destructive" : "text-muted-foreground"}`} />
                    <Input id="prenom" name="prenom" required placeholder={t("adherentSignup.placeholders.prenom")} value={formData.prenom} onChange={handleChange} onBlur={() => handleBlur("prenom")} disabled={isPending} autoComplete="given-name" autoCapitalize="words" className={`pl-10 ${inputClass(!!getError("prenom"))}`} />
                  </div>
                  <AnimatePresence>
                    {getError("prenom") && <FieldError message={getError("prenom")} />}
                  </AnimatePresence>
                </div>
              </motion.div>


              <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sexe" className="text-sm font-semibold text-foreground">
                    {t("adherentSignup.fields.sexe")} <span className="text-destructive">*</span>
                  </Label>
                  <select id="sexe" name="sexe" required value={formData.sexe} onChange={handleChange} onBlur={() => handleBlur("sexe")} disabled={isPending} className={`flex h-10 w-full rounded-md px-3 py-2 text-sm bg-background text-foreground border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${getError("sexe")
                    ? "border-destructive focus:border-destructive focus:ring-destructive/15"
                    : "border-border focus:border-primary focus:ring-primary/15"}`}>
                    <option value="">{t("adherentSignup.placeholders.select")}</option>
                    <option value="M">{t("adherentSignup.options.male")}</option>
                    <option value="F">{t("adherentSignup.options.female")}</option>
                  </select>
                  <AnimatePresence>
                    {getError("sexe") && <FieldError message={getError("sexe")} />}
                  </AnimatePresence>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dateNaissance" className="text-sm font-semibold text-foreground">
                    {t("adherentSignup.fields.dateNaissance")} <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <CalendarDays className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${getError("dateNaissance") ? "text-destructive" : "text-muted-foreground"}`} />
                    <Input id="dateNaissance" name="dateNaissance" type="date" required value={formData.dateNaissance} onChange={handleChange} onBlur={() => handleBlur("dateNaissance")} disabled={isPending} max={new Date().toISOString().split('T')[0]} className={`pl-10 ${inputClass(!!getError("dateNaissance"))}`} />
                  </div>
                  <AnimatePresence>
                    {getError("dateNaissance") && <FieldError message={getError("dateNaissance")} />}
                  </AnimatePresence>
                </div>
              </motion.div>


              <motion.p variants={itemVariants} className="pt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("adherentSignup.sections.contact")}
              </motion.p>


              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  {t("adherentSignup.fields.email")} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${getError("email") ? "text-destructive" : "text-muted-foreground"}`} />
                  <Input id="email" name="email" type="email" required placeholder={t("adherentSignup.placeholders.email")} value={formData.email} onChange={handleChange} onBlur={() => handleBlur("email")} disabled={isPending} autoComplete="email" autoCapitalize="off" autoCorrect="off" spellCheck={false} className={`pl-10 ${inputClass(!!getError("email"))}`} />
                </div>
                <AnimatePresence>
                  {getError("email") && <FieldError message={getError("email")} />}
                </AnimatePresence>
              </motion.div>


              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="telephone" className="text-sm font-semibold text-foreground">
                  {t("adherentSignup.fields.telephone")}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">({t("adherentSignup.optional")})</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="telephone" name="telephone" type="tel" placeholder={t("adherentSignup.placeholders.telephone")} value={formData.telephone} onChange={handleChange} onBlur={() => handleBlur("telephone")} disabled={isPending} autoComplete="tel" className={`pl-10 ${inputClass(!!getError("telephone"))}`} />
                </div>
                <AnimatePresence>
                  {getError("telephone") && <FieldError message={getError("telephone")} />}
                </AnimatePresence>
              </motion.div>


              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="adresse" className="text-sm font-semibold text-foreground">
                  {t("adherentSignup.fields.adresse")}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">({t("adherentSignup.optional")})</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="adresse" name="adresse" placeholder={t("adherentSignup.placeholders.adresse")} value={formData.adresse} onChange={handleChange} disabled={isPending} autoComplete="street-address" className={`pl-10 ${inputClass(false)}`} />
                </div>
              </motion.div>


              <motion.p variants={itemVariants} className="pt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("adherentSignup.sections.sonatrach")}
              </motion.p>


              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="numeroMatricule" className="text-sm font-semibold text-foreground">
                  {t("adherentSignup.fields.numeroMatricule")}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">({t("adherentSignup.ifEmployee")})</span>
                </Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="numeroMatricule" name="numeroMatricule" placeholder={t("adherentSignup.placeholders.numeroMatricule")} value={formData.numeroMatricule} onChange={handleChange} disabled={isPending} className={`pl-10 ${inputClass(false)}`} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("adherentSignup.matriculeHint")}
                </p>
              </motion.div>


              <motion.p variants={itemVariants} className="pt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("adherentSignup.sections.security")}
              </motion.p>


              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  {t("adherentSignup.fields.password")} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${getError("password") ? "text-destructive" : "text-muted-foreground"}`} />
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" value={formData.password} onChange={handleChange} onBlur={() => handleBlur("password")} disabled={isPending} autoComplete="new-password" className={`pl-10 pr-11 ${inputClass(!!getError("password"))}`} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} disabled={isPending} aria-label={showPassword ? t("adherentSignup.hide") : t("adherentSignup.show")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {getError("password") && touched.password && (<FieldError message={getError("password")} />)}
                </AnimatePresence>
                {formData.password && (<PasswordStrength password={formData.password} />)}
              </motion.div>


              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                  {t("adherentSignup.fields.confirmPassword")} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${getError("confirmPassword") ? "text-destructive" : "text-muted-foreground"}`} />
                  <Input id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"} required placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} onBlur={() => handleBlur("confirmPassword")} disabled={isPending} autoComplete="new-password" className={`pl-10 pr-11 ${inputClass(!!getError("confirmPassword"))}`} />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} disabled={isPending} aria-label={showConfirm ? t("adherentSignup.hide") : t("adherentSignup.show")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {getError("confirmPassword") && touched.confirmPassword && (<FieldError message={getError("confirmPassword")} />)}
                </AnimatePresence>

                <AnimatePresence>
                  {formData.confirmPassword && formData.password && (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`flex items-center gap-1.5 text-xs font-medium ${formData.confirmPassword === formData.password
                    ? "text-primary"
                    : "text-destructive"}`}>
                    {formData.confirmPassword === formData.password ? (<><Check className="h-3.5 w-3.5" /> {t("adherentSignup.passwords.match")}</>) : (<><X className="h-3.5 w-3.5" /> {t("adherentSignup.passwords.mismatch")}</>)}
                  </motion.span>)}
                </AnimatePresence>
              </motion.div>


              <motion.div variants={itemVariants} className="pt-2">
                <Button type="submit" disabled={isPending} className="relative w-full cursor-pointer overflow-hidden bg-gradient-to-r from-primary to-primary/80 py-6 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100">
                  {isPending ? (<span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("adherentSignup.submitting")}
                  </span>) : (t("register"))}
                </Button>
              </motion.div>
            </form>


            <motion.div variants={itemVariants} className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card/80 px-3 text-muted-foreground backdrop-blur-sm">
                  {t("adherentSignup.or")}
                </span>
              </div>
            </motion.div>


            <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground">
              {t("hasAccount")}{" "}
              <Link href={`/${locale}/auth/adherent/login`} className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline">
                {t("login")}
              </Link>
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </div>);
}
