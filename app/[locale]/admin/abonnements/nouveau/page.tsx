import { prisma } from "@/lib/db/prisma";
import { NouvelAbonnementClient } from "./NouvelAbonnementClient";

async function getData() {
  const [adherents, disciplines, saisons, categories] = await Promise.all([
    prisma.adherent.findMany({
      where: { actif: 1 },
      select: { id: true, prenom: true, nom: true, numeroDossier: true },
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    }),
    prisma.discipline.findMany({
      where: { actif: 1 },
      select: { id: true, designation: true },
      orderBy: { designation: "asc" },
    }),
    prisma.saison.findMany({
      where: { statut: "OUV" },
      select: { id: true, designation: true },
      orderBy: { dateDebut: "desc" },
    }),
    prisma.categorieAge.findMany({
      select: { id: true, designation: true },
      orderBy: { designation: "asc" },
    }),
  ]);
  return { adherents, disciplines, saisons, categories };
}

export default async function NouvelAbonnementPage() {
  const data = await getData();
  return <NouvelAbonnementClient {...data} />;
}
