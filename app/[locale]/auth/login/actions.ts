"use server";

import { prisma } from "@/lib/db/prisma";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import { agentLoginSchema } from "@/lib/validators/auth";
import bcrypt from "bcryptjs";

export async function loginAgent(formData: FormData) {
  try {
    const raw = Object.fromEntries(formData);
    const parsed = agentLoginSchema.safeParse({
      login: String(raw.login ?? "").trim(),
      password: String(raw.password ?? ""),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
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

    const token = await signToken({
      type: "agent",
      id: agent.id,
      login: agent.login,
      roleCode: agent.role.code,
      nom: agent.nom,
      prenom: agent.prenom,
    });
    await setSessionCookie(token);

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Une erreur est survenue" };
  }
}
