"use server";

import { prisma } from "@/lib/db/prisma";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import {
  agentLoginSchema,
  adherentLoginSchema,
  adherentSignupSchema,
} from "@/lib/validators/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function loginAgentAction(formData: FormData) {
  const parsed = agentLoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { login, password } = parsed.data;

  try {
    const agent = await prisma.agent.findUnique({
      where: { login },
      include: { role: true },
    });

    if (!agent || agent.actif !== 1) {
      return { error: "Identifiants invalides" };
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

export async function loginAdherentAction(formData: FormData) {
  const parsed = adherentLoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  try {
    const adherent = await prisma.adherent.findFirst({
      where: { email: email },
    });

    if (!adherent || adherent.actif !== 1) {
      return { error: "Identifiants invalides" };
    }

    const isValid = await bcrypt.compare(password, adherent.password);
    if (!isValid) {
      return { error: "Identifiants invalides" };
    }

    const token = await signToken({
      type: "adherent",
      id: adherent.id,
      numeroDossier: adherent.numeroDossier,
      nom: adherent.nom,
      prenom: adherent.prenom,
    });

    await setSessionCookie(token);

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Une erreur est survenue" };
  }
}

export async function signupAction(formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const parsed = adherentSignupSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { confirmPassword, ...data } = parsed.data;

  try {
    // Check if email already exists
    const existing = await prisma.adherent.findFirst({
      where: { email: data.email },
    });

    if (existing) {
      return { error: "Cet email est déjà utilisé" };
    }

    // Determine organization
    const orgCode = data.numeroMatricule ? "SON" : "PAR";
    const organisation = await prisma.organisation.findUnique({
      where: { code: orgCode },
    });

    if (!organisation) {
      return { error: "Organisation non trouvée" };
    }

    // Generate numero_dossier
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const numeroDossier = `DOS-${randomNum}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create adherent
    const adherent = await prisma.adherent.create({
      data: {
        organisationId: organisation.id,
        numeroDossier,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone || null,
        sexe: data.sexe,
        dateNaissance: new Date(data.dateNaissance),
        adresse: data.adresse || null,
        numeroMatricule: data.numeroMatricule || null,
        password: hashedPassword,
        actif: 1,
      },
    });

    // Auto-login after signup
    const token = await signToken({
      type: "adherent",
      id: adherent.id,
      numeroDossier: adherent.numeroDossier,
      nom: adherent.nom,
      prenom: adherent.prenom,
    });

    await setSessionCookie(token);

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Une erreur est survenue lors de l'inscription" };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath("/");
  return { success: true };
}
