// app/[locale]/admin/saisons/[id]/page.tsx
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STATUT_SAISON_STYLES, JOURS_SEMAINE } from "@/lib/constants";

async function getSaison(id: number) {
  return prisma.saison.findUnique({
    where: { id },
    include: {
      periodes: true,
      creneaux: {
        include: {
          discipline: true,
        },
        orderBy: [{ jourSemaine: "asc" }, { heureDebut: "asc" }],
      },
    },
  });
}

export default async function SaisonDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const saison = await getSaison(parseInt(params.id));

  if (!saison) {
    return <div>Saison non trouvée</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        {saison.designation}
      </h1>

      <div className="mb-6 flex items-center gap-4">
        <Badge className={STATUT_SAISON_STYLES[saison.statut]}>
          {saison.statut}
        </Badge>
        <span className="text-gray-500">
          Du {new Date(saison.dateDebut).toLocaleDateString("fr-FR")} au{" "}
          {new Date(saison.dateFin).toLocaleDateString("fr-FR")}
        </span>
      </div>

      <Tabs defaultValue="creneaux">
        <TabsList>
          <TabsTrigger value="creneaux">Créneaux</TabsTrigger>
          <TabsTrigger value="periodes">Périodes</TabsTrigger>
        </TabsList>

        <TabsContent value="creneaux" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Créneaux de la saison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-gray-500">
                      <th className="pb-3">Discipline</th>
                      <th className="pb-3">Jour</th>
                      <th className="pb-3">Horaire</th>
                      <th className="pb-3">Groupe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saison.creneaux.map((creneau) => (
                      <tr key={creneau.id} className="border-b">
                        <td className="py-3">
                          {creneau.discipline.designation}
                        </td>
                        <td className="py-3">
                          {JOURS_SEMAINE[creneau.jourSemaine]}
                        </td>
                        <td className="py-3">
                          {creneau.heureDebut.toTimeString().slice(0, 5)} -{" "}
                          {creneau.heureFin.toTimeString().slice(0, 5)}
                        </td>{" "}
                        <td className="py-3">{creneau.groupe || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="periodes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Périodes de la saison</CardTitle>
            </CardHeader>
            <CardContent>
              {saison.periodes.length === 0 ? (
                <p className="text-gray-500">Aucune période définie</p>
              ) : (
                <div className="space-y-2">
                  {saison.periodes.map((periode) => (
                    <div key={periode.id} className="rounded-lg border p-3">
                      Du{" "}
                      {new Date(periode.dateDebut).toLocaleDateString("fr-FR")}{" "}
                      au {new Date(periode.dateFin).toLocaleDateString("fr-FR")}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
