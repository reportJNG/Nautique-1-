"use client";

import { useMemo, useState, type FormEvent, type ChangeEvent } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { MessageSquare, Loader2, ChevronDown, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    SUPPORT_SECTION_ID,
    SUPPORT_PROBLEM_TYPE_IDS,
    SUPPORT_COMMENT_MAX,
    createSupportFormSchema,
    type SupportFormValues,
} from "./supportForm.logic";

type FieldErrors = Partial<Record<keyof SupportFormValues, string>>;

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="mt-1.5 text-xs font-medium text-destructive" role="alert">
            {message}
        </p>
    );
}

const inputClass = (invalid: boolean) =>
    cn(
        "h-10 rounded-xl border bg-background text-sm transition-shadow",
        "placeholder:text-muted-foreground/70",
        "focus-visible:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500/20",
        invalid
            ? "border-destructive/70 focus-visible:border-destructive focus-visible:ring-destructive/20"
            : "border-input shadow-sm",
    );

export function SupportForm() {
    const t = useTranslations("landing.support");
    const tNav = useTranslations("nav");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [problemType, setProblemType] = useState("");
    const [comment, setComment] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});

    const schema = useMemo(
        () =>
            createSupportFormSchema(
                t as (key: string, values?: Record<string, string | number>) => string,
            ),
        [t],
    );

    const charCount = comment.length;
    const charPct = charCount / SUPPORT_COMMENT_MAX;
    const radius = 7;
    const circ = 2 * Math.PI * radius;
    const dash = circ * (1 - Math.min(charPct, 1));

    function clearError(key: keyof SupportFormValues) {
        setErrors((prev) => {
            if (!prev[key]) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        const parsed = schema.safeParse({ email, problemType, comment });
        if (!parsed.success) {
            const flat = parsed.error.flatten();
            setErrors({
                email: flat.fieldErrors.email?.[0],
                problemType: flat.fieldErrors.problemType?.[0],
                comment: flat.fieldErrors.comment?.[0],
            });
            toast.error(t("toast.errorTitle"), {
                description: t("toast.errorDescription"),
                duration: 4500,
            });
            return;
        }
        setErrors({});
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 900));
        setIsLoading(false);
        setEmail("");
        setProblemType("");
        setComment("");
        toast.success(t("toast.title"), {
            description: t("toast.description", { email: parsed.data.email }),
            duration: 4000,
        });
    }

    return (
        <section
            id={SUPPORT_SECTION_ID}
            className="relative scroll-mt-28  bg-gradient-to-b from-muted/50 via-background to-cyan-50/15 py-20 dark:from-muted/25 dark:via-background dark:to-cyan-950/20"
            aria-labelledby="support-heading"
        >
            <div
                className="pointer-events-none absolute start-0 top-1/4 h-64 w-64 -translate-x-1/3 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-500/10"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute end-0 bottom-1/4 h-56 w-56 translate-x-1/3 rounded-full bg-primary/10 blur-3xl"
                aria-hidden
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45 }}
                    className="mb-12 text-center"
                >
                    <h2
                        id="support-heading"
                        className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-[2.5rem]"
                    >
                        {t("title")}
                    </h2>
                    <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                        {t("subtitle")}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.06 }}
                    className="mx-auto max-w-[460px]"
                >
                    <div
                        className={cn(
                            "overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-xl shadow-cyan-500/[0.06] backdrop-blur-sm",
                            "dark:border-white/10 dark:bg-slate-900/40 dark:shadow-black/40",
                        )}
                    >
                        <div className="flex items-start gap-3.5 border-b border-border/80 bg-muted/30 px-6 py-5 dark:bg-white/[0.03]">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-md shadow-cyan-600/25">
                                <MessageSquare
                                    className="h-5 w-5"
                                    strokeWidth={1.85}
                                    aria-hidden
                                />
                            </div>
                            <div className="min-w-0 pt-0.5 text-start">
                                <p className="text-sm font-semibold leading-tight text-foreground">
                                    {t("cardTitle")}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    {t("cardSubtitle")}
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={onSubmit}
                            noValidate
                            className="space-y-5 p-6 sm:p-7"
                            aria-label={t("title")}
                        >
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="support-email"
                                    className="text-[13px] font-medium text-foreground"
                                >
                                    {t("emailLabel")}
                                </Label>
                                <Input
                                    id="support-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder={t("emailPlaceholder")}
                                    value={email}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        setEmail(e.target.value);
                                        clearError("email");
                                    }}
                                    aria-invalid={!!errors.email}
                                    className={cn("px-3.5", inputClass(!!errors.email))}
                                />
                                <FieldError message={errors.email} />
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="support-problem"
                                    className="text-[13px] font-medium text-foreground"
                                >
                                    {t("problemTypeLabel")}
                                </Label>
                                <div className="relative">
                                    <select
                                        id="support-problem"
                                        value={problemType}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                            setProblemType(e.target.value);
                                            clearError("problemType");
                                        }}
                                        aria-invalid={!!errors.problemType}
                                        className={cn(
                                            inputClass(!!errors.problemType),
                                            "w-full cursor-pointer appearance-none ps-3.5 pe-10",
                                            !problemType && "text-muted-foreground",
                                        )}
                                    >
                                        <option value="" className="text-black">{t("problemTypePlaceholder")}</option>
                                        {SUPPORT_PROBLEM_TYPE_IDS.map((id) => (
                                            <option key={id} value={id} className="text-black">
                                                {t(`problemTypes.${id}`)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                                        aria-hidden
                                    />
                                </div>
                                <FieldError message={errors.problemType} />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <Label
                                        htmlFor="support-comment"
                                        className="text-[13px] font-medium text-foreground"
                                    >
                                        {t("commentLabel")}
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                "text-[11px] font-medium tabular-nums text-muted-foreground",
                                                charPct >= 1 && "text-destructive",
                                                charPct >= 0.85 &&
                                                    charPct < 1 &&
                                                    "text-amber-600 dark:text-amber-400",
                                            )}
                                        >
                                            {t("charCount", {
                                                count: charCount,
                                                max: SUPPORT_COMMENT_MAX,
                                            })}
                                        </span>
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 20 20"
                                            className="shrink-0"
                                            aria-hidden
                                        >
                                            <circle
                                                cx="10"
                                                cy="10"
                                                r={radius}
                                                fill="none"
                                                strokeWidth="2.5"
                                                className="stroke-border"
                                            />
                                            <circle
                                                cx="10"
                                                cy="10"
                                                r={radius}
                                                fill="none"
                                                strokeWidth="2.5"
                                                strokeDasharray={circ}
                                                strokeDashoffset={dash}
                                                strokeLinecap="round"
                                                transform="rotate(-90 10 10)"
                                                className={cn(
                                                    charPct >= 1
                                                        ? "stroke-destructive"
                                                        : charPct >= 0.85
                                                          ? "stroke-amber-500 dark:stroke-amber-400"
                                                          : "stroke-cyan-600 dark:stroke-cyan-400",
                                                )}
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <Textarea
                                    id="support-comment"
                                    placeholder={t("commentPlaceholder")}
                                    rows={5}
                                    maxLength={SUPPORT_COMMENT_MAX}
                                    value={comment}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                                        setComment(e.target.value);
                                        clearError("comment");
                                    }}
                                    aria-invalid={!!errors.comment}
                                    className={cn(
                                        "min-h-[132px] resize-none rounded-xl px-3.5 py-3 text-sm leading-relaxed",
                                        inputClass(!!errors.comment),
                                    )}
                                />
                                <FieldError message={errors.comment} />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="mt-1 h-11 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 text-sm font-semibold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-cyan-600 hover:shadow-lg disabled:opacity-60 dark:from-cyan-500 dark:to-cyan-600 dark:hover:from-cyan-400 dark:hover:to-cyan-500"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2
                                            className="me-2 h-4 w-4 animate-spin"
                                            aria-hidden
                                        />
                                        {t("submitting")}
                                    </>
                                ) : (
                                    <>
                                        {t("submit")}
                                        <Send className="ms-2 h-4 w-4 opacity-90" aria-hidden />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="border-t border-border/80 bg-muted/20 px-6 py-3.5 text-center dark:bg-white/[0.02]">
                            <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                                {t("privacyNote")}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
