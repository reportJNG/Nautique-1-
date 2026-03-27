// app/[locale]/auth/adherent/login/page.tsx
"use client";

import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Waves,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";
import { loginAdherentAction } from "@/lib/actions/auth.actions";
import { motion, AnimatePresence, type Variants } from "framer-motion";

type NotificationType = {
  type: "success" | "error";
  message: string;
};

export default function AdherentLoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [isNavigating, setIsNavigating] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
    emailInputRef.current?.focus();
  }, []);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setIsNavigating(true);
      const timeoutId = setTimeout(() => setIsNavigating(false), 3000);
      // popstate handler can't return a cleanup; clear via timer completion
      void timeoutId;
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        emailInputRef.current?.focus();
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!email) return "L'email est requis";
    if (!emailRegex.test(email)) return "Email invalide";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Le mot de passe est requis";
    if (password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères";
    return "";
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isValid && !isPending) {
        formRef.current?.requestSubmit();
      }
    }
  };

  const emailError = touched.email ? validateEmail(formData.email) : "";
  const passwordError = touched.password ? validatePassword(formData.password) : "";
  const isValid = !emailError && !passwordError && formData.email && formData.password;

  async function handleSubmit(formDataSubmit: FormData) {
    if (!isValid) {
      setTouched({ email: true, password: true });
      return;
    }

    setIsPending(true);
    setNotification(null);

    try {
      const result = await loginAdherentAction(formDataSubmit);

      if (result.error) {
        setNotification({
          type: "error",
          message: result.error,
        });
        setIsPending(false);
        emailInputRef.current?.focus();
      } else if (result.success) {
        if (rememberMe) {
          localStorage.setItem('remembered_email', formData.email);
        } else {
          localStorage.removeItem('remembered_email');
        }
        
        setNotification({
          type: "success",
          message: "Connexion réussie ! Redirection en cours...",
        });
        
        sessionStorage.setItem('login_success', 'true');
        
        setTimeout(() => {
          setIsNavigating(true);
          router.replace(`/espace`);
        }, 1000);
      }
    } catch (err) {
      void err;
      setNotification({
        type: "error",
        message: "Une erreur est survenue. Veuillez réessayer.",
      });
      setIsPending(false);
      emailInputRef.current?.focus();
    }
  }

  const handleGoBack = () => {
    setIsNavigating(true);
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/${locale}`);
    }
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  if (isNavigating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-950 dark:to-gray-900"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 rounded-full border-4 border-cyan-600 border-t-transparent dark:border-cyan-400"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            Chargement...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-cyan-200/20 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-500/10" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-300/10 to-blue-300/10 blur-3xl"
        />
      </div>

      {/* Back button with glass morphism */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed left-4 top-4 z-20 sm:left-8 sm:top-8"
      >
        <button
          onClick={handleGoBack}
          className="group flex items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-300 hover:gap-3 hover:bg-white hover:shadow-xl dark:bg-gray-900/80 dark:text-gray-300 dark:hover:bg-gray-900 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="hidden sm:inline">Retour</span>
        </button>
      </motion.div>

      {/* Main content */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-md"
        >
          <Card className="relative overflow-hidden border-0 bg-white/80 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl dark:bg-gray-900/80">
            {/* Decorative gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <CardHeader className="relative space-y-4 pb-8 text-center">
              <motion.div
                variants={itemVariants}
                className="flex justify-center"
              >
                <div className="relative">
                  
                  <div className="relative rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 p-3 shadow-lg">
                    <Waves className="h-12 w-12 text-white" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <CardTitle className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent dark:from-cyan-400 dark:to-blue-400">
                  {t("login")}
                </CardTitle>
                <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Espace Adhérent - Centre Nautique SONATRACH
                </CardDescription>
              </motion.div>

              
            </CardHeader>

            <CardContent className="relative space-y-6">
              {/* Notification Toast */}
              <AnimatePresence mode="wait">
                {notification && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Alert
                      variant={notification.type === "success" ? "default" : "destructive"}
                      className={`border-l-4 ${
                        notification.type === "success"
                          ? "border-l-green-500 bg-green-50 text-green-800 dark:border-l-green-400 dark:bg-green-900/20 dark:text-green-300"
                          : "border-l-red-500 bg-red-50 text-red-800 dark:border-l-red-400 dark:bg-red-900/20 dark:text-red-300"
                      }`}
                    >
                      {notification.type === "success" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                      <AlertDescription className="ml-3 font-medium">
                        {notification.message}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <form ref={formRef} action={handleSubmit} className="space-y-5" onKeyDown={handleKeyDown}>
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Adresse email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-cyan-500" />
                    <Input
                      ref={emailInputRef}
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("email")}
                      className={`border-2 pl-10 transition-all duration-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 ${
                        emailError && touched.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                      disabled={isPending}
                      autoComplete="email"
                    />
                  </div>
                  <AnimatePresence>
                    {emailError && touched.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs text-red-500"
                      >
                        {emailError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Mot de passe
                    </Label>
                    <Link
                      href={`/${locale}/auth/forgot-password`}
                      className="text-xs font-medium text-cyan-600 transition-all hover:text-cyan-700 hover:underline dark:text-cyan-400"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Votre mot de passe"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("password")}
                      className={`border-2 pl-10 pr-10 transition-all duration-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 ${
                        passwordError && touched.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                      disabled={isPending}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                      disabled={isPending}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {passwordError && touched.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs text-red-500"
                      >
                        {passwordError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Se souvenir de moi</span>
                  </label>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    disabled={isPending || !isValid}
                    className="relative w-full overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 py-6 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                  >
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Connexion en cours...</span>
                      </div>
                    ) : (
                      <span >Se connecter</span>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div variants={itemVariants} className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white/80 px-4 text-gray-500 backdrop-blur-sm dark:bg-gray-900/80 dark:text-gray-400">
                    ou
                  </span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pas encore de compte ?{" "}
                  <Link
                    href={`/${locale}/auth/adherent/signup`}
                    className="font-semibold text-cyan-600 transition-all hover:text-cyan-700 hover:underline dark:text-cyan-400"
                  >
                    Créer un compte
                  </Link>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}