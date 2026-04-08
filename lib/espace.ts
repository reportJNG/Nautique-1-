import { prisma } from "@/lib/db/prisma";
import { STATUT_ABONNEMENT, STATUT_FACTURE, TYPE_ABONNEMENT, JOURS_SEMAINE } from "@/lib/constants";
import { getEspaceNews, getFeedbackForMember } from "@/lib/espace-content";

type CreneauLike = {
  jourSemaine: number;
  heureDebut: Date;
  heureFin: Date;
  discipline?: { designation: string } | null;
};

function inferOneBasedWeek(days: number[]) {
  if (days.length === 0) {
    return false;
  }

  if (days.some((day) => day === 7)) {
    return true;
  }

  return !days.some((day) => day === 0) && days.every((day) => day >= 1 && day <= 7);
}

function normalizeDayIndex(day: number, oneBasedWeek: boolean) {
  if (oneBasedWeek) {
    return day % 7;
  }

  return ((day % 7) + 7) % 7;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function computeNextOccurrence(creneau: CreneauLike, from = new Date()) {
  const now = new Date(from);
  const candidate = startOfDay(now);
  const normalizedDay = normalizeDayIndex(
    creneau.jourSemaine,
    creneau.jourSemaine >= 1 && creneau.jourSemaine <= 7
  );
  const dayOffset = (normalizedDay - candidate.getDay() + 7) % 7;
  candidate.setDate(candidate.getDate() + dayOffset);
  candidate.setHours(
    creneau.heureDebut.getHours(),
    creneau.heureDebut.getMinutes(),
    0,
    0
  );

  if (candidate <= now) {
    candidate.setDate(candidate.getDate() + 7);
  }

  return candidate;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(date: Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

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

export async function getEspaceShellData(adherentId: number) {
  const [adherent, abonnements, factures, acces, centre] = await Promise.all([
    prisma.adherent.findUnique({
      where: { id: adherentId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        numeroDossier: true,
        email: true,
        telephone: true,
        organisation: { select: { designation: true } },
      },
    }),
    prisma.abonnement.findMany({
      where: { adherentId },
      include: {
        discipline: true,
        saison: true,
        creneaux: {
          where: { actif: 1 },
          include: { creneau: { include: { discipline: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.facture.findMany({
      where: { adherentId },
      orderBy: { dateCreation: "desc" },
      take: 5,
    }),
    prisma.seanceAcces.findMany({
      where: { abonnement: { adherentId } },
      include: {
        creneau: { include: { discipline: true } },
      },
      orderBy: [{ dateAcces: "desc" }, { heureAcces: "desc" }],
      take: 5,
    }),
    prisma.parametres.findFirst({
      select: {
        designationCentre: true,
        telephoneCentre: true,
        emailCentre: true,
      },
    }),
  ]);

  if (!adherent) {
    return null;
  }

  const [news, feedback] = await Promise.all([
    getEspaceNews("fr"),
    getFeedbackForMember(adherent.email ?? `${adherent.numeroDossier}@local.test`),
  ]);

  const activeAbonnements = abonnements.filter((item) => item.statut === "ACT");
  const pendingFactures = factures.filter((item) => item.statut === "ATT");
  const loyaltyPoints =
    activeAbonnements.length * 180 +
    acces.filter((item) => item.accesAutorise === 1).length * 12 +
    factures.filter((item) => item.statut === "PAY").length * 35;
  const loyaltyTier =
    loyaltyPoints >= 900 ? "Ocean+" :
    loyaltyPoints >= 500 ? "Lagoon" :
    "Starter";
  const allCreneaux = activeAbonnements.flatMap((item) =>
    item.creneaux.map((ca) => ca.creneau)
  );
  const nextSession = allCreneaux
    .map((creneau) => ({ creneau, at: computeNextOccurrence(creneau) }))
    .sort((a, b) => a.at.getTime() - b.at.getTime())[0];

  const notifications = [
    pendingFactures[0]
      ? {
          id: `facture-${pendingFactures[0].id}`,
          title: "Paiement en attente",
          description: `Une facture de ${formatCurrency(
            Number(pendingFactures[0].montantTtc)
          )} attend votre reglement.`,
          time: formatDate(pendingFactures[0].dateCreation),
          href: "/espace/factures",
          variant: "warning" as const,
        }
      : null,
    nextSession
      ? {
          id: `session-${nextSession.creneau.id}`,
          title: "Prochaine seance",
          description: `${nextSession.creneau.discipline?.designation ?? "Activite"} le ${
            JOURS_SEMAINE[nextSession.creneau.jourSemaine]
          } a ${formatTime(nextSession.creneau.heureDebut)}.`,
          time: formatDate(nextSession.at, {
            weekday: "short",
            day: "numeric",
            month: "short",
          }),
          href: "/espace/acces",
          variant: "info" as const,
        }
      : null,
    activeAbonnements[0]
      ? {
          id: `abo-${activeAbonnements[0].id}`,
          title: "Abonnement actif",
          description: `${activeAbonnements[0].discipline.designation} est disponible jusqu'au ${formatDate(
            activeAbonnements[0].dateFin
          )}.`,
          time: activeAbonnements[0].saison.designation,
          href: "/espace/abonnements",
          variant: "success" as const,
        }
      : null,
    acces[0]
      ? {
          id: `acces-${acces[0].id}`,
          title: acces[0].accesAutorise ? "Dernier acces autorise" : "Acces refuse",
          description: `${acces[0].creneau.discipline.designation} a ${formatTime(
            acces[0].heureAcces
          )}.`,
          time: formatDate(acces[0].dateAcces),
          href: "/espace/acces",
          variant: acces[0].accesAutorise ? ("neutral" as const) : ("danger" as const),
        }
      : null,
  ].flatMap((item) => (item ? [item] : []));

  return {
    adherent,
    centre: centre ?? null,
    stats: {
      totalAbonnements: abonnements.length,
      activeAbonnements: activeAbonnements.length,
      pendingFactures: pendingFactures.length,
      lastAccessAt: acces[0]
        ? `${formatDate(acces[0].dateAcces)} a ${formatTime(acces[0].heureAcces)}`
        : "Aucun acces enregistre",
      nextSessionLabel: nextSession
        ? `${JOURS_SEMAINE[nextSession.creneau.jourSemaine]} ${formatTime(
            nextSession.creneau.heureDebut
          )}`
        : "Aucune seance planifiee",
    },
    context: {
      loyaltyPoints,
      loyaltyTier,
      feedbackCount: feedback.length,
      newsCount: news.length,
      centreStatus: pendingFactures.length > 0 ? "Action requise" : "Compte fluide",
    },
    notifications,
  };
}

export async function getEspaceDashboardData(adherentId: number) {
  const [abonnements, factures, acces] = await Promise.all([
    prisma.abonnement.findMany({
      where: { adherentId },
      orderBy: { createdAt: "desc" },
      include: {
        discipline: { include: { espace: true } },
        saison: true,
        creneaux: {
          where: { actif: 1 },
          include: { creneau: { include: { discipline: true } } },
        },
      },
    }),
    prisma.facture.findMany({
      where: { adherentId },
      orderBy: { dateCreation: "desc" },
      include: {
        abonnement: {
          include: {
            discipline: true,
          },
        },
      },
      take: 4,
    }),
    prisma.seanceAcces.findMany({
      where: { abonnement: { adherentId } },
      orderBy: [{ dateAcces: "desc" }, { heureAcces: "desc" }],
      include: {
        creneau: true,
        abonnement: {
          include: {
            discipline: true,
          },
        },
      },
      take: 4,
    }),
  ]);

  const activeAbonnements = abonnements.filter((item) => item.statut === "ACT");
  const nextSession = activeAbonnements
    .flatMap((item) => item.creneaux.map((ca) => ca.creneau))
    .map((creneau) => ({ creneau, at: computeNextOccurrence(creneau) }))
    .sort((a, b) => a.at.getTime() - b.at.getTime())[0];

  return {
    totals: {
      abonnements: abonnements.length,
      activeAbonnements: activeAbonnements.length,
      pendingFactures: factures.filter((item) => item.statut === "ATT").length,
      disciplines: new Set(activeAbonnements.map((item) => item.disciplineId)).size,
    },
    abonnements,
    recentFactures: factures.map((item) => ({
      id: item.id,
      statusCode: item.statut,
      statut: STATUT_FACTURE[item.statut as keyof typeof STATUT_FACTURE] ?? item.statut,
      amount: formatCurrency(Number(item.montantTtc)),
      createdAt: formatDate(item.dateCreation),
      discipline: item.abonnement.discipline.designation,
    })),
    recentAccess: acces.map((item) => ({
      id: item.id,
      discipline: item.abonnement.discipline.designation,
      date: formatDate(item.dateAcces),
      time: formatTime(item.heureAcces),
      authorized: item.accesAutorise === 1,
    })),
    nextSession: nextSession
      ? {
          discipline: nextSession.creneau.discipline?.designation ?? "Activite",
          day: JOURS_SEMAINE[nextSession.creneau.jourSemaine],
          date: formatDate(nextSession.at, {
            weekday: "short",
            day: "numeric",
            month: "short",
          }),
          start: formatTime(nextSession.creneau.heureDebut),
          end: formatTime(nextSession.creneau.heureFin),
        }
      : null,
  };
}

export async function getEspaceAbonnementsData(adherentId: number) {
  const abonnements = await prisma.abonnement.findMany({
    where: {
      OR: [{ adherentId }, { factures: { some: { adherentId } } }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      adherent: true,
      discipline: { include: { espace: true } },
      saison: true,
      categorieAge: true,
      creneaux: {
        where: { actif: 1 },
        include: { creneau: true },
      },
      factures: {
        where: { adherentId },
        orderBy: { dateCreation: "desc" },
        take: 1,
      },
    },
  });

  return abonnements.map((abonnement) => {
    const rawDays = abonnement.creneaux.map((item) => item.creneau.jourSemaine);
    const oneBasedWeek = inferOneBasedWeek(rawDays);

    return {
      id: abonnement.id,
      designation: abonnement.discipline.designation,
      beneficiaryName: `${abonnement.adherent.prenom} ${abonnement.adherent.nom}`,
      beneficiaryDossier: abonnement.adherent.numeroDossier,
      espace: abonnement.discipline.espace.designation,
      saison: abonnement.saison.designation,
      saisonDateRange: `${formatDate(abonnement.saison.dateDebut)} - ${formatDate(abonnement.saison.dateFin)}`,
      categorie: abonnement.categorieAge.designation,
      statut:
        STATUT_ABONNEMENT[abonnement.statut as keyof typeof STATUT_ABONNEMENT] ??
        abonnement.statut,
      statutCode: abonnement.statut,
      type:
        TYPE_ABONNEMENT[
          abonnement.typeAbonnement as keyof typeof TYPE_ABONNEMENT
        ] ?? abonnement.typeAbonnement,
      startDate: formatDate(abonnement.dateDebut),
      endDate: formatDate(abonnement.dateFin),
      amount: formatCurrency(Number(abonnement.montantTtc)),
      creneaux: abonnement.creneaux.map((item) => {
        const dayIndex = normalizeDayIndex(item.creneau.jourSemaine, oneBasedWeek);
        return {
          id: item.id,
          dayIndex,
          dayLabel: JOURS_SEMAINE[dayIndex],
          start: formatTime(item.creneau.heureDebut),
          end: formatTime(item.creneau.heureFin),
          group: item.creneau.groupe,
          label: `${JOURS_SEMAINE[dayIndex]} ${formatTime(item.creneau.heureDebut)} - ${formatTime(item.creneau.heureFin)}`,
        };
      }),
      factureId: abonnement.factures[0]?.id ?? null,
      invoiceStatus: abonnement.factures[0]?.statut ?? null,
      invoiceNumber: abonnement.factures[0]?.numeroRecu ?? null,
      invoiceMode: abonnement.factures[0]?.modePaiement ?? null,
      invoicePaidAt: abonnement.factures[0]?.datePaiement
        ? formatDate(abonnement.factures[0].datePaiement)
        : null,
    };
  });
}

export async function getEspaceFacturesData(adherentId: number) {
  const factures = await prisma.facture.findMany({
    where: { adherentId },
    orderBy: { dateCreation: "desc" },
    include: {
      abonnement: {
        include: {
          discipline: { include: { espace: true } },
          saison: true,
        },
      },
    },
  });

  const totalOutstanding = factures
    .filter((item) => item.statut === "ATT")
    .reduce((sum, item) => sum + Number(item.montantTtc), 0);

  return {
    total: factures.length,
    pending: factures.filter((item) => item.statut === "ATT").length,
    paid: factures.filter((item) => item.statut === "PAY").length,
    outstandingAmount: formatCurrency(totalOutstanding),
    items: factures.map((item) => ({
      id: item.id,
      receiptNumber: item.numeroRecu ?? `FAC-${item.id}`,
      statusCode: item.statut,
      statusLabel: STATUT_FACTURE[item.statut as keyof typeof STATUT_FACTURE] ?? item.statut,
      amount: formatCurrency(Number(item.montantTtc)),
      createdAt: formatDate(item.dateCreation),
      paidAt: item.datePaiement ? formatDate(item.datePaiement) : null,
      mode: item.modePaiement,
      discipline: item.abonnement.discipline.designation,
      espace: item.abonnement.discipline.espace.designation,
      saison: item.abonnement.saison.designation,
    })),
  };
}

export async function getEspaceAccessData(adherentId: number) {
  const sessions = await prisma.seanceAcces.findMany({
    where: { abonnement: { adherentId } },
    orderBy: [{ dateAcces: "desc" }, { heureAcces: "desc" }],
    include: {
      abonnement: {
        include: {
          discipline: true,
        },
      },
      creneau: true,
    },
  });

  return {
    total: sessions.length,
    authorized: sessions.filter((item) => item.accesAutorise === 1).length,
    denied: sessions.filter((item) => item.accesAutorise !== 1).length,
    sessions: sessions.map((item) => ({
      id: item.id,
      discipline: item.abonnement.discipline.designation,
      date: formatDate(item.dateAcces, {
        weekday: "short",
        day: "numeric",
        month: "long",
      }),
      time: formatTime(item.heureAcces),
      slot: `${JOURS_SEMAINE[item.creneau.jourSemaine]} ${formatTime(item.creneau.heureDebut)} - ${formatTime(item.creneau.heureFin)}`,
      badge: item.avecBadge === 1,
      authorized: item.accesAutorise === 1,
    })),
  };
}

export async function getEspaceProfileData(adherentId: number) {
  const [adherent, abonnements, factures, acces] = await Promise.all([
    prisma.adherent.findUnique({
      where: { id: adherentId },
      include: {
        organisation: true,
      },
    }),
    prisma.abonnement.findMany({
      where: { adherentId },
      include: {
        discipline: true,
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.facture.findMany({
      where: { adherentId },
      orderBy: { dateCreation: "desc" },
      take: 3,
    }),
    prisma.seanceAcces.findMany({
      where: { abonnement: { adherentId } },
      orderBy: [{ dateAcces: "desc" }, { heureAcces: "desc" }],
      take: 3,
    }),
  ]);

  if (!adherent) {
    return null;
  }

  return {
    adherent,
    stats: {
      activeAbonnements: abonnements.filter((item) => item.statut === "ACT").length,
      paidFactures: factures.filter((item) => item.statut === "PAY").length,
      acces: acces.length,
      organisation: adherent.organisation.designation,
    },
    recentActivity: [
      ...abonnements.map((item) => ({
        id: `abo-${item.id}`,
        title: `Abonnement ${item.discipline.designation}`,
        description: `${STATUT_ABONNEMENT[item.statut as keyof typeof STATUT_ABONNEMENT] ?? item.statut} • cree le ${formatDate(item.createdAt)}`,
      })),
      ...factures.map((item) => ({
        id: `fac-${item.id}`,
        title: `Facture ${item.numeroRecu ?? `#${item.id}`}`,
        description: `${STATUT_FACTURE[item.statut as keyof typeof STATUT_FACTURE] ?? item.statut} • ${formatCurrency(Number(item.montantTtc))}`,
      })),
    ].slice(0, 5),
  };
}

export async function getEspaceSubscriptionFormData(adherentId: number) {
  const adherent = await prisma.adherent.findUnique({
    where: { id: adherentId },
    select: {
      id: true,
      nom: true,
      prenom: true,
      numeroDossier: true,
      dateNaissance: true,
      sexe: true,
    },
  });

  if (!adherent) {
    return null;
  }

  const age = calculateAge(adherent.dateNaissance);
  const [espaces, saisons] = await Promise.all([
    prisma.espace.findMany({
      where: { actif: 1 },
      orderBy: { designation: "asc" },
      include: {
        disciplines: {
          where: { actif: 1 },
          orderBy: { designation: "asc" },
          include: {
            creneaux: {
              where: {
                actif: 1,
                saison: { statut: "OUV" },
              },
              include: {
                saison: true,
                categoriesAge: {
                  include: {
                    categorieAge: true,
                  },
                },
              },
              orderBy: [{ jourSemaine: "asc" }, { heureDebut: "asc" }],
            },
          },
        },
        categoriesAge: {
          orderBy: { ageMin: "asc" },
        },
      },
    }),
    prisma.saison.findMany({
      where: { statut: "OUV" },
      orderBy: { dateDebut: "asc" },
    }),
  ]);

  return {
    adherent: {
      id: adherent.id,
      nom: adherent.nom,
      prenom: adherent.prenom,
      numeroDossier: adherent.numeroDossier,
      age,
      sexe: adherent.sexe,
    },
    saisons: saisons.map((saison) => ({
      id: saison.id,
      designation: saison.designation,
      dateRange: `${formatDate(saison.dateDebut)} - ${formatDate(saison.dateFin)}`,
      startDate: saison.dateDebut.toISOString(),
      endDate: saison.dateFin.toISOString(),
    })),
    espaces: espaces.map((espace) => ({
      id: espace.id,
      code: espace.code,
      designation: espace.designation,
      description: espace.description ?? "",
      categories: espace.categoriesAge.map((category) => ({
        id: category.id,
        designation: category.designation,
        ageMin: category.ageMin,
        ageMax: category.ageMax,
        ageRange:
          category.ageMax === null
            ? `${category.ageMin}+`
            : `${category.ageMin} - ${category.ageMax} ans`,
      })),
      disciplines: espace.disciplines.map((discipline) => ({
        id: discipline.id,
        designation: discipline.designation,
        availableSaisonIds: Array.from(new Set(discipline.creneaux.map((creneau) => creneau.saisonId))),
        creneaux: discipline.creneaux.map((creneau) => {
          const dayIndex = normalizeDayIndex(
            creneau.jourSemaine,
            inferOneBasedWeek([creneau.jourSemaine])
          );

          return {
            id: creneau.id,
            saisonId: creneau.saisonId,
            jourSemaine: dayIndex,
            heureDebut: formatTime(creneau.heureDebut),
            heureFin: formatTime(creneau.heureFin),
            groupe: creneau.groupe,
            label: `${JOURS_SEMAINE[dayIndex]} - ${formatTime(creneau.heureDebut)} - ${formatTime(creneau.heureFin)}`,
            restrictions: creneau.categoriesAge.map((item) => ({
              categorieAgeId: item.categorieAgeId,
              sexeAutorise: item.sexeAutorise,
            })),
          };
        }),
      })),
    })),
  };
}

export async function getEspaceAbonnementPaymentData(
  requesterId: number,
  abonnementId: number
) {
  const abonnement = await prisma.abonnement.findFirst({
    where: {
      id: abonnementId,
      OR: [
        { adherentId: requesterId },
        { factures: { some: { adherentId: requesterId } } },
      ],
    },
    include: {
      adherent: true,
      discipline: { include: { espace: true } },
      saison: true,
      factures: {
        where: { adherentId: requesterId },
        orderBy: { dateCreation: "desc" },
        take: 1,
      },
    },
  });

  if (!abonnement || abonnement.factures.length === 0) {
    return null;
  }

  const facture = abonnement.factures[0];

  return {
    abonnement: {
      id: abonnement.id,
      designation: abonnement.discipline.designation,
      espace: abonnement.discipline.espace.designation,
      saison: abonnement.saison.designation,
      statutCode: abonnement.statut,
      statut:
        STATUT_ABONNEMENT[abonnement.statut as keyof typeof STATUT_ABONNEMENT] ??
        abonnement.statut,
      amount: formatCurrency(Number(abonnement.montantTtc)),
      beneficiaryName: `${abonnement.adherent.prenom} ${abonnement.adherent.nom}`,
      beneficiaryDossier: abonnement.adherent.numeroDossier,
    },
    facture: {
      id: facture.id,
      statusCode: facture.statut,
      statusLabel:
        STATUT_FACTURE[facture.statut as keyof typeof STATUT_FACTURE] ??
        facture.statut,
      amount: formatCurrency(Number(facture.montantTtc)),
      amountValue: Number(facture.montantTtc),
      receiptNumber: facture.numeroRecu ?? null,
      paidAt: facture.datePaiement ? formatDate(facture.datePaiement) : null,
      modePaiement: facture.modePaiement,
    },
  };
}

export async function getEspacePlanningData(adherentId: number) {
  const abonnements = await prisma.abonnement.findMany({
    where: {
      adherentId,
      statut: { in: ["ACT", "APP", "ATP"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      discipline: { include: { espace: true } },
      saison: true,
      categorieAge: true,
      creneaux: {
        where: { actif: 1 },
        include: {
          creneau: {
            include: {
              moniteurs: {
                include: {
                  moniteur: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const rawDays = abonnements.flatMap((abonnement) =>
    abonnement.creneaux.map((item) => item.creneau.jourSemaine)
  );
  const oneBasedWeek = inferOneBasedWeek(rawDays);

  const planning = JOURS_SEMAINE.map((day, dayIndex) => {
    const slots = abonnements.flatMap((abonnement) =>
      abonnement.creneaux
        .filter((item) => normalizeDayIndex(item.creneau.jourSemaine, oneBasedWeek) === dayIndex)
        .map((item) => ({
          id: `${abonnement.id}-${item.creneauId}`,
          discipline: abonnement.discipline.designation,
          espace: abonnement.discipline.espace.designation,
          season: abonnement.saison.designation,
          category: abonnement.categorieAge.designation,
          coaches: item.creneau.moniteurs.map(
            (moniteurItem) => `${moniteurItem.moniteur.prenom} ${moniteurItem.moniteur.nom}`
          ),
          group: item.creneau.groupe,
          start: formatTime(item.creneau.heureDebut),
          end: formatTime(item.creneau.heureFin),
          startSortValue:
            item.creneau.heureDebut.getHours() * 60 + item.creneau.heureDebut.getMinutes(),
          status: STATUT_ABONNEMENT[abonnement.statut as keyof typeof STATUT_ABONNEMENT] ?? abonnement.statut,
        }))
    );

    return {
      day,
      slots: slots
        .sort((a, b) => a.startSortValue - b.startSortValue)
        .map(
          ({
            id,
            discipline,
            espace,
            season,
            category,
            coaches,
            group,
            start,
            end,
            status,
          }) => ({
            id,
            discipline,
            espace,
            season,
            category,
            coaches,
            group,
            start,
            end,
            status,
          }),
        ),
    };
  });

  return {
    activeOffers: abonnements.length,
    totalSlots: planning.reduce((sum, item) => sum + item.slots.length, 0),
    planning,
  };
}
