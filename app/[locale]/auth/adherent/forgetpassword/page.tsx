"use client";
import { useState, useRef, useEffect, useCallback, type ChangeEvent, type KeyboardEvent, type ClipboardEvent, } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Waves, ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ShieldCheck, RotateCcw, Check, X, KeyRound, } from "lucide-react";
import { requestPasswordResetAction, verifyOTPAction, resetPasswordAction, } from "./actions";
import { motion, AnimatePresence, type Variants } from "framer-motion";
type Step = "email" | "otp" | "reset" | "done";
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
        { label: t("forgotPassword.passwordChecks.length"), ok: password.length >= 8 },
        { label: t("forgotPassword.passwordChecks.uppercase"), ok: /[A-Z]/.test(password) },
        { label: t("forgotPassword.passwordChecks.number"), ok: /[0-9]/.test(password) },
    ];
    const passed = checks.filter((c) => c.ok).length;
    const barColor = passed === 0 ? "bg-red-400" :
        passed === 1 ? "bg-orange-400" :
            passed === 2 ? "bg-yellow-400" :
                "bg-emerald-500";
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (<div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passed ? barColor : "bg-gray-200 dark:bg-gray-700"}`}/>))}
      </div>
      <div className="flex flex-wrap gap-3">
        {checks.map((c) => (<span key={c.label} className={`flex items-center gap-1 text-xs transition-colors ${c.ok ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}>
            {c.ok ? <Check className="h-3 w-3"/> : <X className="h-3 w-3"/>}
            {c.label}
          </span>))}
      </div>
    </motion.div>);
}
function ResendTimer({ seconds, onExpire }: {
    seconds: number;
    onExpire: () => void;
}) {
    const t = useTranslations("auth");
    const [remaining, setRemaining] = useState(seconds);
    useEffect(() => {
        setRemaining(seconds);
        const id = setInterval(() => {
            setRemaining((s) => {
                if (s <= 1) {
                    clearInterval(id);
                    onExpire();
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [seconds, onExpire]);
    const pct = (remaining / seconds) * 100;
    return (<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      
      <svg className="h-4 w-4 -rotate-90" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth="2"/>
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={`${2 * Math.PI * 6}`} strokeDashoffset={`${2 * Math.PI * 6 * (1 - pct / 100)}`} className="transition-all duration-1000"/>
      </svg>
      {t("forgotPassword.resendIn", { seconds: remaining })}
    </div>);
}
function OTPInput({ value, onChange, disabled, hasError, }: {
    value: string;
    onChange: (v: string) => void;
    disabled: boolean;
    hasError: boolean;
}) {
    const t = useTranslations("auth");
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const digits = value.padEnd(6, "").split("").slice(0, 6);
    const focusNext = (i: number) => inputsRef.current[i + 1]?.focus();
    const focusPrev = (i: number) => inputsRef.current[i - 1]?.focus();
    const handleDigitChange = (i: number, v: string) => {
        const d = v.replace(/\D/g, "").slice(-1);
        const next = [...digits];
        next[i] = d;
        const joined = next.join("").replace(/\s/g, "");
        onChange(joined);
        if (d)
            focusNext(i);
    };
    const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (!digits[i])
                focusPrev(i);
            const next = [...digits];
            next[i] = "";
            onChange(next.join(""));
        }
        else if (e.key === "ArrowLeft")
            focusPrev(i);
        else if (e.key === "ArrowRight")
            focusNext(i);
    };
    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        onChange(pasted);
        const nextFocus = Math.min(pasted.length, 5);
        inputsRef.current[nextFocus]?.focus();
    };
    return (<div className="flex justify-center gap-2 sm:gap-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (<input key={i} ref={(el) => { inputsRef.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digits[i] || ""} onChange={(e) => handleDigitChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} onPaste={handlePaste} onFocus={(e) => e.target.select()} disabled={disabled} aria-label={t("forgotPassword.otpDigitAria", { index: i + 1 })} className={`h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 bg-white text-center text-lg font-bold tracking-widest text-gray-900 shadow-sm transition-all duration-200 outline-none focus:ring-4 dark:bg-gray-800 dark:text-white disabled:opacity-50 ${hasError
                ? "border-red-400 focus:border-red-400 focus:ring-red-500/15"
                : digits[i]
                    ? "border-cyan-500 focus:border-cyan-500 focus:ring-cyan-500/15"
                    : "border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/15 dark:border-gray-700"}`}/>))}
    </div>);
}
function StepIndicator({ current }: {
    current: Step;
}) {
    const t = useTranslations("auth");
    const steps: {
        key: Step;
        label: string;
    }[] = [
        { key: "email", label: t("forgotPassword.steps.email") },
        { key: "otp", label: t("forgotPassword.steps.code") },
        { key: "reset", label: t("forgotPassword.steps.reset") },
    ];
    const idx = steps.findIndex((s) => s.key === current);
    return (<div className="flex items-center justify-center gap-2">
      {steps.map((s, i) => {
            const done = i < idx || current === "done";
            const active = i === idx && current !== "done";
            return (<div key={s.key} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <motion.div animate={active ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.6, repeat: Infinity }} className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${done
                    ? "bg-emerald-500 text-white"
                    : active
                        ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800"}`}>
                {done ? <Check className="h-3.5 w-3.5"/> : i + 1}
              </motion.div>
              <span className={`hidden text-[10px] font-medium sm:block ${active ? "text-cyan-600 dark:text-cyan-400" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (<div className={`mb-4 h-px w-8 transition-colors duration-500 ${i < idx ? "bg-emerald-400" : "bg-gray-200 dark:bg-gray-700"}`}/>)}
          </div>);
        })}
    </div>);
}
export default function ForgotPasswordPage() {
    const t = useTranslations("auth");
    const router = useRouter();
    const locale = useLocale();
    const [step, setStep] = useState<Step>("email");
    const [isPending, setIsPending] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [email, setEmail] = useState("");
    const [emailTouched, setEmailTouched] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [otpError, setOtpError] = useState("");
    const [canResend, setCanResend] = useState(false);
    const [resendKey, setResendKey] = useState(0);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pwdTouched, setPwdTouched] = useState(false);
    const [confirmTouched, setConfirmTouched] = useState(false);
    const emailRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        emailRef.current?.focus();
    }, []);
    const emailError = emailTouched
        ? !email ? t("forgotPassword.validation.emailRequired")
            : !/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email) ? t("forgotPassword.validation.emailInvalid")
                : ""
        : "";
    const passwordError = pwdTouched
        ? !password ? t("forgotPassword.validation.passwordRequired")
            : password.length < 8 ? t("forgotPassword.validation.passwordMin")
                : !/[A-Z]/.test(password) ? t("forgotPassword.validation.passwordUppercase")
                    : !/[0-9]/.test(password) ? t("forgotPassword.validation.passwordNumber")
                        : ""
        : "";
    const confirmError = confirmTouched
        ? !confirmPassword ? t("forgotPassword.validation.confirmRequired")
            : confirmPassword !== password ? t("forgotPassword.validation.passwordsMismatch")
                : ""
        : "";
    const containerV: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
    };
    const itemV: Variants = {
        hidden: { y: 14, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14 } },
    };
    const stepV: Variants = {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120, damping: 16 } },
        exit: { opacity: 0, x: -30, transition: { duration: 0.15 } },
    };
    const handleGoBack = () => {
        if (step === "email") {
            setIsNavigating(true);
            window.history.length > 1 ? router.back() : router.push(`/${locale}`);
        }
        else if (step === "otp")
            setStep("email");
        else if (step === "reset")
            setStep("otp");
    };
    const handleResend = useCallback(async () => {
        setCanResend(false);
        setResendKey((k) => k + 1);
        setOtpCode("");
        setOtpError("");
        const fd = new FormData();
        fd.set("email", email);
        await requestPasswordResetAction(fd);
        toast.info(t("forgotPassword.notifications.resent.title"), {
            description: t("forgotPassword.notifications.resent.message"),
            duration: 5000,
        });
    }, [email]);
    async function handleEmailSubmit(e: React.FormEvent) {
        e.preventDefault();
        setEmailTouched(true);
        if (!email || !/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email))
            return;
        setIsPending(true);
        const fd = new FormData();
        fd.set("email", email);
        const result = await requestPasswordResetAction(fd);
        setIsPending(false);
        if ("error" in result) {
            toast.error(t("forgotPassword.notifications.error.title"), {
                description: result.error,
                duration: 5000,
            });
        }
        else {
            toast.info(t("forgotPassword.notifications.sent.title"), {
                description: result.message,
                duration: 5000,
            });
            setCanResend(false);
            setResendKey((k) => k + 1);
            setStep("otp");
        }
    }
    async function handleOTPSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (otpCode.length !== 6) {
            setOtpError(t("forgotPassword.validation.otpLength"));
            return;
        }
        setIsPending(true);
        setOtpError("");
        const fd = new FormData();
        fd.set("email", email);
        fd.set("code", otpCode);
        const result = await verifyOTPAction(fd);
        setIsPending(false);
        if ("error" in result) {
            setOtpError(result.error);
        }
        else {
            toast.success(t("forgotPassword.notifications.verified.title"), {
                description: t("forgotPassword.notifications.verified.message"),
                duration: 5000,
            });
            setStep("reset");
        }
    }
    async function handleResetSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPwdTouched(true);
        setConfirmTouched(true);
        if (passwordError || confirmError || !password || !confirmPassword)
            return;
        setIsPending(true);
        const fd = new FormData();
        fd.set("email", email);
        fd.set("code", otpCode);
        fd.set("password", password);
        fd.set("confirmPassword", confirmPassword);
        const result = await resetPasswordAction(fd);
        setIsPending(false);
        if ("error" in result) {
            toast.error(t("forgotPassword.notifications.error.title"), {
                description: result.error,
                duration: 5000,
            });
        }
        else {
            toast.success(t("forgotPassword.notifications.resetDone.title"), {
                description: t("forgotPassword.notifications.resetDone.message"),
                duration: 5000,
            });
            setStep("done");
        }
    }
    if (isNavigating) {
        return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-14 w-14 rounded-full border-4 border-cyan-600 border-t-transparent dark:border-cyan-400"/>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("forgotPassword.loading")}</p>
        </div>
      </motion.div>);
    }
    return (<div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-cyan-200/20 blur-3xl dark:bg-cyan-500/10"/>
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-500/10"/>
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-300/10 to-blue-300/10 blur-3xl"/>
      </div>

      
      {step !== "done" && (<motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="fixed left-4 top-4 z-20 sm:left-8 sm:top-8">
          <button onClick={handleGoBack} className="group flex cursor-pointer items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-md backdrop-blur-sm transition-all duration-200 hover:gap-3 hover:bg-white hover:shadow-lg dark:bg-gray-900/80 dark:text-gray-300 dark:hover:bg-gray-900">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"/>
            <span className="hidden sm:inline">{step === "email" ? t("forgotPassword.back") : t("forgotPassword.previousStep")}</span>
          </button>
        </motion.div>)}

      
      <div className="relative flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={containerV} className="w-full max-w-md">
          <Card className="overflow-hidden border-0 bg-white/85 shadow-2xl backdrop-blur-xl dark:bg-gray-900/85">
            <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400"/>

            <CardHeader className="space-y-4 pb-4 pt-8 text-center">
              <motion.div variants={itemV} className="flex justify-center">
                <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 shadow-lg shadow-cyan-500/25">
                  <Waves className="h-10 w-10 text-white"/>
                </div>
              </motion.div>
              <motion.div variants={itemV}>
                <h1 className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent dark:from-cyan-400 dark:to-blue-400">
                  {t("forgotPassword.title")}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("forgotPassword.subtitle")}
                </p>
              </motion.div>

              
              {step !== "done" && (<motion.div variants={itemV}>
                  <StepIndicator current={step}/>
                </motion.div>)}
            </CardHeader>

            <CardContent className="space-y-5 px-6 pb-8">
              <AnimatePresence mode="wait">
                
                {step === "email" && (<motion.div key="email" variants={stepV} initial="initial" animate="animate" exit="exit">
                    <form onSubmit={handleEmailSubmit} className="space-y-5" noValidate>
                      <div className="space-y-1.5">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("forgotPassword.emailHelp")}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t("forgotPassword.emailLabel")}
                        </Label>
                        <div className="relative">
                          <Mail className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${emailError ? "text-red-400" : "text-gray-400"}`}/>
                          <Input ref={emailRef} id="email" type="email" required placeholder={t("forgotPassword.emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setEmailTouched(true)} disabled={isPending} autoComplete="email" className={`border-2 pl-10 transition-all duration-200 focus:ring-4 ${emailError
                ? "border-red-400 focus:border-red-400 focus:ring-red-500/15"
                : "border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/15 dark:border-gray-700"}`}/>
                        </div>
                        <AnimatePresence>
                          {emailError && <FieldError message={emailError}/>}
                        </AnimatePresence>
                      </div>

                      <Button type="submit" disabled={isPending} className="w-full cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 py-6 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100">
                        {isPending ? (<span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> {t("forgotPassword.sending")}</span>) : (<span className="flex items-center gap-2"><Mail className="h-4 w-4"/> {t("forgotPassword.sendCode")}</span>)}
                      </Button>

                      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        {t("forgotPassword.remembered")}{" "}
                        <a href={`/${locale}/auth/adherent/login`} className="font-semibold text-cyan-600 hover:underline dark:text-cyan-400">
                          {t("login")}
                        </a>
                      </p>
                    </form>
                  </motion.div>)}

                
                {step === "otp" && (<motion.div key="otp" variants={stepV} initial="initial" animate="animate" exit="exit">
                    <form onSubmit={handleOTPSubmit} className="space-y-6" noValidate>
                      <div className="rounded-xl bg-cyan-50 p-4 text-center dark:bg-cyan-950/30">
                        <p className="text-sm text-cyan-800 dark:text-cyan-300">
                          {t("forgotPassword.codeSentTo")}
                        </p>
                        <p className="mt-0.5 font-semibold text-cyan-900 dark:text-cyan-200 break-all">
                          {email}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label className="block text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t("forgotPassword.codeLabel")}
                        </Label>
                        <OTPInput value={otpCode} onChange={(v) => { setOtpCode(v); setOtpError(""); }} disabled={isPending} hasError={!!otpError}/>
                        <AnimatePresence>
                          {otpError && (<motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-center">
                              <FieldError message={otpError}/>
                            </motion.div>)}
                        </AnimatePresence>
                      </div>

                      <Button type="submit" disabled={isPending || otpCode.length !== 6} className="w-full cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 py-6 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100">
                        {isPending ? (<span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> {t("forgotPassword.verifying")}</span>) : (<span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4"/> {t("forgotPassword.verifyCode")}</span>)}
                      </Button>

                      
                      <div className="flex items-center justify-center">
                        {canResend ? (<button type="button" onClick={handleResend} className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400">
                            <RotateCcw className="h-3.5 w-3.5"/> {t("forgotPassword.resendCode")}
                          </button>) : (<ResendTimer key={resendKey} seconds={60} onExpire={() => setCanResend(true)}/>)}
                      </div>
                    </form>
                  </motion.div>)}

                
                {step === "reset" && (<motion.div key="reset" variants={stepV} initial="initial" animate="animate" exit="exit">
                    <form onSubmit={handleResetSubmit} className="space-y-5" noValidate>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("forgotPassword.resetHelp")}
                      </p>

                      
                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t("forgotPassword.newPassword")}
                        </Label>
                        <div className="relative">
                          <Lock className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${passwordError ? "text-red-400" : "text-gray-400"}`}/>
                          <Input id="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setPwdTouched(true)} disabled={isPending} autoComplete="new-password" className={`border-2 pl-10 pr-11 transition-all duration-200 focus:ring-4 ${passwordError
                ? "border-red-400 focus:border-red-400 focus:ring-red-500/15"
                : "border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/15 dark:border-gray-700"}`}/>
                          <button type="button" onClick={() => setShowPassword((v) => !v)} disabled={isPending} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                          </button>
                        </div>
                        <AnimatePresence>
                          {passwordError && <FieldError message={passwordError}/>}
                        </AnimatePresence>
                        {password && <PasswordStrength password={password}/>}
                      </div>

                      
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t("forgotPassword.confirmPassword")}
                        </Label>
                        <div className="relative">
                          <Lock className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${confirmError ? "text-red-400" : "text-gray-400"}`}/>
                          <Input id="confirmPassword" type={showConfirm ? "text" : "password"} required placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onBlur={() => setConfirmTouched(true)} disabled={isPending} autoComplete="new-password" className={`border-2 pl-10 pr-11 transition-all duration-200 focus:ring-4 ${confirmError
                ? "border-red-400 focus:border-red-400 focus:ring-red-500/15"
                : "border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/15 dark:border-gray-700"}`}/>
                          <button type="button" onClick={() => setShowConfirm((v) => !v)} disabled={isPending} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            {showConfirm ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                          </button>
                        </div>
                        <AnimatePresence>
                          {confirmError && <FieldError message={confirmError}/>}
                        </AnimatePresence>
                        <AnimatePresence>
                          {confirmPassword && password && (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`flex items-center gap-1.5 text-xs font-medium ${confirmPassword === password ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                              {confirmPassword === password
                    ? <><Check className="h-3.5 w-3.5"/> {t("forgotPassword.passwords.match")}</>
                    : <><X className="h-3.5 w-3.5"/> {t("forgotPassword.passwords.mismatch")}</>}
                            </motion.span>)}
                        </AnimatePresence>
                      </div>

                      <Button type="submit" disabled={isPending} className="w-full cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 py-6 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100">
                        {isPending ? (<span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> {t("forgotPassword.resetting")}</span>) : (<span className="flex items-center gap-2"><KeyRound className="h-4 w-4"/> {t("forgotPassword.resetButton")}</span>)}
                      </Button>
                    </form>
                  </motion.div>)}

                
                {step === "done" && (<motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14 }} className="flex flex-col items-center gap-6 py-4 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }} className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30">
                      <CheckCircle2 className="h-10 w-10 text-white"/>
                    </motion.div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {t("forgotPassword.done.title")}
                      </h2>
                      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                        {t("forgotPassword.done.message")}
                      </p>
                    </div>
                    <Button onClick={() => { setIsNavigating(true); router.push(`/${locale}/auth/adherent/login`); }} className="w-full cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 py-6 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]">
                      {t("login")}
                    </Button>
                  </motion.div>)}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>);
}
