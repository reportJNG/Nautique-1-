"use client";
import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent, } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Waves, Eye, EyeOff, ArrowLeft, Mail, Lock, Loader2, AlertCircle, } from "lucide-react";
import { loginAdherentAction } from "@/lib/actions/auth.actions";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { adherentLoginSchema, type AdherentLoginInput } from "@/lib/validators/auth";
import { ThemeToggle } from "@/components/theme-toggle";
function FieldError({ message }: {
  message: string;
}) {
  return (<motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="flex items-center gap-1.5 text-xs font-medium text-destructive">
    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
    {message}
  </motion.p>);
}
export default function AdherentLoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState<AdherentLoginInput>({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [fieldErrors, setFieldErrors] = useState<Partial<AdherentLoginInput>>({});
  const [isNavigating, setIsNavigating] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
    emailInputRef.current?.focus();
  }, []);
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible")
        emailInputRef.current?.focus();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);
  const emailError = (() => {
    if (fieldErrors.email) return fieldErrors.email;
    if (!touched.email) return "";
    const result = adherentLoginSchema.shape.email.safeParse(formData.email);
    if (!result.success) return result.error.issues[0]?.message || "";
    return "";
  })();
  const passwordError = (() => {
    if (fieldErrors.password) return fieldErrors.password;
    if (!touched.password) return "";
    const result = adherentLoginSchema.shape.password.safeParse(formData.password);
    if (!result.success) return result.error.issues[0]?.message || "";
    return "";
  })();
  const isValid = !emailError && !passwordError && !!formData.email && !!formData.password;
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === 'email') {
      sanitizedValue = value.toLowerCase().slice(0, 100);
    } else if (name === 'password') {
      sanitizedValue = value.slice(0, 128);
    }

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    if (fieldErrors[name as keyof AdherentLoginInput]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  const handleBlur = (field: keyof typeof touched) => setTouched((prev) => ({ ...prev, [field]: true }));
  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && !e.shiftKey && isValid && !isPending) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };
  const handleGoBack = () => {
    router.push('/');
  };
  async function handleSubmit() {
    if (!isValid) {
      setTouched({ email: true, password: true });
      return;
    }
    setIsPending(true);
    setFieldErrors({});
    try {
      const result = adherentLoginSchema.safeParse(formData);
      if (!result.success) {
        const errors: Partial<AdherentLoginInput> = {};
        result.error.issues.forEach((error) => {
          if (error.path.length > 0) {
            errors[error.path[0] as keyof AdherentLoginInput] = error.message;
          }
        });
        setFieldErrors(errors);
        setIsPending(false);
        emailInputRef.current?.focus();
        return;
      }

      const sanitizedFd = new FormData();
      sanitizedFd.set("email", formData.email.trim().toLowerCase());
      sanitizedFd.set("password", formData.password);
      const loginResult = await loginAdherentAction(sanitizedFd);
      if ("error" in loginResult) {
        if ('fieldErrors' in loginResult && loginResult.fieldErrors) {
          setFieldErrors(loginResult.fieldErrors as Partial<AdherentLoginInput>);
        }
        toast.error(t("toast.login.error.title"), {
          description: loginResult.error ?? t("toast.login.error.description"),
          duration: 5000,
        });
        setIsPending(false);
        emailInputRef.current?.focus();
      }
      else {
        if (rememberMe) {
          localStorage.setItem("remembered_email", formData.email);
        }
        else {
          localStorage.removeItem("remembered_email");
        }
        if (result.success) {
          toast.success(t("toast.login.success.title"), {
            description: t("toast.login.success.description"),
            duration: 5000,
          });
          sessionStorage.setItem("login_success", "true");
          setIsPending(false);
          redirectTimerRef.current = setTimeout(() => {
            setIsNavigating(true);
            router.replace("/espace");
          }, 5000);
        }
      }
    }
    catch {
      toast.error(t("toast.login.unexpected.title"), {
        description: t("toast.login.unexpected.description"),
        duration: 5000,
      });
      setIsPending(false);
      emailInputRef.current?.focus();
    }
  }
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };
  const itemVariants: Variants = {
    hidden: { y: 16, opacity: 0 },
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
          {t("adherentLogin.loading")}
        </p>
      </div>
    </motion.div>);
  }
  return (<div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">

    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/10 to-primary/10 blur-3xl" />
    </div>


    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="fixed left-4 top-4 z-20 sm:left-8 sm:top-8">
      <button onClick={handleGoBack} className="group flex cursor-pointer items-center gap-2 rounded-xl bg-card/80 px-4 py-2 text-sm font-medium text-foreground shadow-md backdrop-blur-sm transition-all duration-200 hover:gap-3 hover:bg-card hover:shadow-lg">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="hidden sm:inline">{t("adherentLogin.back")}</span>
      </button>
    </motion.div>


    <div className="fixed right-4 top-4 z-20 sm:right-8 sm:top-8">
      <ThemeToggle />
    </div>

    <div className="relative flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-md">
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
                {t("login")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("adherentLogin.subtitle")}
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-8">

            <form ref={formRef} action={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4" noValidate>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  {t("adherentLogin.emailLabel")}
                </Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${emailError && touched.email
                    ? "text-destructive"
                    : "text-muted-foreground"}`} />
                  <Input ref={emailInputRef} id="email" name="email" type="email" required placeholder={t("adherentLogin.emailPlaceholder")} value={formData.email} onChange={handleInputChange} onBlur={() => handleBlur("email")} disabled={isPending} autoComplete="email" autoCapitalize="off" autoCorrect="off" spellCheck={false} maxLength={100} className={`border-2 pl-10 transition-all duration-200 focus:ring-4 ${emailError && touched.email
                    ? "border-destructive focus:border-destructive focus:ring-destructive/15"
                    : "border-border focus:border-primary focus:ring-primary/15"}`} />
                </div>
                <AnimatePresence>
                  {emailError && touched.email && (<FieldError message={emailError} />)}
                </AnimatePresence>
              </motion.div>


              <motion.div variants={itemVariants} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    {t("adherentLogin.passwordLabel")}
                  </Label>
                  <Link href={`/auth/adherent/forgetpassword`} className="text-xs font-medium text-primary transition-colors hover:text-primary/80 hover:underline">
                    {t("adherentLogin.forgotPassword")}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${passwordError && touched.password
                    ? "text-destructive"
                    : "text-muted-foreground"}`} />
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" value={formData.password} onChange={handleInputChange} onBlur={() => handleBlur("password")} disabled={isPending} autoComplete="current-password" className={`border-2 pl-10 pr-11 transition-all duration-200 focus:ring-4 ${passwordError && touched.password
                    ? "border-destructive focus:border-destructive focus:ring-destructive/15"
                    : "border-border focus:border-primary focus:ring-primary/15"}`} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} disabled={isPending} aria-label={showPassword
                    ? t("adherentLogin.hidePassword")
                    : t("adherentLogin.showPassword")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground">
                    {showPassword ? (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
                  </button>
                </div>
                <AnimatePresence>
                  {passwordError && touched.password && (<FieldError message={passwordError} />)}
                </AnimatePresence>
              </motion.div>


              <motion.div variants={itemVariants}>
                <label className="flex cursor-pointer items-center gap-2.5 select-none">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm text-muted-foreground">
                    {t("adherentLogin.rememberMe")}
                  </span>
                </label>
              </motion.div>


              <motion.div variants={itemVariants}>
                <Button type="submit" disabled={isPending || !isValid} className="relative w-full cursor-pointer overflow-hidden bg-gradient-to-r from-primary to-primary/80 py-6 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
                  {isPending ? (<span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("adherentLogin.loggingIn")}
                  </span>) : (t("loginSubmit"))}
                </Button>
              </motion.div>
            </form>


            <motion.div variants={itemVariants} className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card/80 px-3 text-muted-foreground backdrop-blur-sm">
                  {t("adherentLogin.or")}
                </span>
              </div>
            </motion.div>


            <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <Link href={`/auth/adherent/signup`} className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline">
                {t("register")}
              </Link>
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </div>);
}
