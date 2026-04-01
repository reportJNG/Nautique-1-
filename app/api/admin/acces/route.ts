import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const dossier = req.nextUrl.searchParams.get("dossier");
  if (!dossier) {
    return NextResponse.json({ granted: false, reason: "N° dossier manquant" }, { status: 400 });
  }

  try {
    const adherent = await prisma.adherent.findFirst({
      where: { numeroDossier: dossier },
      include: {
        abonnements: {
          where: { statut: "ACT" },
          include: { discipline: true, saison: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!adherent) {
      return NextResponse.json({
        granted: false,
        reason: "Adhérent introuvable",
        name: dossier,
      });
    }

    if (adherent.actif !== 1) {
      return NextResponse.json({
        granted: false,
        reason: "Compte désactivé",
        name: `${adherent.prenom} ${adherent.nom}`,
      });
    }

    const activeAbo = adherent.abonnements[0];
    if (!activeAbo) {
      return NextResponse.json({
        granted: false,
        reason: "Aucun abonnement actif",
        name: `${adherent.prenom} ${adherent.nom}`,
      });
    }

    // Access granted
    return NextResponse.json({
      granted: true,
      name: `${adherent.prenom} ${adherent.nom}`,
      discipline: activeAbo.discipline.designation,
      saison: activeAbo.saison.designation,
    });
  } catch (error) {
    console.error("Access check error:", error);
    return NextResponse.json({ granted: false, reason: "Erreur serveur" }, { status: 500 });
  }
}
