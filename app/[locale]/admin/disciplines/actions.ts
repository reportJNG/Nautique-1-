"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import type { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  createDisciplineSchema,
  createEspaceSchema,
  normalizeEntityCode,
  type CreateDisciplineInput,
  type CreateDisciplineSchemaMessages,
  type CreateEspaceInput,
  type CreateEspaceSchemaMessages,
} from "@/lib/validators/discipline";

type CreateEspaceFieldErrors = Partial<Record<keyof CreateEspaceInput, string>>;
type CreateDisciplineFieldErrors = Partial<
  Record<keyof CreateDisciplineInput, string>
>;

export type CreateEspaceResult =
  | {
      success: true;
      createdId: number;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: CreateEspaceFieldErrors;
    };

export type CreateDisciplineResult =
  | {
      success: true;
      createdId: number;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: CreateDisciplineFieldErrors;
    };

function getEspaceValidationMessages(
  t: Awaited<ReturnType<typeof getTranslations>>,
): CreateEspaceSchemaMessages {
  return {
    codeRequired: t("espace.codeRequired"),
    codeInvalid: t("espace.codeInvalid"),
    designationRequired: t("espace.designationRequired"),
    designationMin: t("espace.designationMin"),
    designationMax: t("espace.designationMax"),
    descriptionMax: t("espace.descriptionMax"),
  };
}

function getDisciplineValidationMessages(
  t: Awaited<ReturnType<typeof getTranslations>>,
): CreateDisciplineSchemaMessages {
  return {
    espaceRequired: t("discipline.espaceRequired"),
    codeRequired: t("discipline.codeRequired"),
    codeInvalid: t("discipline.codeInvalid"),
    designationRequired: t("discipline.designationRequired"),
    designationMin: t("discipline.designationMin"),
    designationMax: t("discipline.designationMax"),
  };
}

function getFieldErrors<T extends Record<string, string>>(
  error: z.ZodError,
): Partial<Record<keyof T, string>> {
  const flattened = error.flatten()
    .fieldErrors as Record<string, string[] | undefined>;

  return Object.fromEntries(
    Object.entries(flattened)
      .map(([field, messages]) => [field, messages?.[0]])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  ) as Partial<Record<keyof T, string>>;
}

function revalidateDisciplineScreens(locale: string) {
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/admin/creneaux`);
  revalidatePath(`/${locale}/admin/disciplines`);
  revalidatePath(`/${locale}/espace/abonnements/nouveau`);
}

export async function createEspace(
  locale: string,
  input: CreateEspaceInput,
): Promise<CreateEspaceResult> {
  const validationT = await getTranslations({
    locale,
    namespace: "admin.disciplinesUi.form.validation",
  });
  const feedbackT = await getTranslations({
    locale,
    namespace: "admin.disciplinesUi.form.feedback",
  });

  try {
    await requireRole(["ADMIN"]);

    const schema = createEspaceSchema(getEspaceValidationMessages(validationT));
    const parsed = schema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: feedbackT("invalidForm"),
        fieldErrors: getFieldErrors<CreateEspaceInput>(parsed.error),
      };
    }

    const code = normalizeEntityCode(parsed.data.code);

    const existingEspace = await prisma.espace.findFirst({
      where: {
        code: {
          equals: code,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existingEspace) {
      return {
        success: false,
        error: feedbackT("espaceDuplicateCode"),
        fieldErrors: {
          code: feedbackT("espaceDuplicateCode"),
        },
      };
    }

    const espace = await prisma.espace.create({
      data: {
        code,
        designation: parsed.data.designation,
        description: parsed.data.description || null,
        actif: 1,
      },
      select: { id: true },
    });

    revalidateDisciplineScreens(locale);

    return {
      success: true,
      createdId: espace.id,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return {
        success: false,
        error: feedbackT("forbidden"),
      };
    }

    console.error("Create espace error:", error);

    return {
      success: false,
      error: feedbackT("unexpected"),
    };
  }
}

export async function createDiscipline(
  locale: string,
  input: CreateDisciplineInput,
): Promise<CreateDisciplineResult> {
  const validationT = await getTranslations({
    locale,
    namespace: "admin.disciplinesUi.form.validation",
  });
  const feedbackT = await getTranslations({
    locale,
    namespace: "admin.disciplinesUi.form.feedback",
  });

  try {
    await requireRole(["ADMIN"]);

    const schema = createDisciplineSchema(
      getDisciplineValidationMessages(validationT),
    );
    const parsed = schema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: feedbackT("invalidForm"),
        fieldErrors: getFieldErrors<CreateDisciplineInput>(parsed.error),
      };
    }

    const [espace, existingDiscipline] = await Promise.all([
      prisma.espace.findUnique({
        where: { id: parsed.data.espaceId },
        select: { id: true },
      }),
      prisma.discipline.findFirst({
        where: {
          espaceId: parsed.data.espaceId,
          code: {
            equals: parsed.data.code,
            mode: "insensitive",
          },
        },
        select: { id: true },
      }),
    ]);

    if (!espace) {
      return {
        success: false,
        error: feedbackT("spaceMissing"),
        fieldErrors: {
          espaceId: feedbackT("spaceMissing"),
        },
      };
    }

    if (existingDiscipline) {
      return {
        success: false,
        error: feedbackT("disciplineDuplicateCode"),
        fieldErrors: {
          code: feedbackT("disciplineDuplicateCode"),
        },
      };
    }

    const discipline = await prisma.discipline.create({
      data: {
        espaceId: parsed.data.espaceId,
        code: parsed.data.code,
        designation: parsed.data.designation,
        actif: 1,
      },
      select: { id: true },
    });

    revalidateDisciplineScreens(locale);

    return {
      success: true,
      createdId: discipline.id,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return {
        success: false,
        error: feedbackT("forbidden"),
      };
    }

    console.error("Create discipline error:", error);

    return {
      success: false,
      error: feedbackT("unexpected"),
    };
  }
}
