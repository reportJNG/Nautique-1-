// DisciplinesSection.tsx
import DisciplinesSectionClient from "./DiscplinesSectionClient";
import { prisma } from "@/lib/db/prisma";

async function getDisciplines() {
  const espaces = await prisma.espace.findMany({
    where: { actif: 1 },
    include: {
      disciplines: {
        where: { actif: 1 },
        orderBy: { designation: "asc" },
      },
    },
    orderBy: { designation: "asc" },
  });
  return espaces;
}

export default async function DisciplinesSection() {
  const espaces = await getDisciplines();

  return <DisciplinesSectionClient espaces={espaces} />;
}