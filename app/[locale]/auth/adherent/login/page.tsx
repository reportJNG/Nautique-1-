// app/[locale]/auth/adherent/login/page.tsx
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
  Mail,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { loginAdherentAction } from "@/lib/actions/auth.actions";
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

export default function AdherentLoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isNavigating, setIsNavigating] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // ── Effects ────────────────────────────────────────────────────────────────

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
      if (document.visibilityState === "visible") emailInputRef.current?.focus();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────

  const emailError = (() => {
    if (!touched.email) return "";
    if (!formData.email) return t("adherentLogin.validation.emailRequired");
    if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(formData.email)) {
      return t("adherentLogin.validation.emailInvalid");
    }
    return "";
  })();

  const passwordError = (() => {
    if (!touched.password) return "";
    if (!formData.password) return t("adherentLogin.validation.passwordRequired");
    if (formData.password.length < 6) return t("adherentLogin.validation.passwordMin");
    return "";
  })();

  const isValid =
    !emailError && !passwordError && !!formData.email && !!formData.password;

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
      setTouched({ email: true, password: true });
      return;
    }

    setIsPending(true);

    try {
      const result = await loginAdherentAction(fd);

      if ("error" in result) {
        toast.error(t("toast.login.error.title"), {
          description: result.error ?? t("toast.login.error.description"),
          duration: 5000,
        });
        setIsPending(false);
        emailInputRef.current?.focus();
      } else {
        if (rememberMe) {
          localStorage.setItem("remembered_email", formData.email);
        } else {
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
    } catch {
      toast.error(t("toast.login.unexpected.title"), {
        description: t("toast.login.unexpected.description"),
        duration: 5000,
      });
      setIsPending(false);
      emailInputRef.current?.focus();
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
            {t("adherentLogin.loading")}
          </p>
        </div>
      </motion.div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-cyan-200/20 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-500/10" />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-300/10 to-blue-300/10 blur-3xl"
        />
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
          <span className="hidden sm:inline">{t("adherentLogin.back")}</span>
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
            <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400" />

            <CardHeader className="space-y-4 pb-6 pt-8 text-center">
              {/* Logo */}
              <motion.div variants={itemVariants} className="flex justify-center">
                <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 shadow-lg shadow-cyan-500/25">
                  <Waves className="h-10 w-10 text-white" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.div variants={itemVariants}>
                <h1 className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent dark:from-cyan-400 dark:to-blue-400">
                  {t("login")}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("adherentLogin.subtitle")}
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
                {/* Email */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {t("adherentLogin.emailLabel")}
                  </Label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                        emailError && touched.email
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    />
                    <Input
                      ref={emailInputRef}
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder={t("adherentLogin.emailPlaceholder")}
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("email")}
                      disabled={isPending}
                      autoComplete="email"
                      className={`border-2 pl-10 transition-all duration-200 focus:ring-4 ${
                        emailError && touched.email
                          ? "border-red-400 focus:border-red-400 focus:ring-red-500/15"
                          : "border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/15 dark:border-gray-700"
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {emailError && touched.email && (
                      <FieldError message={emailError} />
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
                      {t("adherentLogin.passwordLabel")}
                    </Label>
                    <Link
                      href={`/${locale}/auth/adherent/ForgetPassword`}
                      className="text-xs font-medium text-cyan-600 transition-colors hover:text-cyan-700 hover:underline dark:text-cyan-400"
                    >
                      {t("adherentLogin.forgotPassword")}
                    </Link>
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
                          ? t("adherentLogin.hidePassword")
                          : t("adherentLogin.showPassword")
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
                      {t("adherentLogin.rememberMe")}
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
                        {t("adherentLogin.loggingIn")}
                      </span>
                    ) : (
                      t("loginSubmit")
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
                    {t("adherentLogin.or")}
                  </span>
                </div>
              </motion.div>

              {/* Sign up link */}
              <motion.p
                variants={itemVariants}
                className="text-center text-sm text-gray-600 dark:text-gray-400"
              >
                {t("noAccount")}{" "}
                <Link
                  href={`/auth/adherent/signup`}
                  className="font-semibold text-cyan-600 transition-colors hover:text-cyan-700 hover:underline dark:text-cyan-400"
                >
                  {t("register")}
                </Link>
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}