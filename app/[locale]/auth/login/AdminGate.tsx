"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Shield, Lock, Loader2, AlertCircle, Eye, EyeOff, Waves } from "lucide-react";

const ADMIN_GATE_PASSWORD = "admin";
const SESSION_KEY = "admin_gate_passed";

interface AdminGateProps {
    children: React.ReactNode;
}

export function AdminGate({ children }: AdminGateProps) {
    const [passed, setPassed] = useState(false);
    const [checking, setChecking] = useState(true); // check sessionStorage on mount
    const [value, setValue] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Persist gate pass for the session
    useEffect(() => {
        const alreadyPassed = sessionStorage.getItem(SESSION_KEY) === "true";
        if (alreadyPassed) {
            setPassed(true);
        }
        setChecking(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (loading) return;

        if (value !== ADMIN_GATE_PASSWORD) {
            setError(true);
            setValue("");
            toast.error("Accès refusé", {
                description: "Mot de passe administrateur incorrect.",
                duration: 4000,
            });
            setTimeout(() => {
                setError(false);
                inputRef.current?.focus();
            }, 600);
            return;
        }

        setLoading(true);
        // Small artificial delay so the transition feels intentional
        setTimeout(() => {
            sessionStorage.setItem(SESSION_KEY, "true");
            setPassed(true);
            setLoading(false);
        }, 1400);
    }

    // Still checking sessionStorage
    if (checking) return null;

    // Gate passed — render the real login
    if (passed) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 px-4">
            {/* Background grid */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                            <path d="M32 0L0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Ambient glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-sm"
            >
                {/* Card */}
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
                    {/* Top accent bar */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500" />

                    <div className="px-8 pb-8 pt-8">
                        {/* Logo */}
                        <div className="mb-6 flex flex-col items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-2xl bg-violet-500/30 blur-xl" />
                                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30">
                                    <Waves className="h-7 w-7 text-white" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
                                    Administration
                                </p>
                                <h1 className="text-lg font-bold text-white">
                                    Accès Sécurisé
                                </h1>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    Réservé au personnel autorisé
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Mot de passe administrateur
                                </label>
                                <div className="relative">
                                    <Lock
                                        className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 ${error ? "text-red-400" : "text-gray-500"
                                            }`}
                                    />
                                    <motion.input
                                        ref={inputRef}
                                        type={showPassword ? "text" : "password"}
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        disabled={loading}
                                        placeholder="••••••••"
                                        autoComplete="off"
                                        animate={error ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`w-full rounded-xl border bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:ring-2 disabled:opacity-50 ${error
                                                ? "border-red-500/60 focus:border-red-400 focus:ring-red-500/20"
                                                : "border-white/10 focus:border-violet-500/60 focus:ring-violet-500/20"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="flex items-center gap-1.5 text-xs font-medium text-red-400"
                                        >
                                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                            Mot de passe incorrect
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !value}
                                className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Vérification…
                                    </>
                                ) : (
                                    <>
                                        <Shield className="h-4 w-4" />
                                        Accéder
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer note */}
                        <p className="mt-5 text-center text-[11px] text-gray-600">
                            Accès journalisé et surveillé — usage interne uniquement
                        </p>
                    </div>
                </div>

                {/* Loading overlay — shows while transitioning to the real login */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-950/80 backdrop-blur-sm"
                        >
                            <div className="relative flex h-12 w-12 items-center justify-center">
                                <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/30" />
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-violet-500/40 bg-violet-600/20">
                                    <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                                </div>
                            </div>
                            <p className="text-xs font-medium text-violet-300">Authentification…</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}