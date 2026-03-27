// app/[locale]/auth/login/page.tsx
"use client";

import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Waves,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Lock,
  Loader2,
  AlertCircle,
  Shield,
  Anchor,
  Key,
} from "lucide-react";
import { loginAgent } from "./actions";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// ─── Field error component ────────────────────────────────────────────────────

function FieldError({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </motion.p>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AgentLoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [touched, setTouched] = useState({ login: false, password: false });
  const [isNavigating, setIsNavigating] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const loginInputRef = useRef<HTMLInputElement>(null);

  // ── Effects ────────────────────────────────────────────────────────────────

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
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") loginInputRef.current?.focus();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────

  const loginError = (() => {
    if (!touched.login) return "";
    if (!formData.login) return t("staffLogin.validation.loginRequired");
    if (formData.login.length < 3) return t("staffLogin.validation.loginMin");
    return "";
  })();

  const passwordError = (() => {
    if (!touched.password) return "";
    if (!formData.password) return t("staffLogin.validation.passwordRequired");
    if (formData.password.length < 6) return t("staffLogin.validation.passwordMin");
    return "";
  })();

  const isValid =
    !loginError && !passwordError && !!formData.login && !!formData.password;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field: keyof typeof touched) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && !e.shiftKey && isValid && !isPending) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const handleGoBack = () => {
    router.push('/');
  };

  async function handleSubmit(fd: FormData) {
    if (!isValid) {
      setTouched({ login: true, password: true });
      return;
    }

    setIsPending(true);

    try {
      const result = await loginAgent(fd);

      if ("error" in result) {
        toast.error(t("toast.login.error.title"), {
          description: result.error ?? t("toast.login.error.description"),
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

        if (result.success) {
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

  // ── Animation variants ─────────────────────────────────────────────────────

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

  // ── Loading overlay ────────────────────────────────────────────────────────

  if (isNavigating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-950 dark:to-gray-900"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-14 w-14 rounded-full border-4 border-cyan-600 border-t-transparent dark:border-cyan-400"
          />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("staffLogin.loading")}
          </p>
        </div>
      </motion.div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-cyan-200/20 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-500/10" />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-300/10 to-blue-300/10 blur-3xl"
        />
        
        {/* Nautical pattern overlay */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="waves" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 20 Q10 15 20 20 T40 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-600"/>
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
          onClick={handleGoBack}
          className="group flex cursor-pointer items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-md backdrop-blur-sm transition-all duration-200 hover:gap-3 hover:bg-white hover:shadow-lg dark:bg-gray-900/80 dark:text-gray-300 dark:hover:bg-gray-900"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">{t("staffLogin.back")}</span>
        </button>
      </motion.div>

      {/* Centered card */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden border-0 bg-white/85 shadow-2xl backdrop-blur-xl dark:bg-gray-900/85">
            {/* Thin gradient accent on top */}
            <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-400" />

            <CardHeader className="space-y-4 pb-6 pt-8 text-center">
              {/* Logo with shield accent */}
              <motion.div variants={itemVariants} className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 blur-lg opacity-50" />
                  <div className="relative rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 shadow-lg">
                    <Waves className="h-10 w-10 text-white" />
                  </div>

                </div>
              </motion.div>

              {/* Title */}
              <motion.div variants={itemVariants}>
                <h1 className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent dark:from-cyan-400 dark:to-blue-400">
                  {t("login")}
                </h1>
                <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <Anchor className="h-3.5 w-3.5" />
                  <span>{t("staffLogin.title")}</span>
                  <Shield className="h-3.5 w-3.5" />
                </p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  {t("staffLogin.subtitle")}
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-5 px-6 pb-8">
              {/* ── Form ── */}
              <form
                ref={formRef}
                action={handleSubmit}
                onKeyDown={handleKeyDown}
                className="space-y-4"
                noValidate
              >
                {/* Login / Identifiant */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label
                    htmlFor="login"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {t("staffLogin.loginLabel")}
                  </Label>
                  <div className="relative">
                    <User
                      className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                        loginError && touched.login
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    />
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
                      className={`border-2 pl-10 transition-all duration-200 focus:ring-4 ${
                        loginError && touched.login
                          ? "border-red-400 focus:border-red-400 focus:ring-red-500/15"
                          : "border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/15 dark:border-gray-700"
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {loginError && touched.login && (
                      <FieldError message={loginError} />
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      {t("staffLogin.passwordLabel")}
                    </Label>

                  </div>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                        passwordError && touched.password
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    />
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
                      className={`border-2 pl-10 pr-11 transition-all duration-200 focus:ring-4 ${
                        passwordError && touched.password
                          ? "border-red-400 focus:border-red-400 focus:ring-red-500/15"
                          : "border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/15 dark:border-gray-700"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={isPending}
                      aria-label={
                        showPassword
                          ? t("staffLogin.hidePassword")
                          : t("staffLogin.showPassword")
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <AnimatePresence>
                    {passwordError && touched.password && (
                      <FieldError message={passwordError} />
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Security hint */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center gap-2 rounded-lg bg-cyan-50 p-2.5 dark:bg-cyan-950/30">
                    <Key className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                    <p className="text-xs text-cyan-700 dark:text-cyan-300">
                      {t("staffLogin.securityHint")}
                    </p>
                  </div>
                </motion.div>

                {/* Remember me */}
                <motion.div variants={itemVariants}>
                  <label className="flex cursor-pointer items-center gap-2.5 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("staffLogin.rememberMe")}
                    </span>
                  </label>
                </motion.div>

                {/* Submit */}
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    disabled={isPending || !isValid}
                    className="relative w-full cursor-pointer overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 py-6 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:shadow-cyan-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
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
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white/80 px-3 text-gray-400 backdrop-blur-sm dark:bg-gray-900/80">
                    {t("staffLogin.or")}
                  </span>
                </div>
              </motion.div>

              {/* Staff info */}
              <motion.p
                variants={itemVariants}
                className="text-center text-xs text-gray-500 dark:text-gray-400"
              >
                {t("staffLogin.staffOnly")}
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}