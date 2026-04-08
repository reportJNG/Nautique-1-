"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import type { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  createCreneauSchema,
  timeInputToUtcDate,
  type CreateCreneauInput,
  type CreateCreneauSchemaMessages,
} from "@/lib/validators/creneau";

type CreateCreneauFieldErrors = Partial<Record<keyof CreateCreneauInput, string>>;

export type CreateCreneauResult =
  | {
      success: true;
      createdId: number;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: CreateCreneauFieldErrors;
    };

function getValidationMessages(
  t: Awaited<ReturnType<typeof getTranslations>>,
): CreateCreneauSchemaMessages {
  return {
    saisonRequired: t("saisonRequired"),
    disciplineRequired: t("disciplineRequired"),
    dayRequired: t("dayRequired"),
    heureDebutRequired: t("heureDebutRequired"),
    heureFinRequired: t("heureFinRequired"),
    invalidTime: t("invalidTime"),
    endBeforeStart: t("endBeforeStart"),
    nombreMinRequired: t("nombreMinRequired"),
    nombreMaxRequired: t("nombreMaxRequired"),
    minCapacityInvalid: t("minCapacityInvalid"),
    maxCapacityInvalid: t("maxCapacityInvalid"),
    maxLessThanMin: t("maxLessThanMin"),
    groupeMax: t("groupeMax"),
    observationsMax: t("observationsMax"),
  };
}

function getFieldErrors(error: z.ZodError): CreateCreneauFieldErrors {
  const flattened = error.flatten()
    .fieldErrors as Record<string, string[] | undefined>;

  return Object.fromEntries(
    Object.entries(flattened)
      .map(([field, messages]) => [field, messages?.[0]])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  ) as CreateCreneauFieldErrors;
}

export async function createCreneau(
  locale: string,
  input: CreateCreneauInput,
): Promise<CreateCreneauResult> {
  const validationT = await getTranslations({
    locale,
    namespace: "admin.creneauxUi.form.validation",
  });
  const feedbackT = await getTranslations({
    locale,
    namespace: "admin.creneauxUi.form.feedback",
  });

  try {
    await requireRole(["ADMIN"]);

    const schema = createCreneauSchema(getValidationMessages(validationT));
    const parsed = schema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: feedbackT("invalidForm"),
        fieldErrors: getFieldErrors(parsed.error),
      };
    }

    const heureDebut = timeInputToUtcDate(parsed.data.heureDebut);
    const heureFin = timeInputToUtcDate(parsed.data.heureFin);
    const groupe = parsed.data.groupe || null;
    const observations = parsed.data.observations || null;

    const [saison, discipline, duplicate] = await Promise.all([
      prisma.saison.findUnique({
        where: { id: parsed.data.saisonId },
        select: { id: true },
      }),
      prisma.discipline.findUnique({
        where: { id: parsed.data.disciplineId },
        select: { id: true },
      }),
      prisma.creneau.findFirst({
        where: {
          saisonId: parsed.data.saisonId,
          disciplineId: parsed.data.disciplineId,
          jourSemaine: parsed.data.jourSemaine,
          heureDebut,
          heureFin,
          groupe,
        },
        select: { id: true },
      }),
    ]);

    if (!saison) {
      return {
        success: false,
        error: feedbackT("seasonMissing"),
        fieldErrors: { saisonId: feedbackT("seasonMissing") },
      };
    }

    if (!discipline) {
      return {
        success: false,
        error: feedbackT("disciplineMissing"),
        fieldErrors: { disciplineId: feedbackT("disciplineMissing") },
      };
    }

    if (duplicate) {
      return {
        success: false,
        error: feedbackT("duplicateSlot"),
        fieldErrors: {
          heureDebut: feedbackT("duplicateSlot"),
          heureFin: feedbackT("duplicateSlot"),
        },
      };
    }

    const creneau = await prisma.creneau.create({
      data: {
        saisonId: parsed.data.saisonId,
        disciplineId: parsed.data.disciplineId,
        jourSemaine: parsed.data.jourSemaine,
        heureDebut,
        heureFin,
        nombreMin: parsed.data.nombreMin,
        nombreMax: parsed.data.nombreMax,
        groupe,
        observations,
        actif: 1,
      },
      select: { id: true },
    });

    revalidatePath(`/${locale}/admin/creneaux`);
    revalidatePath(`/${locale}/admin/creneaux/${creneau.id}`);
    revalidatePath(`/${locale}/admin/saisons`);
    revalidatePath(`/${locale}/admin/saisons/${parsed.data.saisonId}`);
    revalidatePath(`/${locale}/espace/abonnements/nouveau`);

    return {
      success: true,
      createdId: creneau.id,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return {
        success: false,
        error: feedbackT("forbidden"),
      };
    }

    console.error("Create creneau error:", error);

    return {
      success: false,
      error: feedbackT("unexpected"),
    };
  }
}
