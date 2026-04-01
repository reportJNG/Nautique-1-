import { z } from "zod";

export const agentLoginSchema = z.object({
    login: z
        .string()
        .min(1, "L'identifiant est requis")
        .min(3, "L'identifiant doit contenir au moins 3 caractères")
        .max(50, "L'identifiant ne peut pas dépasser 50 caractères")
        .regex(/^[a-zA-Z0-9_\-\.]+$/, "L'identifiant ne peut contenir que des lettres, chiffres, underscores, tirets et points"),
    password: z
        .string()
        .min(1, "Le mot de passe est requis")
        .min(6, "Le mot de passe doit contenir au moins 6 caractères")
        .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"),
});
export const adherentLoginSchema = z.object({
    email: z
        .string()
        .min(1, "L'email est requis")
        .max(100, "L'email ne peut pas dépasser 100 caractères")
        .email("Email invalide")
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Format d'email invalide"),
    password: z
        .string()
        .min(1, "Le mot de passe est requis")
        .max(128, "Le mot de passe ne peut pas dépasser 128 caractères"),
});
export const adherentSignupSchema = z
    .object({
    nom: z
        .string()
        .min(1, "Le nom est requis")
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(50, "Le nom ne peut pas dépasser 50 caractères")
        .regex(/^[a-zA-Z\s\-']+$/, "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes"),
    prenom: z
        .string()
        .min(1, "Le prénom est requis")
        .min(2, "Le prénom doit contenir au moins 2 caractères")
        .max(50, "Le prénom ne peut pas dépasser 50 caractères")
        .regex(/^[a-zA-Z\s\-']+$/, "Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes"),
    email: z
        .string()
        .min(1, "L'email est requis")
        .max(100, "L'email ne peut pas dépasser 100 caractères")
        .email("Email invalide")
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Format d'email invalide"),
    telephone: z
        .string()
        .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères")
        .regex(/^[\+\d\s\-\(\)]*$/, "Le numéro de téléphone n'est pas valide")
        .optional()
        .or(z.literal("")),
    sexe: z.enum(["M", "F"], { message: "Le sexe est requis" }),
    dateNaissance: z
        .string()
        .min(1, "La date de naissance est requise")
        .refine((date) => {
            const birthDate = new Date(date);
            const today = new Date();
            const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            return age >= 18 && age <= 120;
        }, "L'âge doit être compris entre 18 et 120 ans"),
    adresse: z
        .string()
        .max(200, "L'adresse ne peut pas dépasser 200 caractères")
        .optional()
        .or(z.literal("")),
    numeroMatricule: z
        .string()
        .max(20, "Le numéro matricule ne peut pas dépasser 20 caractères")
        .regex(/^[A-Z0-9\-]*$/, "Le numéro matricule ne peut contenir que des lettres majuscules, chiffres et tirets")
        .optional()
        .or(z.literal("")),
    password: z
        .string()
        .min(1, "Le mot de passe est requis")
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"),
    confirmPassword: z
        .string()
        .min(1, "La confirmation du mot de passe est requise"),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "L'email est requis")
        .max(100, "L'email ne peut pas dépasser 100 caractères")
        .email("Email invalide")
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Format d'email invalide"),
});

export const resetPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "L'email est requis")
        .max(100, "L'email ne peut pas dépasser 100 caractères")
        .email("Email invalide"),
    code: z
        .string()
        .length(6, "Le code doit contenir exactement 6 chiffres")
        .regex(/^\d{6}$/, "Le code ne peut contenir que des chiffres"),
    password: z
        .string()
        .min(1, "Le mot de passe est requis")
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"),
    confirmPassword: z
        .string()
        .min(1, "La confirmation du mot de passe est requise"),
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

export type AgentLoginInput = z.infer<typeof agentLoginSchema>;
export type AdherentLoginInput = z.infer<typeof adherentLoginSchema>;
export type AdherentSignupInput = z.infer<typeof adherentSignupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
