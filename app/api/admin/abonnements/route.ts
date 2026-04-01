import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();

    const adherentId     = Number(fd.get("adherentId"));
    const disciplineId   = Number(fd.get("disciplineId"));
    const saisonId       = Number(fd.get("saisonId"));
    const typeAbonnement = String(fd.get("typeAbonnement") ?? "").trim();
    const montantTtc     = parseFloat(String(fd.get("montantTtc") ?? "0")) || 0;
    const categorieAgeId = fd.get("categorieAgeId") ? Number(fd.get("categorieAgeId")) : null;

    if (!adherentId || !disciplineId || !saisonId || !typeAbonnement) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    if (!categorieAgeId) {
      return NextResponse.json({ error: "Catégorie d'âge obligatoire" }, { status: 400 });
    }

    // Fetch saison for default dateDebut/dateFin
    const saison = await prisma.saison.findUnique({ where: { id: saisonId } });
    if (!saison) {
      return NextResponse.json({ error: "Saison introuvable" }, { status: 404 });
    }

    const abo = await prisma.abonnement.create({
      data: {
        adherentId,
        disciplineId,
        saisonId,
        typeAbonnement,
        montantTtc,
        statut:        "CRE",
        categorieAgeId,
        dateDebut:     saison.dateDebut,
        dateFin:       saison.dateFin,
      },
    });

    // Auto-create a pending facture
    await prisma.facture.create({
      data: {
        adherentId,
        abonnementId:  abo.id,
        montantTtc,
        statut:        "ATT",
        modePaiement:  "CSH",
        dateCreation:  new Date(),
      },
    });

    return NextResponse.json({ success: true, id: abo.id });
  } catch (error) {
    console.error("Create abonnement error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
