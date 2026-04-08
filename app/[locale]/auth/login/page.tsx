"use client";

import { AdminGate } from "./AdminGate";
import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Waves, Eye, EyeOff, ArrowLeft, User, Lock, Loader2,
  AlertCircle, Shield, Anchor, Key,
} from "lucide-react";
import { loginAgent } from "./actions";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { agentLoginSchema, type AgentLoginInput } from "@/lib/validators/auth";

function FieldError({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-1.5 text-xs font-medium text-destructive"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </motion.p>
  );
}

function AgentLoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState<AgentLoginInput>({ login: "", password: "" });
  const [touched, setTouched] = useState({ login: false, password: false });
  const [fieldErrors, setFieldErrors] = useState<Partial<AgentLoginInput>>({});
  const [isNavigating, setIsNavigating] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const loginInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedLogin = localStorage.getItem("remembered_staff_login");
    if (savedLogin) {
      setFormData((prev) => ({ ...prev, login: savedLogin }));
      setRememberMe(true);
    }
    loginInputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") loginInputRef.current?.focus();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const loginError = (() => {
    if (fieldErrors.login) return fieldErrors.login;
    if (!touched.login) return "";
    const result = agentLoginSchema.shape.login.safeParse(formData.login);
    return result.success ? "" : result.error.issues[0]?.message ?? "";
  })();

  const passwordError = (() => {
    if (fieldErrors.password) return fieldErrors.password;
    if (!touched.password) return "";
    const result = agentLoginSchema.shape.password.safeParse(formData.password);
    return result.success ? "" : result.error.issues[0]?.message ?? "";
  })();

  const isValid = !loginError && !passwordError && !!formData.login && !!formData.password;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitized =
      name === "login"
        ? value.replace(/[^a-zA-Z0-9_\-\.]/g, "").slice(0, 50)
        : value.slice(0, 128);
    setFormData((prev) => ({ ...prev, [name]: sanitized }));
    if (fieldErrors[name as keyof AgentLoginInput]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (field: keyof typeof touched) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && !e.shiftKey && isValid && !isPending) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  async function handleSubmit() {
    if (!isValid) {
      setTouched({ login: true, password: true });
      return;
    }
    setIsPending(true);
    setFieldErrors({});
    try {
      const result = agentLoginSchema.safeParse(formData);
      if (!result.success) {
        const errors: Partial<AgentLoginInput> = {};
        result.error.issues.forEach((err) => {
          if (err.path.length > 0) errors[err.path[0] as keyof AgentLoginInput] = err.message;
        });
        setFieldErrors(errors);
        setIsPending(false);
        loginInputRef.current?.focus();
        return;
      }

      const sanitizedFd = new FormData();
      sanitizedFd.set("login", formData.login.trim());
      sanitizedFd.set("password", formData.password);
      const loginResult = await loginAgent(sanitizedFd);

      if ("error" in loginResult) {
        if ("fieldErrors" in loginResult && loginResult.fieldErrors) {
          setFieldErrors(loginResult.fieldErrors as Partial<AgentLoginInput>);
        }
        toast.error(t("toast.login.error.title"), {
          description: loginResult.error ?? t("toast.login.error.description"),
          duration: 5000,
        });
        setIsPending(false);
        loginInputRef.current?.focus();
      } else {
        if (rememberMe) {
          localStorage.setItem("remembered_staff_login", formData.login);
        } else {
          localStorage.removeItem("remembered_staff_login");
        }

        toast.success(t("toast.login.success.title"), {
          description: t("toast.login.success.description"),
          duration: 5000,
        });
        sessionStorage.setItem("staff_login_success", "true");
        setIsPending(false);
        redirectTimerRef.current = setTimeout(() => {
          setIsNavigating(true);
          router.replace("/admin");
        }, 5000);
      }
    } catch {
      toast.error(t("toast.login.unexpected.title"), {
        description: t("toast.login.unexpected.description"),
        duration: 5000,
      });
      setIsPending(false);
      loginInputRef.current?.focus();
    }
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14 } },
  };

  if (isNavigating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background to-muted/50"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-14 w-14 rounded-full border-4 border-primary border-t-transparent"
          />
          <p className="text-sm font-medium text-muted-foreground">
            {t("staffLogin.loading")}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/10 to-primary/10 blur-3xl"
        />
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="waves" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 20 Q10 15 20 20 T40 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#waves)" />
          </svg>
        </div>
      </div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed left-4 top-4 z-20 sm:left-8 sm:top-8"
      >
        <button
          onClick={() => router.push("/")}
          className="group flex cursor-pointer items-center gap-2 rounded-xl bg-card/80 px-4 py-2 text-sm font-medium text-foreground shadow-md backdrop-blur-sm transition-all duration-200 hover:gap-3 hover:bg-card hover:shadow-lg"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">{t("staffLogin.back")}</span>
        </button>
      </motion.div>

      {/* Main */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden border-0 bg-card/85 shadow-2xl backdrop-blur-xl">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/80 to-primary/60" />

            <CardHeader className="space-y-4 pb-6 pt-8 text-center">
              <motion.div variants={itemVariants} className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-primary/80 blur-lg opacity-50" />
                  <div className="relative rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-3 shadow-lg">
                    <Waves className="h-10 w-10 text-primary-foreground" />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h1 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-2xl font-bold text-transparent">
                  {t("login")}
                </h1>
                <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  <Anchor className="h-3.5 w-3.5" />
                  <span>{t("staffLogin.title")}</span>
                  <Shield className="h-3.5 w-3.5" />
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("staffLogin.subtitle")}
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-5 px-6 pb-8">
              <form ref={formRef} action={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4" noValidate>
                {/* Login field */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label htmlFor="login" className="text-sm font-semibold text-foreground">
                    {t("staffLogin.loginLabel")}
                  </Label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${loginError && touched.login ? "text-destructive" : "text-muted-foreground"}`} />
                    <Input
                      ref={loginInputRef}
                      id="login"
                      name="login"
                      type="text"
                      required
                      placeholder={t("staffLogin.loginPlaceholder")}
                      value={formData.login}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("login")}
                      disabled={isPending}
                      autoComplete="username"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      maxLength={50}
                      className={`border-2 pl-10 transition-all duration-200 focus:ring-4 ${loginError && touched.login ? "border-destructive focus:border-destructive focus:ring-destructive/15" : "border-border focus:border-primary focus:ring-primary/15"}`}
                    />
                  </div>
                  <AnimatePresence>
                    {loginError && touched.login && <FieldError message={loginError} />}
                  </AnimatePresence>
                </motion.div>

                {/* Password field */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    {t("staffLogin.passwordLabel")}
                  </Label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${passwordError && touched.password ? "text-destructive" : "text-muted-foreground"}`} />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("password")}
                      disabled={isPending}
                      autoComplete="current-password"
                      maxLength={128}
                      className={`border-2 pl-10 pr-11 transition-all duration-200 focus:ring-4 ${passwordError && touched.password ? "border-destructive focus:border-destructive focus:ring-destructive/15" : "border-border focus:border-primary focus:ring-primary/15"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={isPending}
                      aria-label={showPassword ? t("staffLogin.hidePassword") : t("staffLogin.showPassword")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {passwordError && touched.password && <FieldError message={passwordError} />}
                  </AnimatePresence>
                </motion.div>

                {/* Security hint */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-2.5">
                    <Key className="h-3.5 w-3.5 text-primary" />
                    <p className="text-xs text-primary">
                      {t("staffLogin.securityHint")}
                    </p>
                  </div>
                </motion.div>

                {/* Remember me */}
                <motion.div variants={itemVariants}>
                  <label className="flex cursor-pointer select-none items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      {t("staffLogin.rememberMe")}
                    </span>
                  </label>
                </motion.div>

                {/* Submit */}
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    disabled={isPending || !isValid}
                    className="relative w-full cursor-pointer overflow-hidden bg-gradient-to-r from-primary to-primary/80 py-6 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("staffLogin.loggingIn")}
                      </span>
                    ) : (
                      <>
                        {t("loginSubmit")}
                        <Shield className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Divider */}
              <motion.div variants={itemVariants} className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card/80 px-3 text-muted-foreground backdrop-blur-sm">
                    {t("staffLogin.or")}
                  </span>
                </div>
              </motion.div>

              <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground">
                {t("staffLogin.staffOnly")}
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function AgentLoginPage() {
  return (
    <AdminGate>
      <AgentLoginForm />
    </AdminGate>
  );
}
