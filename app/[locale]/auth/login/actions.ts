"use server";

import { prisma } from "@/lib/db/prisma";
import { setAuthCookie } from "@/lib/auth/jwt";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  login: z.string().min(1, "Login requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export async function loginAgent(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const parsed = loginSchema.safeParse(data);

    if (!parsed.success) {
      return { error: "Données invalides" };
    }

    const { login, password } = parsed.data;

    const agent = await prisma.agent.findUnique({
      where: { login },
      include: { role: true },
    });

    if (!agent) {
      return { error: "Identifiants invalides" };
    }

    if (agent.actif !== 1) {
      return { error: "Compte désactivé" };
    }

    const isValid = await bcrypt.compare(password, agent.motDePasse);

    if (!isValid) {
      return { error: "Identifiants invalides" };
    }

    await setAuthCookie({
      type: "agent",
      id: agent.id,
      login: agent.login,
      roleCode: agent.role.code,
      nom: agent.nom,
      prenom: agent.prenom,
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Une erreur est survenue" };
  }
}
