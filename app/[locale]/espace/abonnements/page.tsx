// app/[locale]/espace/abonnements/page.tsx
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { STATUT_ABONNEMENT, STATUT_ABONNEMENT_STYLES, JOURS_SEMAINE } from "@/lib/constants";

async function getAbonnements(adherentId: number) {
  return prisma.abonnement.findMany({
    where: { adherentId },
    orderBy: { createdAt: "desc" },
    include: {
      discipline: { include: { espace: true } },
      saison: true,
      categorieAge: true,
      creneaux: {
        where: { actif: 1 },
        include: {
          creneau: true,
        },
      },
    },
  });
}

export default async function AdherentAbonnementsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getSession();
  if (!session || session.type !== "adherent") {
    return null;
  }

  const abonnements = await getAbonnements(session.id);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mes abonnements
        </h1>
        <Link href={`/${locale}/espace/abonnements/nouveau`}>
          <Button>
            <ArrowRight className="mr-2 h-4 w-4" />
            Nouvel abonnement
          </Button>
        </Link>
      </div>

      {abonnements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">Vous n&apos;avez aucun abonnement</p>
            <Link href={`/${locale}/espace/abonnements/nouveau`}>
              <Button className="mt-4">Créer un abonnement</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {abonnements.map((abonnement) => (
            <Card key={abonnement.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {abonnement.discipline.designation}
                      </h3>
                      <Badge variant="outline">
                        {abonnement.discipline.espace.designation}
                      </Badge>
                      <Badge className={STATUT_ABONNEMENT_STYLES[abonnement.statut]}>
                        {STATUT_ABONNEMENT[abonnement.statut as keyof typeof STATUT_ABONNEMENT]}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-500">
                      {abonnement.saison.designation} • {abonnement.categorieAge.designation}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Du {new Date(abonnement.dateDebut).toLocaleDateString("fr-FR")} au{" "}
                      {new Date(abonnement.dateFin).toLocaleDateString("fr-FR")}
                    </p>

                    {abonnement.creneaux.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Créneaux assignés :</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {abonnement.creneaux.map((ca) => (
                            <Badge key={ca.id} variant="secondary" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {JOURS_SEMAINE[ca.creneau.jourSemaine]} {ca.creneau.heureDebut}-{ca.creneau.heureFin}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {Number(abonnement.montantTtc).toFixed(2)} DA
                    </p>
                    <p className="text-sm text-gray-500">
                      {abonnement.typeAbonnement === "OPN" && "Open Saison"}
                      {abonnement.typeAbonnement === "DUR" && "Par durée"}
                      {abonnement.typeAbonnement === "SEA" && "Par séances"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
