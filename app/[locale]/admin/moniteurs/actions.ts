"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import type { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  createMoniteurSchema,
  type MoniteurFormInput,
  type MoniteurSchemaMessages,
} from "@/lib/validators/moniteur";

type MoniteurFieldErrors = Partial<Record<keyof MoniteurFormInput, string>>;

type MoniteurMutationResult =
  | { success: true; createdId?: number; updatedId?: number; deletedAssignments?: number }
  | { success: false; error: string; fieldErrors?: MoniteurFieldErrors };

function getValidationMessages(
  t: Awaited<ReturnType<typeof getTranslations>>,
): MoniteurSchemaMessages {
  return {
    nomRequired: t("nomRequired"),
    nomMin: t("nomMin"),
    nomMax: t("nomMax"),
    prenomRequired: t("prenomRequired"),
    prenomMin: t("prenomMin"),
    prenomMax: t("prenomMax"),
    sexeRequired: t("sexeRequired"),
    telephoneMax: t("telephoneMax"),
    emailInvalid: t("emailInvalid"),
    specialiteMax: t("specialiteMax"),
    statusRequired: t("statusRequired"),
  };
}

function getFieldErrors(
  error: z.ZodError<MoniteurFormInput>,
): MoniteurFieldErrors {
  const flattened = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(flattened)
      .map(([field, messages]) => [field, messages?.[0]])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  ) as MoniteurFieldErrors;
}

function revalidateMoniteurPaths(
  locale: string,
  options?: {
    moniteurId?: number;
    creneauIds?: number[];
  },
) {
  revalidatePath(`/${locale}/admin/moniteurs`);
  revalidatePath(`/${locale}/admin/moniteurs/new`);
  revalidatePath(`/${locale}/admin/creneaux`);

  if (options?.moniteurId) {
    revalidatePath(`/${locale}/admin/moniteurs/${options.moniteurId}`);
  }

  for (const creneauId of new Set(options?.creneauIds ?? [])) {
    revalidatePath(`/${locale}/admin/creneaux/${creneauId}`);
  }
}

function isValidMoniteurId(moniteurId: number) {
  return Number.isInteger(moniteurId) && moniteurId > 0;
}

export async function createMoniteur(
  locale: string,
  input: MoniteurFormInput,
): Promise<MoniteurMutationResult> {
  const validationT = await getTranslations({
    locale,
    namespace: "admin.moniteursUi.form.validation",
  });
  const feedbackT = await getTranslations({
    locale,
    namespace: "admin.moniteursUi.form.feedback",
  });

  try {
    await requireRole(["ADMIN"]);

    const schema = createMoniteurSchema(getValidationMessages(validationT));
    const parsed = schema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: feedbackT("invalidForm"),
        fieldErrors: getFieldErrors(parsed.error),
      };
    }

    const moniteur = await prisma.moniteur.create({
      data: {
        nom: parsed.data.nom,
        prenom: parsed.data.prenom,
        sexe: parsed.data.sexe,
        telephone: parsed.data.telephone || null,
        email: parsed.data.email || null,
        specialite: parsed.data.specialite || null,
        actif: parsed.data.actif === "1" ? 1 : 0,
      },
      select: { id: true },
    });

    revalidateMoniteurPaths(locale, { moniteurId: moniteur.id });

    return {
      success: true,
      createdId: moniteur.id,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return {
        success: false,
        error: feedbackT("forbidden"),
      };
    }

    console.error("Create moniteur error:", error);

    return {
      success: false,
      error: feedbackT("unexpected"),
    };
  }
}

export async function updateMoniteur(
  locale: string,
  moniteurId: number,
  input: MoniteurFormInput,
): Promise<MoniteurMutationResult> {
  const validationT = await getTranslations({
    locale,
    namespace: "admin.moniteursUi.form.validation",
  });
  const feedbackT = await getTranslations({
    locale,
    namespace: "admin.moniteursUi.form.feedback",
  });

  try {
    await requireRole(["ADMIN"]);

    if (!isValidMoniteurId(moniteurId)) {
      return {
        success: false,
        error: feedbackT("notFound"),
      };
    }

    const schema = createMoniteurSchema(getValidationMessages(validationT));
    const parsed = schema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: feedbackT("invalidForm"),
        fieldErrors: getFieldErrors(parsed.error),
      };
    }

    const existingMoniteur = await prisma.moniteur.findUnique({
      where: { id: moniteurId },
      select: {
        id: true,
        creneauxMoniteur: {
          select: { creneauId: true },
        },
      },
    });

    if (!existingMoniteur) {
      return {
        success: false,
        error: feedbackT("notFound"),
      };
    }

    await prisma.moniteur.update({
      where: { id: moniteurId },
      data: {
        nom: parsed.data.nom,
        prenom: parsed.data.prenom,
        sexe: parsed.data.sexe,
        telephone: parsed.data.telephone || null,
        email: parsed.data.email || null,
        specialite: parsed.data.specialite || null,
        actif: parsed.data.actif === "1" ? 1 : 0,
      },
    });

    revalidateMoniteurPaths(locale, {
      moniteurId,
      creneauIds: existingMoniteur.creneauxMoniteur.map(
        (assignment) => assignment.creneauId,
      ),
    });

    return {
      success: true,
      updatedId: moniteurId,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return {
        success: false,
        error: feedbackT("forbidden"),
      };
    }

    console.error("Update moniteur error:", error);

    return {
      success: false,
      error: feedbackT("unexpected"),
    };
  }
}

export async function deleteMoniteur(
  locale: string,
  moniteurId: number,
): Promise<MoniteurMutationResult> {
  const feedbackT = await getTranslations({
    locale,
    namespace: "admin.moniteursUi.form.feedback",
  });

  try {
    await requireRole(["ADMIN"]);

    if (!isValidMoniteurId(moniteurId)) {
      return {
        success: false,
        error: feedbackT("notFound"),
      };
    }

    const existingMoniteur = await prisma.moniteur.findUnique({
      where: { id: moniteurId },
      select: {
        id: true,
        creneauxMoniteur: {
          select: { creneauId: true },
        },
      },
    });

    if (!existingMoniteur) {
      return {
        success: false,
        error: feedbackT("notFound"),
      };
    }

    const deletedAssignments = existingMoniteur.creneauxMoniteur.length;

    await prisma.$transaction([
      prisma.creneauMoniteur.deleteMany({
        where: { moniteurId },
      }),
      prisma.moniteur.delete({
        where: { id: moniteurId },
      }),
    ]);

    revalidateMoniteurPaths(locale, {
      moniteurId,
      creneauIds: existingMoniteur.creneauxMoniteur.map(
        (assignment) => assignment.creneauId,
      ),
    });

    return {
      success: true,
      deletedAssignments,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return {
        success: false,
        error: feedbackT("forbidden"),
      };
    }

    console.error("Delete moniteur error:", error);

    return {
      success: false,
      error: feedbackT("unexpected"),
    };
  }
}
