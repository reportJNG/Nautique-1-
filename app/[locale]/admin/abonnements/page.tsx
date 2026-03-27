// app/[locale]/admin/abonnements/page.tsx
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { Search, Plus } from "lucide-react";
import { STATUT_ABONNEMENT_STYLES } from "@/lib/constants";

async function getAbonnements() {
  return prisma.abonnement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      adherent: true,
      discipline: true,
      saison: true,
      categorieAge: true,
    },
    take: 50,
  });
}

export default async function AdminAbonnementsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const abonnements = await getAbonnements();

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des abonnements
        </h1>
        <Link href={`/${locale}/admin/abonnements/nouveau`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel abonnement
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Rechercher..." className="pl-10" />
            </div>
            <Button variant="outline">Filtrer</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des abonnements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-500">
                  <th className="pb-3">Adhérent</th>
                  <th className="pb-3">Discipline</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Statut</th>
                  <th className="pb-3">Montant</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {abonnements.map((abonnement) => (
                  <tr key={abonnement.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="py-3">
                      {abonnement.adherent.prenom} {abonnement.adherent.nom}
                    </td>
                    <td className="py-3">{abonnement.discipline.designation}</td>
                    <td className="py-3">{abonnement.typeAbonnement}</td>
                    <td className="py-3">
                      <Badge className={STATUT_ABONNEMENT_STYLES[abonnement.statut]}>
                        {abonnement.statut}
                      </Badge>
                    </td>
                    <td className="py-3">{Number(abonnement.montantTtc).toFixed(2)} DA</td>
                    <td className="py-3">
                      <Link href={`/${locale}/admin/abonnements/${abonnement.id}`}>
                        <Button size="sm" variant="outline">Voir</Button>
                      </Link>
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
