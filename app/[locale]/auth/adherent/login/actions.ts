"use server";

import { prisma } from "@/lib/db/prisma";
import { setAuthCookie } from "@/lib/auth/jwt";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export async function loginAdherent(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const parsed = loginSchema.safeParse(data);

    if (!parsed.success) {
      return { error: "Données invalides" };
    }

    const { email, password } = parsed.data;

    const adherent = await prisma.adherent.findUnique({
      where: { email },
    });

    if (!adherent) {
      return { error: "Identifiants invalides" };
    }

    if (adherent.actif !== 1) {
      return { error: "Compte désactivé" };
    }

    const isValid = await bcrypt.compare(password, adherent.password);

    if (!isValid) {
      return { error: "Identifiants invalides" };
    }

    await setAuthCookie({
      type: "adherent",
      id: adherent.id,
      numeroDossier: adherent.numeroDossier,
      nom: adherent.nom,
      prenom: adherent.prenom,
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Une erreur est survenue" };
  }
}
