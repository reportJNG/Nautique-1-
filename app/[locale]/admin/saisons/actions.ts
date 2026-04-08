"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import {
  createSaisonSchema,
  dateInputToUtcDate,
  normalizeSaisonDesignation,
  type CreateSaisonInput,
} from "@/lib/validators/saison";
import type { z } from "zod";

type CreateSaisonFieldErrors = Partial<Record<keyof CreateSaisonInput, string>>;

export type CreateSaisonResult =
  | {
      success: true;
      createdId: number;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: CreateSaisonFieldErrors;
    };

function getValidationMessages(t: Awaited<ReturnType<typeof getTranslations>>) {
  return {
    designationRequired: t("designationRequired"),
    designationMin: t("designationMin"),
    designationMax: t("designationMax"),
    dateDebutRequired: t("dateDebutRequired"),
    dateFinRequired: t("dateFinRequired"),
    invalidDate: t("invalidDate"),
    endBeforeStart: t("endBeforeStart"),
    statusRequired: t("statusRequired"),
  };
}

function getFieldErrors(error: z.ZodError<CreateSaisonInput>): CreateSaisonFieldErrors {
  const flattened = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(flattened)
      .map(([field, messages]) => [field, messages?.[0]])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  ) as CreateSaisonFieldErrors;
}

export async function createSaison(
  locale: string,
  input: CreateSaisonInput,
): Promise<CreateSaisonResult> {
  const validationT = await getTranslations({
    locale,
    namespace: "admin.saisonsUi.form.validation",
  });
  const feedbackT = await getTranslations({
    locale,
    namespace: "admin.saisonsUi.form.feedback",
  });

  try {
    await requireRole(["ADMIN"]);

    const schema = createSaisonSchema(getValidationMessages(validationT));
    const parsed = schema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: feedbackT("invalidForm"),
        fieldErrors: getFieldErrors(parsed.error),
      };
    }

    const designation = normalizeSaisonDesignation(parsed.data.designation);

    const [existingDesignation, existingOpenSeason] = await Promise.all([
      prisma.saison.findFirst({
        where: {
          designation: {
            equals: designation,
            mode: "insensitive",
          },
        },
        select: { id: true },
      }),
      parsed.data.statut === "OUV"
        ? prisma.saison.findFirst({
            where: { statut: "OUV" },
            select: { designation: true },
          })
        : Promise.resolve(null),
    ]);

    if (existingDesignation) {
      return {
        success: false,
        error: feedbackT("duplicateDesignation"),
        fieldErrors: {
          designation: feedbackT("duplicateDesignation"),
        },
      };
    }

    if (existingOpenSeason) {
      return {
        success: false,
        error: feedbackT("openSeasonExists", {
          designation: existingOpenSeason.designation,
        }),
      };
    }

    const saison = await prisma.saison.create({
      data: {
        designation,
        dateDebut: dateInputToUtcDate(parsed.data.dateDebut),
        dateFin: dateInputToUtcDate(parsed.data.dateFin),
        statut: parsed.data.statut,
      },
      select: { id: true },
    });

    revalidatePath("/[locale]");
    revalidatePath("/[locale]/admin/saisons");
    revalidatePath("/[locale]/espace/abonnements/nouveau");

    return {
      success: true,
      createdId: saison.id,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return {
        success: false,
        error: feedbackT("forbidden"),
      };
    }

    console.error("Create saison error:", error);

    return {
      success: false,
      error: feedbackT("unexpected"),
    };
  }
}
