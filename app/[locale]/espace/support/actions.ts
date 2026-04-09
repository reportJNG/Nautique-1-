"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { requireAdherent } from "@/lib/auth/session";
import { getEspaceShellData } from "@/lib/espace";
import { createAdminFeedback } from "@/lib/espace-content";
import type { Locale } from "@/i18n/config";

const MIN_SUBJECT_LENGTH = 4;
const MAX_SUBJECT_LENGTH = 120;
const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 1200;

type SupportFeedbackTranslate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

function createFeedbackSchema(t: SupportFeedbackTranslate) {
  return z.object({
    subject: z
      .string()
      .trim()
      .min(
        MIN_SUBJECT_LENGTH,
        t("validation.subjectMin", { min: MIN_SUBJECT_LENGTH }),
      )
      .max(
        MAX_SUBJECT_LENGTH,
        t("validation.subjectMax", { max: MAX_SUBJECT_LENGTH }),
      ),
    message: z
      .string()
      .trim()
      .min(
        MIN_MESSAGE_LENGTH,
        t("validation.messageMin", { min: MIN_MESSAGE_LENGTH }),
      )
      .max(
        MAX_MESSAGE_LENGTH,
        t("validation.messageMax", { max: MAX_MESSAGE_LENGTH }),
      ),
  });
}

export async function submitSupportFeedback(locale: Locale, formData: FormData) {
  const t = await getTranslations({
    locale,
    namespace: "espace.support.feedback",
  });

  try {
    const session = await requireAdherent();
    const shellData = await getEspaceShellData(session.id);

    if (!shellData) {
      return { error: t("errors.accountNotFound") };
    }

    const feedbackSchema = createFeedbackSchema(t);
    const parsed = feedbackSchema.safeParse({
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? t("errors.invalidForm"),
      };
    }

    await createAdminFeedback({
      name: `${shellData.adherent.prenom} ${shellData.adherent.nom}`,
      email:
        shellData.adherent.email ?? `${shellData.adherent.numeroDossier}@local.test`,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    revalidatePath(`/${locale}/espace`);
    revalidatePath(`/${locale}/espace/support`);

    return { success: true };
  } catch (error) {
    console.error("submitSupportFeedback error:", error);
    return { error: t("errors.unexpected") };
  }
}
