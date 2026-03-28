"use server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
type OTPEntry = {
    code: string;
    expiresAt: number;
    attempts: number;
};
const otpStore = new Map<string, OTPEntry>();
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
async function sendResetEmail(email: string, code: string, prenom: string): Promise<void> {
    console.info(`[sendResetEmail] → ${email} | code: ${code} | name: ${prenom}`);
}
const emailSchema = z.object({
    email: z
        .string()
        .min(1, "L'adresse email est requise")
        .email("L'adresse email n'est pas valide"),
});
const otpSchema = z.object({
    email: z.string().email(),
    code: z
        .string()
        .length(6, "Le code doit contenir 6 chiffres")
        .regex(/^\d{6}$/, "Le code ne doit contenir que des chiffres"),
});
const resetSchema = z
    .object({
    email: z.string().email(),
    code: z.string().length(6),
    password: z
        .string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
        .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
})
    .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});
export type ForgotPasswordResult = {
    success: true;
    message: string;
} | {
    error: string;
    field?: string;
};
export async function requestPasswordResetAction(formData: FormData): Promise<ForgotPasswordResult> {
    try {
        const parsed = emailSchema.safeParse(Object.fromEntries(formData));
        if (!parsed.success) {
            return { error: parsed.error.issues[0].message, field: "email" };
        }
        const email = parsed.data.email.toLowerCase().trim();
        const adherent = await prisma.adherent.findFirst({
            where: { email },
            select: { id: true, prenom: true, actif: true, email: true },
        });
        if (adherent && adherent.actif === 1 && adherent.email) {
            const existing = otpStore.get(email);
            if (existing && existing.expiresAt - OTP_TTL_MS + 60000 > Date.now()) {
                return {
                    success: true,
                    message: "Si un compte correspond à cet email, un code a déjà été envoyé récemment. Vérifiez vos messages.",
                };
            }
            const code = generateOTP();
            otpStore.set(email, {
                code,
                expiresAt: Date.now() + OTP_TTL_MS,
                attempts: 0,
            });
            await sendResetEmail(adherent.email, code, adherent.prenom);
        }
        return {
            success: true,
            message: "Si un compte correspond à cet email, vous recevrez un code de vérification sous peu.",
        };
    }
    catch (error) {
        console.error("[requestPasswordResetAction]", error);
        return { error: "Une erreur inattendue est survenue. Veuillez réessayer." };
    }
}
export async function verifyOTPAction(formData: FormData): Promise<ForgotPasswordResult> {
    try {
        const parsed = otpSchema.safeParse(Object.fromEntries(formData));
        if (!parsed.success) {
            return { error: parsed.error.issues[0].message, field: "code" };
        }
        const { email, code } = parsed.data;
        const entry = otpStore.get(email.toLowerCase().trim());
        if (!entry) {
            return {
                error: "Aucun code actif pour cet email. Recommencez depuis le début.",
                field: "code",
            };
        }
        if (Date.now() > entry.expiresAt) {
            otpStore.delete(email);
            return {
                error: "Ce code a expiré. Veuillez en demander un nouveau.",
                field: "code",
            };
        }
        if (entry.attempts >= OTP_MAX_ATTEMPTS) {
            otpStore.delete(email);
            return {
                error: "Trop de tentatives incorrectes. Veuillez recommencer.",
                field: "code",
            };
        }
        if (entry.code !== code) {
            otpStore.set(email, { ...entry, attempts: entry.attempts + 1 });
            const remaining = OTP_MAX_ATTEMPTS - entry.attempts - 1;
            return {
                error: `Code incorrect. ${remaining} tentative${remaining !== 1 ? "s" : ""} restante${remaining !== 1 ? "s" : ""}.`,
                field: "code",
            };
        }
        otpStore.set(email, { ...entry, attempts: -1 });
        return { success: true, message: "Code vérifié avec succès." };
    }
    catch (error) {
        console.error("[verifyOTPAction]", error);
        return { error: "Une erreur inattendue est survenue. Veuillez réessayer." };
    }
}
export async function resetPasswordAction(formData: FormData): Promise<ForgotPasswordResult> {
    try {
        const parsed = resetSchema.safeParse(Object.fromEntries(formData));
        if (!parsed.success) {
            const first = parsed.error.issues[0];
            return { error: first.message, field: first.path[0] as string };
        }
        const { email, code, password } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();
        const entry = otpStore.get(normalizedEmail);
        if (!entry || entry.attempts !== -1 || Date.now() > entry.expiresAt) {
            return {
                error: "Session expirée ou invalide. Veuillez recommencer.",
                field: "general",
            };
        }
        if (entry.code !== code) {
            return { error: "Jeton invalide. Veuillez recommencer.", field: "general" };
        }
        const adherent = await prisma.adherent.findFirst({
            where: { email: normalizedEmail },
            select: { id: true, actif: true },
        });
        if (!adherent || adherent.actif !== 1) {
            return { error: "Compte introuvable ou désactivé.", field: "general" };
        }
        const hashed = await bcrypt.hash(password, 12);
        await prisma.adherent.update({
            where: { id: adherent.id },
            data: { password: hashed, updatedAt: new Date() },
        });
        otpStore.delete(normalizedEmail);
        return {
            success: true,
            message: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
        };
    }
    catch (error) {
        console.error("[resetPasswordAction]", error);
        return { error: "Une erreur inattendue est survenue. Veuillez réessayer." };
    }
}
