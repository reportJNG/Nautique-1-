"use server";

import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";

// ─── Schema ───────────────────────────────────────────────────────────────────

const signupSchema = z
  .object({
    nom: z
      .string()
      .min(1, "Le nom est requis")
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50, "Le nom ne peut pas dépasser 50 caractères")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom contient des caractères invalides"),

    prenom: z
      .string()
      .min(1, "Le prénom est requis")
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .max(50, "Le prénom ne peut pas dépasser 50 caractères")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le prénom contient des caractères invalides"),

    email: z
      .string()
      .min(1, "L'adresse email est requise")
      .email("L'adresse email n'est pas valide")
      .max(100, "L'adresse email est trop longue"),

    telephone: z
      .string()
      .optional()
      .refine(
        (v) => !v || /^(\+213|0)[5-7]\d{8}$/.test(v.replace(/\s/g, "")),
        "Numéro de téléphone invalide (ex: +213 5XX XX XX XX)"
      ),

    sexe: z.enum(["M", "F"], { message: "Veuillez sélectionner votre sexe" }),

    dateNaissance: z
      .string()
      .min(1, "La date de naissance est requise")
      .refine((d) => {
        const date = new Date(d);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age >= 5 && age <= 100;
      }, "Date de naissance invalide"),

    adresse: z
      .string()
      .max(200, "L'adresse ne peut pas dépasser 200 caractères")
      .optional(),

    numeroMatricule: z
      .string()
      .max(20, "Le matricule ne peut pas dépasser 20 caractères")
      .optional(),

    password: z
      .string()
      .min(1, "Le mot de passe est requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .max(100, "Le mot de passe est trop long")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),

    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// ─── Types ────────────────────────────────────────────────────────────────────

export type SignupFieldErrors = Partial<
  Record<keyof z.infer<typeof signupSchema>, string>
>;

type SignupResult =
  | { success: true; message: string }
  | { error: string; field?: keyof z.infer<typeof signupSchema> | "general"; fieldErrors?: SignupFieldErrors };

// ─── Action ───────────────────────────────────────────────────────────────────

export async function signupAction(formData: FormData): Promise<SignupResult> {
  try {
    const data = Object.fromEntries(formData);
    const parsed = signupSchema.safeParse(data);

    if (!parsed.success) {
      // Return all field errors so the UI can highlight each one
      const fieldErrors: SignupFieldErrors = {};
      for (const err of parsed.error.issues) {
        const key = err.path[0] as keyof SignupFieldErrors;
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      }
      const firstError = parsed.error.issues[0];
      return {
        error: firstError.message,
        field: firstError.path[0] as keyof z.infer<typeof signupSchema>,
        fieldErrors,
      };
    }

    const {
      nom,
      prenom,
      email,
      telephone,
      sexe,
      dateNaissance,
      adresse,
      numeroMatricule,
      password,
    } = parsed.data;

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check for duplicate email
    const existing = await prisma.adherent.findFirst({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      return {
        error: "Cette adresse email est déjà associée à un compte.",
        field: "email",
        fieldErrors: { email: "Cette adresse email est déjà utilisée" },
      };
    }

    // Resolve organisation
    const organisationCode =
      numeroMatricule?.trim() ? "SON" : "PAR";

    const organisation = await prisma.organisation.findUnique({
      where: { code: organisationCode },
      select: { id: true },
    });

    if (!organisation) {
      return {
        error: "Organisation introuvable. Contactez l'administration.",
        field: "general",
      };
    }

    // Hash password with cost factor 12
    const hashedPassword = await bcrypt.hash(password, 12);

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const numeroDossier = `DOS-${randomNum}`;

    // Create adherent
    const created = await prisma.adherent.create({
      data: {
        organisationId: organisation.id,
        numeroDossier,
        nom: nom.trim(),
        prenom: prenom.trim(),
        dateNaissance: new Date(dateNaissance),
        sexe,
        telephone: telephone?.trim() || null,
        email: normalizedEmail,
        adresse: adresse?.trim() || null,
        numeroMatricule: numeroMatricule?.trim() || null,
        password: hashedPassword,
        actif: 1,
      },
      select: { id: true, prenom: true, nom: true, numeroDossier: true },
    });

    const token = await signToken({
      type: "adherent",
      id: created.id,
      numeroDossier: created.numeroDossier,
      nom: created.nom,
      prenom: created.prenom,
    });
    await setSessionCookie(token);

    return {
      success: true,
      message: `Bienvenue, ${created.prenom} ${created.nom} ! Votre dossier n°${created.numeroDossier} a été créé.`,
    };
  } catch (error) {
    console.error("[signupAction] error:", error);
    return {
      error: "Une erreur inattendue est survenue. Veuillez réessayer.",
      field: "general",
    };
  }
}