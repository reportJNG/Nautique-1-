"use server";

import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { generateNumeroDossier } from "@/lib/utils";

const signupSchema = z
  .object({
    nom: z.string().min(1, "Nom requis"),
    prenom: z.string().min(1, "Prénom requis"),
    email: z.string().email("Email invalide"),
    telephone: z.string().optional(),
    sexe: z.enum(["M", "F"]),
    dateNaissance: z.string().min(1, "Date de naissance requise"),
    adresse: z.string().optional(),
    numeroMatricule: z.string().optional(),
    password: z.string().min(8, "Mot de passe trop court"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export async function signupAdherent(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const parsed = signupSchema.safeParse(data);

    if (!parsed.success) {
      return { error: parsed.error.errors[0].message };
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

    // Check if email already exists
    const existingAdherent = await prisma.adherent.findUnique({
      where: { email },
    });

    if (existingAdherent) {
      return { error: "Cet email est déjà utilisé" };
    }

    // Determine organisation
    let organisationCode = "PAR"; // Default to particuliers
    if (numeroMatricule && numeroMatricule.trim() !== "") {
      organisationCode = "SON"; // SONATRACH employees
    }

    const organisation = await prisma.organisation.findUnique({
      where: { code: organisationCode },
    });

    if (!organisation) {
      return { error: "Organisation non trouvée" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate numero dossier
    const numeroDossier = generateNumeroDossier();

    // Create adherent
    await prisma.adherent.create({
      data: {
        organisationId: organisation.id,
        numeroDossier,
        nom,
        prenom,
        dateNaissance: new Date(dateNaissance),
        sexe,
        telephone: telephone || null,
        email,
        adresse: adresse || null,
        numeroMatricule: numeroMatricule || null,
        password: hashedPassword,
        actif: 1,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Une erreur est survenue lors de l'inscription" };
  }
}
