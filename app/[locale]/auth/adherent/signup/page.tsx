"use client";
import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent, } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Waves, Eye, EyeOff, ArrowLeft, User, Mail, Phone, MapPin, Lock, IdCard, CalendarDays, Loader2, AlertCircle, Check, X, } from "lucide-react";
import { signupAction, type SignupFieldErrors } from "./actions";
import { motion, AnimatePresence, type Variants } from "framer-motion";
type FormFields = {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    sexe: string;
    dateNaissance: string;
    adresse: string;
    numeroMatricule: string;
    password: string;
    confirmPassword: string;
};
function FieldError({ message }: {
    message: string;
}) {
    return (<motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400">
      <AlertCircle className="h-3.5 w-3.5 shrink-0"/>
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
    const color = passed === 0 ? "bg-red-400" :
        passed === 1 ? "bg-orange-400" :
            passed === 2 ? "bg-yellow-400" :
                "bg-emerald-500";
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
      
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (<div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passed ? color : "bg-gray-200 dark:bg-gray-700"}`}/>))}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {checks.map((c) => (<span key={c.label} className={`flex items-center gap-1 text-xs transition-colors ${c.ok ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}>
            {c.ok ? <Check className="h-3 w-3"/> : <X className="h-3 w-3"/>}
            {c.label}
          </span>))}
      </div>
    </motion.div>);
}
function inputClass(hasError: boolean) {
    return `border-2 transition-all duration-200 focus:ring-4 ${hasError
        ? "border-red-400 focus:border-red-400 focus:ring-red-500/15"
        : "border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/15 dark:border-gray-700"}`;
}
export default function AdherentSignupPage() {
    const t = useTranslations("auth");
    const router = useRouter();
    const locale = useLocale();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({});
    const [formData, setFormData] = useState<FormFields>({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        sexe: "",
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
    const validate = (name: keyof FormFields, value: string): string => {
        switch (name) {
            case "nom":
            case "prenom":
                if (!value)
                    return name === "nom" ? t("adherentSignup.validation.nomRequired") : t("adherentSignup.validation.prenomRequired");
                if (value.length < 2)
                    return t("adherentSignup.validation.minTwoChars");
                return "";
            case "email":
                if (!value)
                    return t("adherentSignup.validation.emailRequired");
                if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(value))
                    return t("adherentSignup.validation.emailInvalid");
                return "";
            case "sexe":
                if (!value)
                    return t("adherentSignup.validation.sexeRequired");
                return "";
            case "dateNaissance":
                if (!value)
                    return t("adherentSignup.validation.birthDateRequired");
                return "";
            case "password":
                if (!value)
                    return t("adherentSignup.validation.passwordRequired");
                if (value.length < 8)
                    return t("adherentSignup.validation.passwordMin");
                if (!/[A-Z]/.test(value))
                    return t("adherentSignup.validation.passwordUppercase");
                if (!/[0-9]/.test(value))
                    return t("adherentSignup.validation.passwordNumber");
                return "";
            case "confirmPassword":
                if (!value)
                    return t("adherentSignup.validation.confirmPasswordRequired");
                if (value !== formData.password)
                    return t("adherentSignup.validation.passwordsMismatch");
                return "";
            default:
                return "";
        }
    };
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name as keyof SignupFieldErrors]) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };
    const handleBlur = (name: keyof FormFields) => {
        setTouched((prev) => ({ ...prev, [name]: true }));
    };
    const getError = (name: keyof FormFields) => {
        if (fieldErrors[name])
            return fieldErrors[name]!;
        if (!touched[name])
            return "";
        return validate(name, formData[name]);
    };
    const handleGoBack = () => {
        router.push(`/`);
    };
    async function handleSubmit(fd: FormData) {
        const required: (keyof FormFields)[] = [
            "nom", "prenom", "email", "sexe", "dateNaissance", "password", "confirmPassword",
        ];
        const newTouched = Object.fromEntries(required.map((k) => [k, true]));
        setTouched((prev) => ({ ...prev, ...newTouched }));
        const hasErrors = required.some((k) => validate(k, formData[k]) !== "");
        if (hasErrors) {
            toast.error(t("adherentSignup.notifications.incomplete.title"), {
                description: t("adherentSignup.notifications.incomplete.message"),
                duration: 5000,
            });
            return;
        }
        setIsPending(true);
        setFieldErrors({});
        try {
            const result = await signupAction(fd);
            if ("error" in result) {
                if (result.fieldErrors)
                    setFieldErrors(result.fieldErrors);
                toast.error(t("adherentSignup.notifications.failed.title"), {
                    description: result.error,
                    duration: 5000,
                });
                setIsPending(false);
            }
            else {
                toast.success(t("adherentSignup.notifications.success.title"), {
                    description: result.message,
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
        return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-14 w-14 rounded-full border-4 border-cyan-600 border-t-transparent dark:border-cyan-400"/>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("adherentSignup.loading")}
          </p>
        </div>
      </motion.div>);
    }
    return (<div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-200/20 blur-3xl dark:bg-cyan-500/10"/>
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-500/10"/>
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-300/10 to-blue-300/10 blur-3xl"/>
      </div>

      
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="fixed left-4 top-4 z-20 sm:left-8 sm:top-8">
        <button onClick={handleGoBack} className="group flex cursor-pointer items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-md backdrop-blur-sm transition-all duration-200 hover:gap-3 hover:bg-white hover:shadow-lg dark:bg-gray-900/80 dark:text-gray-300 dark:hover:bg-gray-900">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"/>
          <span className="hidden sm:inline">{t("adherentSignup.back")}</span>
        </button>
      </motion.div>

      
      <div className="relative flex min-h-screen items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-lg">
          <Card className="overflow-hidden border-0 bg-white/85 shadow-2xl backdrop-blur-xl dark:bg-gray-900/85">
            
            <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400"/>

            <CardHeader className="space-y-4 pb-6 pt-8 text-center">
              <motion.div variants={itemVariants} className="flex justify-center">
                <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 shadow-lg shadow-cyan-500/25">
                  <Waves className="h-10 w-10 text-white"/>
                </div>
              </motion.div>
              <motion.div variants={itemVariants}>
                <h1 className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent dark:from-cyan-400 dark:to-blue-400">
                  {t("signup")}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("adherentSignup.subtitle")}
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-5 px-6 pb-8">
              <form ref={formRef} action={handleSubmit} className="space-y-4" noValidate>
                
                <motion.p variants={itemVariants} className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {t("adherentSignup.sections.identity")}
                </motion.p>

                
                <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="nom" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("adherentSignup.fields.nom")} <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${getError("nom") ? "text-red-400" : "text-gray-400"}`}/>
                      <Input ref={firstInputRef} id="nom" name="nom" required placeholder={t("adherentSignup.placeholders.nom")} value={formData.nom} onChange={handleChange} onBlur={() => handleBlur("nom")} disabled={isPending} autoComplete="family-name" className={`pl-10 ${inputClass(!!getError("nom"))}`}/>
                    </div>
                    <AnimatePresence>
                      {getError("nom") && <FieldError message={getError("nom")}/>}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prenom" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("adherentSignup.fields.prenom")} <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${getError("prenom") ? "text-red-400" : "text-gray-400"}`}/>
                      <Input id="prenom" name="prenom" required placeholder={t("adherentSignup.placeholders.prenom")} value={formData.prenom} onChange={handleChange} onBlur={() => handleBlur("prenom")} disabled={isPending} autoComplete="given-name" className={`pl-10 ${inputClass(!!getError("prenom"))}`}/>
                    </div>
                    <AnimatePresence>
                      {getError("prenom") && <FieldError message={getError("prenom")}/>}
                    </AnimatePresence>
                  </div>
                </motion.div>

                
                <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="sexe" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("adherentSignup.fields.sexe")} <span className="text-red-400">*</span>
                    </Label>
                    <select id="sexe" name="sexe" required value={formData.sexe} onChange={handleChange} onBlur={() => handleBlur("sexe")} disabled={isPending} className={`flex h-10 w-full rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${getError("sexe")
            ? "border-red-400 focus:border-red-400 focus:ring-red-500/15"
            : "border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/15 dark:border-gray-700"}`}>
                      <option value="">{t("adherentSignup.placeholders.select")}</option>
                      <option value="M">{t("adherentSignup.options.male")}</option>
                      <option value="F">{t("adherentSignup.options.female")}</option>
                    </select>
                    <AnimatePresence>
                      {getError("sexe") && <FieldError message={getError("sexe")}/>}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dateNaissance" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("adherentSignup.fields.dateNaissance")} <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <CalendarDays className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${getError("dateNaissance") ? "text-red-400" : "text-gray-400"}`}/>
                      <Input id="dateNaissance" name="dateNaissance" type="date" required value={formData.dateNaissance} onChange={handleChange} onBlur={() => handleBlur("dateNaissance")} disabled={isPending} className={`pl-10 ${inputClass(!!getError("dateNaissance"))}`}/>
                    </div>
                    <AnimatePresence>
                      {getError("dateNaissance") && <FieldError message={getError("dateNaissance")}/>}
                    </AnimatePresence>
                  </div>
                </motion.div>

                
                <motion.p variants={itemVariants} className="pt-1 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {t("adherentSignup.sections.contact")}
                </motion.p>

                
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("adherentSignup.fields.email")} <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${getError("email") ? "text-red-400" : "text-gray-400"}`}/>
                    <Input id="email" name="email" type="email" required placeholder={t("adherentSignup.placeholders.email")} value={formData.email} onChange={handleChange} onBlur={() => handleBlur("email")} disabled={isPending} autoComplete="email" className={`pl-10 ${inputClass(!!getError("email"))}`}/>
                  </div>
                  <AnimatePresence>
                    {getError("email") && <FieldError message={getError("email")}/>}
                  </AnimatePresence>
                </motion.div>

                
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label htmlFor="telephone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("adherentSignup.fields.telephone")}
                    <span className="ml-1.5 text-xs font-normal text-gray-400">({t("adherentSignup.optional")})</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                    <Input id="telephone" name="telephone" type="tel" placeholder={t("adherentSignup.placeholders.telephone")} value={formData.telephone} onChange={handleChange} onBlur={() => handleBlur("telephone")} disabled={isPending} autoComplete="tel" className={`pl-10 ${inputClass(!!getError("telephone"))}`}/>
                  </div>
                  <AnimatePresence>
                    {getError("telephone") && <FieldError message={getError("telephone")}/>}
                  </AnimatePresence>
                </motion.div>

                
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label htmlFor="adresse" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("adherentSignup.fields.adresse")}
                    <span className="ml-1.5 text-xs font-normal text-gray-400">({t("adherentSignup.optional")})</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                    <Input id="adresse" name="adresse" placeholder={t("adherentSignup.placeholders.adresse")} value={formData.adresse} onChange={handleChange} disabled={isPending} autoComplete="street-address" className={`pl-10 ${inputClass(false)}`}/>
                  </div>
                </motion.div>

                
                <motion.p variants={itemVariants} className="pt-1 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {t("adherentSignup.sections.sonatrach")}
                </motion.p>

                
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label htmlFor="numeroMatricule" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("adherentSignup.fields.numeroMatricule")}
                    <span className="ml-1.5 text-xs font-normal text-gray-400">({t("adherentSignup.ifEmployee")})</span>
                  </Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                    <Input id="numeroMatricule" name="numeroMatricule" placeholder={t("adherentSignup.placeholders.numeroMatricule")} value={formData.numeroMatricule} onChange={handleChange} disabled={isPending} className={`pl-10 ${inputClass(false)}`}/>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {t("adherentSignup.matriculeHint")}
                  </p>
                </motion.div>

                
                <motion.p variants={itemVariants} className="pt-1 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {t("adherentSignup.sections.security")}
                </motion.p>

                
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("adherentSignup.fields.password")} <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${getError("password") ? "text-red-400" : "text-gray-400"}`}/>
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" value={formData.password} onChange={handleChange} onBlur={() => handleBlur("password")} disabled={isPending} autoComplete="new-password" className={`pl-10 pr-11 ${inputClass(!!getError("password"))}`}/>
                    <button type="button" onClick={() => setShowPassword((v) => !v)} disabled={isPending} aria-label={showPassword ? t("adherentSignup.hide") : t("adherentSignup.show")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
                      {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </button>
                  </div>
                  <AnimatePresence>
                    {getError("password") && touched.password && (<FieldError message={getError("password")}/>)}
                  </AnimatePresence>
                  {formData.password && (<PasswordStrength password={formData.password}/>)}
                </motion.div>

                
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("adherentSignup.fields.confirmPassword")} <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${getError("confirmPassword") ? "text-red-400" : "text-gray-400"}`}/>
                    <Input id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"} required placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} onBlur={() => handleBlur("confirmPassword")} disabled={isPending} autoComplete="new-password" className={`pl-10 pr-11 ${inputClass(!!getError("confirmPassword"))}`}/>
                    <button type="button" onClick={() => setShowConfirm((v) => !v)} disabled={isPending} aria-label={showConfirm ? t("adherentSignup.hide") : t("adherentSignup.show")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
                      {showConfirm ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </button>
                  </div>
                  <AnimatePresence>
                    {getError("confirmPassword") && touched.confirmPassword && (<FieldError message={getError("confirmPassword")}/>)}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {formData.confirmPassword && formData.password && (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`flex items-center gap-1.5 text-xs font-medium ${formData.confirmPassword === formData.password
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500 dark:text-red-400"}`}>
                        {formData.confirmPassword === formData.password ? (<><Check className="h-3.5 w-3.5"/> {t("adherentSignup.passwords.match")}</>) : (<><X className="h-3.5 w-3.5"/> {t("adherentSignup.passwords.mismatch")}</>)}
                      </motion.span>)}
                  </AnimatePresence>
                </motion.div>

                
                <motion.div variants={itemVariants} className="pt-2">
                  <Button type="submit" disabled={isPending} className="relative w-full cursor-pointer overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 py-6 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:shadow-cyan-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100">
                    {isPending ? (<span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                        {t("adherentSignup.submitting")}
                      </span>) : (t("register"))}
                  </Button>
                </motion.div>
              </form>

              
              <motion.div variants={itemVariants} className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"/>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white/80 px-3 text-gray-400 backdrop-blur-sm dark:bg-gray-900/80">
                    {t("adherentSignup.or")}
                  </span>
                </div>
              </motion.div>

              
              <motion.p variants={itemVariants} className="text-center text-sm text-gray-600 dark:text-gray-400">
                {t("hasAccount")}{" "}
                <Link href={`/${locale}/auth/adherent/login`} className="font-semibold text-cyan-600 transition-colors hover:text-cyan-700 hover:underline dark:text-cyan-400">
                  {t("login")}
                </Link>
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>);
}
