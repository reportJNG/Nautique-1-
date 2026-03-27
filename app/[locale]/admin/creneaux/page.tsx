// app/[locale]/admin/creneaux/page.tsx
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JOURS_SEMAINE } from "@/lib/constants";

async function getCreneaux() {
  return prisma.creneau.findMany({
    include: {
      discipline: { include: { espace: true } },
      saison: true,
      _count: {
        select: { abonnements: true },
      },
    },
    orderBy: [{ jourSemaine: "asc" }, { heureDebut: "asc" }],
  });
}

export default async function CreneauxPage() {
  const creneaux = await getCreneaux();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Gestion des créneaux
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Liste des créneaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-500">
                  <th className="pb-3">Discipline</th>
                  <th className="pb-3">Espace</th>
                  <th className="pb-3">Jour</th>
                  <th className="pb-3">Horaire</th>
                  <th className="pb-3">Groupe</th>
                  <th className="pb-3">Inscrits</th>
                </tr>
              </thead>
              <tbody>
                {creneaux.map((creneau) => (
                  <tr key={creneau.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="py-3">{creneau.discipline.designation}</td>
                    <td className="py-3">
                      <Badge variant="outline">{creneau.discipline.espace.code}</Badge>
                    </td>
                    <td className="py-3">{JOURS_SEMAINE[creneau.jourSemaine]}</td>
                    <td className="py-3">{creneau.heureDebut} - {creneau.heureFin}</td>
                    <td className="py-3">{creneau.groupe || "-"}</td>
                    <td className="py-3">
                      {creneau._count.abonnements} / {creneau.nombreMax}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
