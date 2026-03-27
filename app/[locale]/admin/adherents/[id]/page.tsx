// app/[locale]/admin/adherents/[id]/page.tsx
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, Calendar, Building } from "lucide-react";

async function getAdherent(id: number) {
  return prisma.adherent.findUnique({
    where: { id },
    include: {
      organisation: true,
      abonnements: {
        include: {
          discipline: true,
          saison: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function AdherentDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const adherent = await getAdherent(parseInt(params.id));

  if (!adherent) {
    return <div>Adhérent non trouvé</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Détail de l&apos;adhérent
      </h1>

      <Tabs defaultValue="infos">
        <TabsList>
          <TabsTrigger value="infos">Informations</TabsTrigger>
          <TabsTrigger value="abonnements">Abonnements</TabsTrigger>
        </TabsList>

        <TabsContent value="infos" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
                  <User className="h-8 w-8 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {adherent.prenom} {adherent.nom}
                  </h2>
                  <p className="text-gray-500">{adherent.numeroDossier}</p>
                  <div className="mt-2">
                    {adherent.actif === 1 ? (
                      <Badge className="bg-green-100 text-green-700">Actif</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600">Inactif</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  {adherent.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  {adherent.telephone || "Non renseigné"}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Né(e) le {new Date(adherent.dateNaissance).toLocaleDateString("fr-FR")}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="h-4 w-4" />
                  {adherent.organisation.designation}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abonnements" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Abonnements</CardTitle>
            </CardHeader>
            <CardContent>
              {adherent.abonnements.length === 0 ? (
                <p className="text-gray-500">Aucun abonnement</p>
              ) : (
                <div className="space-y-2">
                  {adherent.abonnements.map((abonnement) => (
                    <div
                      key={abonnement.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{abonnement.discipline.designation}</p>
                        <p className="text-sm text-gray-500">{abonnement.saison.designation}</p>
                      </div>
                      <Badge>{abonnement.statut}</Badge>
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
