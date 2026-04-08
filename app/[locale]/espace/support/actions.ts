"use server";

import { z } from "zod";
import { requireAdherent } from "@/lib/auth/session";
import { getEspaceShellData } from "@/lib/espace";
import { createAdminFeedback } from "@/lib/espace-content";

const feedbackSchema = z.object({
  subject: z.string().min(4).max(120),
  message: z.string().min(10).max(1200),
});

export async function submitSupportFeedback(formData: FormData) {
  const session = await requireAdherent();
  const shellData = await getEspaceShellData(session.id);

  if (!shellData) {
    return { error: "Compte introuvable." };
  }

  const parsed = feedbackSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  await createAdminFeedback({
    name: `${shellData.adherent.prenom} ${shellData.adherent.nom}`,
    email: shellData.adherent.email ?? `${shellData.adherent.numeroDossier}@local.test`,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  return { success: true };
}
