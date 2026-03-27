"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAgent } from "@/lib/auth/jwt";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generateNumeroRecu } from "@/lib/utils";

const validateSchema = z.object({
  id: z.string().transform(Number),
});

export async function validatePayment(formData: FormData) {
  const session = await requireAgent();

  try {
    const data = Object.fromEntries(formData);
    const parsed = validateSchema.safeParse(data);

    if (!parsed.success) {
      return { error: "Données invalides" };
    }

    const facture = await prisma.facture.findUnique({
      where: { id: parsed.data.id },
      include: { abonnement: true },
    });

    if (!facture) {
      return { error: "Facture non trouvée" };
    }

    if (facture.statut === "PAY") {
      return { error: "Facture déjà payée" };
    }

    const now = new Date();
    const year = now.getFullYear();

    // Get next sequence number
    const lastFacture = await prisma.facture.findFirst({
      where: {
        numeroRecu: { startsWith: `REC-${year}` },
      },
      orderBy: { numeroRecu: "desc" },
    });

    let sequence = 1;
    if (lastFacture?.numeroRecu) {
      const match = lastFacture.numeroRecu.match(/REC-\d{4}-(\d{5})/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }

    const numeroRecu = generateNumeroRecu(year, sequence);

    // Update facture
    await prisma.facture.update({
      where: { id: parsed.data.id },
      data: {
        statut: "PAY",
        datePaiement: now,
        numeroRecu,
        validatedBy: session.id,
      },
    });

    // Update abonnement status to APP (approved)
    await prisma.abonnement.update({
      where: { id: facture.abonnementId },
      data: { statut: "APP" },
    });

    revalidatePath("/[locale]/admin/factures");
    revalidatePath("/[locale]/admin/abonnements");
    return { success: true };
  } catch (error) {
    console.error("Validate payment error:", error);
    return { error: "Une erreur est survenue" };
  }
}
