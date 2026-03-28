"use server";
import { prisma } from "@/lib/db/prisma";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import bcrypt from "bcryptjs";
import { z } from "zod";
const loginSchema = z.object({
    email: z
        .string()
        .min(1, "L'adresse email est requise")
        .email("L'adresse email n'est pas valide"),
    password: z
        .string()
        .min(1, "Le mot de passe est requis")
        .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});
type LoginResult = {
    success: true;
    message: string;
} | {
    error: string;
    field?: "email" | "password" | "general";
};
export async function loginAdherentAction(formData: FormData): Promise<LoginResult> {
    try {
        const data = Object.fromEntries(formData);
        const parsed = loginSchema.safeParse(data);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0];
            const field = firstError.path[0] as "email" | "password";
            return {
                error: firstError.message,
                field,
            };
        }
        const { email, password } = parsed.data;
        const adherent = await prisma.adherent.findFirst({
            where: { email: email.toLowerCase().trim() },
            select: {
                id: true,
                email: true,
                password: true,
                nom: true,
                prenom: true,
                numeroDossier: true,
                actif: true,
            },
        });
        const dummyHash = "$2b$10$dummyhashforpreventingtimingattacksXXXXXXXXXXXXXXXXX";
        const isValid = adherent
            ? await bcrypt.compare(password, adherent.password)
            : await bcrypt.compare(password, dummyHash).then(() => false);
        if (!adherent || !isValid) {
            return {
                error: "Identifiants incorrects. Vérifiez votre email et mot de passe.",
                field: "general",
            };
        }
        if (adherent.actif !== 1) {
            return {
                error: "Votre compte est désactivé. Contactez l'administration.",
                field: "general",
            };
        }
        await setSessionCookie(await signToken({
            type: "adherent",
            id: adherent.id,
            numeroDossier: adherent.numeroDossier,
            nom: adherent.nom,
            prenom: adherent.prenom,
        }));
        return {
            success: true,
            message: `Bienvenue, ${adherent.prenom} ${adherent.nom} !`,
        };
    }
    catch (error) {
        console.error("[loginAdherentAction] error:", error);
        return {
            error: "Une erreur inattendue est survenue. Veuillez réessayer.",
            field: "general",
        };
    }
}
