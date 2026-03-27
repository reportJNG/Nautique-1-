// app/[locale]/admin/abonnements/[id]/page.tsx
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUT_ABONNEMENT_STYLES, STATUT_ABONNEMENT } from "@/lib/constants";

async function getAbonnement(id: number) {
  return prisma.abonnement.findUnique({
    where: { id },
    include: {
      adherent: true,
      discipline: { include: { espace: true } },
      saison: true,
      categorieAge: true,
      creneaux: {
        include: {
          creneau: true,
        },
      },
      factures: true,
    },
  });
}

export default async function AbonnementDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const abonnement = await getAbonnement(parseInt(params.id));

  if (!abonnement) {
    return <div>Abonnement non trouvé</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Détail de l&apos;abonnement
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Adhérent</span>
              <span className="font-medium">
                {abonnement.adherent.prenom} {abonnement.adherent.nom}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Discipline</span>
              <span className="font-medium">{abonnement.discipline.designation}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Espace</span>
              <Badge variant="outline">{abonnement.discipline.espace.code}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Statut</span>
              <Badge className={STATUT_ABONNEMENT_STYLES[abonnement.statut]}>
                {STATUT_ABONNEMENT[abonnement.statut as keyof typeof STATUT_ABONNEMENT]}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Montant</span>
              <span className="font-medium">{Number(abonnement.montantTtc).toFixed(2)} DA</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {abonnement.statut === "CRE" && (
                <Button>Mettre ATP</Button>
              )}
              {abonnement.statut === "ATP" && (
                <Button>Valider paiement</Button>
              )}
              {abonnement.statut === "APP" && (
                <Button>Activer</Button>
              )}
              <Button variant="outline">Annuler</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
