import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const VALID_TRANSITIONS: Record<string, { from: string[]; newStatut: string }> = {
  to_atp:           { from: ["CRE"],        newStatut: "ATP" },
  validate_payment: { from: ["ATP", "ATT"], newStatut: "APP" },
  activate:         { from: ["APP"],        newStatut: "ACT" },
  cancel:           { from: ["CRE", "ATP", "ATT", "APP", "ACT"], newStatut: "ANL" },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await req.json() as { action?: string };
    const action = body.action;

    if (!action || !VALID_TRANSITIONS[action]) {
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    const abo = await prisma.abonnement.findUnique({ where: { id } });
    if (!abo) {
      return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 });
    }

    const transition = VALID_TRANSITIONS[action];
    if (!transition.from.includes(abo.statut)) {
      return NextResponse.json(
        { error: `Transition impossible depuis ${abo.statut}` },
        { status: 409 }
      );
    }

    await prisma.abonnement.update({
      where: { id },
      data: { statut: transition.newStatut },
    });

    return NextResponse.json({ success: true, newStatut: transition.newStatut });
  } catch (error) {
    console.error("Abonnement action error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
