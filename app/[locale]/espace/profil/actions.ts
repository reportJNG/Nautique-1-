"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAdherent } from "@/lib/auth/jwt";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export async function updateProfile(formData: FormData) {
  const session = await requireAdherent();

  try {
    const data = Object.fromEntries(formData);
    const parsed = updateSchema.safeParse(data);

    if (!parsed.success) {
      return { error: parsed.error.errors[0].message };
    }

    const { nom, prenom, telephone, adresse } = parsed.data;

    await prisma.adherent.update({
      where: { id: session.id },
      data: {
        nom,
        prenom,
        telephone: telephone || null,
        adresse: adresse || null,
      },
    });

    revalidatePath("/[locale]/espace/profil");
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "Une erreur est survenue" };
  }
}

export async function changePassword(formData: FormData) {
  const session = await requireAdherent();

  try {
    const data = Object.fromEntries(formData);
    const parsed = passwordSchema.safeParse(data);

    if (!parsed.success) {
      return { error: parsed.error.errors[0].message };
    }

    const { currentPassword, newPassword } = parsed.data;

    const adherent = await prisma.adherent.findUnique({
      where: { id: session.id },
    });

    if (!adherent) {
      return { error: "Adhérent non trouvé" };
    }

    const isValid = await bcrypt.compare(currentPassword, adherent.password);

    if (!isValid) {
      return { error: "Mot de passe actuel incorrect" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.adherent.update({
      where: { id: session.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { error: "Une erreur est survenue" };
  }
}
