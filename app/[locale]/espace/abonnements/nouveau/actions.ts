"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdherent } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type AbonnementStatus = "CRE" | "ATP" | "ACT" | "APP";

export interface CreateAdherentAbonnementInput {
  adherentId: number;
  saisonId: number;
  disciplineId: number;
  categorieAgeId: number;
  typeAbonnement: "OPN" | "DUR" | "SEA";
  creneauIds: number[];
}

export interface CreateAdherentAbonnementResult {
  success?: true;
  abonnementId?: number;
  error?: string;
}

export interface LookupAdherentInput {
  numeroDossier: string;
}

export interface LookupAdherentResult {
  id?: number;
  nom?: string;
  prenom?: string;
  age?: number;
  sexe?: string;
  numeroDossier?: string;
  error?: string;
}

export interface SubmitAbonnementToAdminInput {
  abonnementId: number;
}

export interface SubmitAbonnementToAdminResult {
  success?: true;
  error?: string;
}

export interface ConfirmPaymentInput {
  factureId: number;
  modePaiement: "CRD" | "CSH";
}

export interface ConfirmPaymentResult {
  success?: true;
  error?: string;
}

const createAbonnementSchema = z.object({
  adherentId: z.coerce.number().int().positive(),
  saisonId: z.coerce.number().int().positive(),
  disciplineId: z.coerce.number().int().positive(),
  categorieAgeId: z.coerce.number().int().positive(),
  typeAbonnement: z.enum(["OPN", "DUR", "SEA"]),
  creneauIds: z.array(z.coerce.number().int().positive()).default([]),
});

const lookupSchema = z.object({
  numeroDossier: z.string().trim().min(1),
});

const submitSchema = z.object({
  abonnementId: z.coerce.number().int().positive(),
});

const confirmPaymentSchema = z.object({
  factureId: z.coerce.number().int().positive(),
  modePaiement: z.enum(["CRD", "CSH"]),
});

function calculateAge(dateNaissance: Date) {
  const today = new Date();
  let age = today.getFullYear() - dateNaissance.getFullYear();
  const monthDiff = today.getMonth() - dateNaissance.getMonth();
  const birthdayPassed =
    monthDiff > 0 ||
    (monthDiff === 0 && today.getDate() >= dateNaissance.getDate());

  if (!birthdayPassed) {
    age -= 1;
  }

  return age;
}

async function getRequesterAndTarget(targetAdherentId: number) {
  const session = await requireAdherent();
  const [requester, target] = await Promise.all([
    prisma.adherent.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        organisationId: true,
      },
    }),
    prisma.adherent.findUnique({
      where: { id: targetAdherentId },
      select: {
        id: true,
        organisationId: true,
        dateNaissance: true,
        sexe: true,
      },
    }),
  ]);

  if (!requester) {
    return { error: "Adherent introuvable." } as const;
  }

  if (!target) {
    return { error: "Beneficiaire introuvable." } as const;
  }

  if (requester.organisationId !== target.organisationId) {
    return { error: "Ce dossier ne peut pas etre gere depuis votre espace." } as const;
  }

  return { session, requester, target } as const;
}

async function getManagedAbonnement(abonnementId: number) {
  const session = await requireAdherent();

  const abonnement = await prisma.abonnement.findFirst({
    where: {
      id: abonnementId,
      OR: [
        { adherentId: session.id },
        { factures: { some: { adherentId: session.id } } },
      ],
    },
    include: {
      factures: {
        where: { adherentId: session.id },
        orderBy: { dateCreation: "desc" },
      },
    },
  });

  if (!abonnement) {
    return { error: "Abonnement introuvable." } as const;
  }

  return { session, abonnement } as const;
}

export async function lookupAdherent(
  input: LookupAdherentInput | string,
): Promise<LookupAdherentResult> {
  const session = await requireAdherent();
  const parsed = lookupSchema.safeParse(
    typeof input === "string" ? { numeroDossier: input } : input,
  );

  if (!parsed.success) {
    return { error: "Numero de dossier invalide." };
  }

  try {
    const requester = await prisma.adherent.findUnique({
      where: { id: session.id },
      select: { organisationId: true },
    });

    if (!requester) {
      return { error: "Adherent introuvable." };
    }

    const adherent = await prisma.adherent.findFirst({
      where: {
        numeroDossier: parsed.data.numeroDossier,
        organisationId: requester.organisationId,
        actif: 1,
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        dateNaissance: true,
        sexe: true,
        numeroDossier: true,
      },
    });

    if (!adherent) {
      return { error: "Aucun adherent trouve pour ce numero de dossier." };
    }

    return {
      id: adherent.id,
      nom: adherent.nom,
      prenom: adherent.prenom,
      age: calculateAge(adherent.dateNaissance),
      sexe: adherent.sexe,
      numeroDossier: adherent.numeroDossier,
    };
  } catch (error) {
    console.error("lookupAdherent error", error);
    return { error: "Recherche impossible pour le moment." };
  }
}

