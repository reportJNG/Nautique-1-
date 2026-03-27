// app/[locale]/admin/creneaux/[id]/page.tsx
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JOURS_SEMAINE } from "@/lib/constants";

async function getCreneau(id: number) {
  return prisma.creneau.findUnique({
    where: { id },
    include: {
      discipline: { include: { espace: true } },
      saison: true,
      moniteurs: {
        include: {
          moniteur: true,
        },
      },
      abonnements: {
        where: { actif: 1 },
        include: {
          abonnement: {
            include: {
              adherent: true,
            },
          },
        },
      },
    },
  });
}

export default async function CreneauDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const creneau = await getCreneau(parseInt(params.id));

  if (!creneau) {
    return <div>Créneau non trouvé</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Détail du créneau
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Discipline</span>
              <span className="font-medium">
                {creneau.discipline.designation}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Espace</span>
              <Badge variant="outline">{creneau.discipline.espace.code}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Jour</span>
              <span className="font-medium">
                {JOURS_SEMAINE[creneau.jourSemaine]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Horaire</span>
              <span className="font-medium">
                {creneau.heureDebut.toLocaleTimeString()} -{" "}
                {creneau.heureFin.toLocaleTimeString()}
              </span>{" "}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Capacité</span>
              <span className="font-medium">
                {creneau.nombreMin} - {creneau.nombreMax}
              </span>
            </div>
            {creneau.groupe && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Groupe</span>
                <span className="font-medium">{creneau.groupe}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moniteurs</CardTitle>
          </CardHeader>
          <CardContent>
            {creneau.moniteurs.length === 0 ? (
              <p className="text-gray-500">Aucun moniteur assigné</p>
            ) : (
              <div className="space-y-2">
                {creneau.moniteurs.map((cm) => (
                  <div key={cm.id} className="rounded-lg border p-3">
                    {cm.moniteur.prenom} {cm.moniteur.nom}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inscrits ({creneau.abonnements.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {creneau.abonnements.length === 0 ? (
              <p className="text-gray-500">Aucun inscrit</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {creneau.abonnements.map((ca) => (
                  <div key={ca.id} className="rounded-lg border p-3">
                    <p className="font-medium">
                      {ca.abonnement.adherent.prenom}{" "}
                      {ca.abonnement.adherent.nom}
                    </p>
                    <p className="text-sm text-gray-500">
                      {ca.abonnement.adherent.numeroDossier}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