export async function createAdherentAbonnement(
  input: CreateAdherentAbonnementInput,
): Promise<CreateAdherentAbonnementResult> {
  const parsed = createAbonnementSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  try {
    const {
      adherentId,
      saisonId,
      disciplineId,
      categorieAgeId,
      typeAbonnement,
      creneauIds,
    } = parsed.data;
    const ownership = await getRequesterAndTarget(adherentId);

    if ("error" in ownership) {
      return { error: ownership.error };
    }

    const { session, target } = ownership;
    const [saison, discipline, categorieAge, existingAbonnement] =
      await Promise.all([
        prisma.saison.findUnique({ where: { id: saisonId } }),
        prisma.discipline.findUnique({
          where: { id: disciplineId },
          include: { espace: true },
        }),
        prisma.categorieAge.findUnique({ where: { id: categorieAgeId } }),
        prisma.abonnement.findFirst({
          where: {
            adherentId,
            saisonId,
            disciplineId,
            statut: { in: ["CRE", "ATP", "ACT", "APP"] satisfies AbonnementStatus[] },
          },
        }),
      ]);

    if (!saison || saison.statut !== "OUV") {
      return { error: "La saison selectionnee n'est pas disponible." };
    }

    if (!discipline || !categorieAge || categorieAge.espaceId !== discipline.espaceId) {
      return { error: "Les donnees choisies ne correspondent pas." };
    }

    if (existingAbonnement) {
      return {
        error: "Un abonnement existe deja pour cette discipline et cette saison.",
      };
    }

    const age = calculateAge(target.dateNaissance);
    const categoryAllowed =
      age >= categorieAge.ageMin &&
      (categorieAge.ageMax === null || age <= categorieAge.ageMax);

    if (!categoryAllowed) {
      return { error: "La categorie d'age choisie ne correspond pas au profil." };
    }

    if (typeAbonnement === "OPN" && creneauIds.length > 0) {
      return { error: "Aucun creneau fixe n'est requis pour une formule open." };
    }

    if (typeAbonnement !== "OPN" && creneauIds.length > 0) {
      const creneaux = await prisma.creneau.findMany({
        where: {
          id: { in: creneauIds },
          disciplineId,
          saisonId,
          actif: 1,
        },
        include: {
          categoriesAge: true,
        },
      });

      if (creneaux.length !== creneauIds.length) {
        return { error: "Un ou plusieurs creneaux sont invalides." };
      }

      const invalidSelection = creneaux.some((creneau) => {
        if (creneau.categoriesAge.length === 0) {
          return false;
        }

        return !creneau.categoriesAge.some((item) => {
          const categoryOk = item.categorieAgeId === categorieAgeId;
          const genderOk = !item.sexeAutorise || item.sexeAutorise === target.sexe;
          return categoryOk && genderOk;
        });
      });

      if (invalidSelection) {
        return {
          error: "Les creneaux choisis ne sont pas compatibles avec ce profil.",
        };
      }
    }

    const typeBase =
      typeAbonnement === "OPN" ? 8500 : typeAbonnement === "DUR" ? 5200 : 3200;
    const creneauBoost =
      typeAbonnement === "OPN" ? 0 : Math.max(creneauIds.length, 1) * 250;
    const espaceBoost = discipline.espace.code === "NAU" ? 900 : 600;
    const montantTtc = typeBase + creneauBoost + espaceBoost;

    const abonnement = await prisma.abonnement.create({
      data: {
        adherentId,
        saisonId,
        disciplineId,
        categorieAgeId,
        typeAbonnement,
        statut: "ATP",
        montantTtc,
        dateDebut: saison.dateDebut,
        dateFin: saison.dateFin,
      },
    });

    if (typeAbonnement !== "OPN" && creneauIds.length > 0) {
      await prisma.creneauAbonnement.createMany({
        data: creneauIds.map((creneauId) => ({
          abonnementId: abonnement.id,
          creneauId,
          actif: 1,
        })),
      });
    }

    await prisma.facture.create({
      data: {
        adherentId: session.id,
        abonnementId: abonnement.id,
        montantTtc,
        statut: "ATT",
        modePaiement: "CSH",
        dateCreation: new Date(),
      },
    });

    revalidatePath("/", "layout");

    return { success: true, abonnementId: abonnement.id };
  } catch (error) {
    console.error("createAdherentAbonnement error", error);
    return { error: "Impossible de creer l'abonnement pour le moment." };
  }
}

export async function submitAbonnementToAdmin(
  input: SubmitAbonnementToAdminInput | number,
): Promise<SubmitAbonnementToAdminResult> {
  const parsed = submitSchema.safeParse(
    typeof input === "number" ? { abonnementId: input } : input,
  );

  if (!parsed.success) {
    return { error: "Abonnement invalide." };
  }

  try {
    const managed = await getManagedAbonnement(parsed.data.abonnementId);

    if ("error" in managed) {
      return { error: managed.error };
    }

    if (managed.abonnement.statut !== "CRE") {
      return { error: "Seuls les brouillons peuvent etre soumis." };
    }

    await prisma.abonnement.update({
      where: { id: managed.abonnement.id },
      data: { statut: "ATP" },
    });

    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("submitAbonnementToAdmin error", error);
    return { error: "Impossible de soumettre cet abonnement pour le moment." };
  }
}

export async function confirmPayment(
  input: ConfirmPaymentInput,
): Promise<ConfirmPaymentResult> {
  const parsed = confirmPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Paiement invalide." };
  }

  try {
    const session = await requireAdherent();
    const facture = await prisma.facture.findFirst({
      where: {
        id: parsed.data.factureId,
        adherentId: session.id,
      },
      include: {
        abonnement: true,
      },
    });

    if (!facture) {
      return { error: "Facture introuvable." };
    }

    if (facture.statut === "PAY") {
      return { error: "Cette facture est deja reglee." };
    }

    if (facture.abonnement.statut !== "ACT") {
      return {
        error: "Le paiement est disponible uniquement apres validation administrative.",
      };
    }

    await prisma.$transaction([
      prisma.facture.update({
        where: { id: facture.id },
        data: {
          statut: "PAY",
          modePaiement: parsed.data.modePaiement,
          datePaiement: new Date(),
        },
      }),
      prisma.abonnement.update({
        where: { id: facture.abonnementId },
        data: {
          statut: "APP",
        },
      }),
    ]);

    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("confirmPayment error", error);
    return { error: "Impossible de confirmer ce paiement pour le moment." };
  }
}
