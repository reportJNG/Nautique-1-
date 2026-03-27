// app/[locale]/admin/adherents/page.tsx
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { Search, Plus, User } from "lucide-react";

async function getAdherents() {
  return prisma.adherent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organisation: true,
    },
    take: 50,
  });
}

export default async function AdminAdherentsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const adherents = await getAdherents();

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des adhérents
        </h1>
        <Link href={`/${locale}/admin/adherents/nouveau`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel adhérent
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Rechercher par nom, email ou n° dossier..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtrer</Button>
          </div>
        </CardContent>
      </Card>

      {/* Adherents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des adhérents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-500">
                  <th className="pb-3">N° Dossier</th>
                  <th className="pb-3">Nom</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Organisation</th>
                  <th className="pb-3">Statut</th>
                  <th className="pb-3">Inscription</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adherents.map((adherent) => (
                  <tr key={adherent.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="py-3 font-mono text-sm">{adherent.numeroDossier}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {adherent.prenom} {adherent.nom}
                      </div>
                    </td>
                    <td className="py-3 text-sm">{adherent.email}</td>
                    <td className="py-3">
                      <Badge variant="outline">{adherent.organisation.code}</Badge>
                    </td>
                    <td className="py-3">
                      {adherent.actif === 1 ? (
                        <Badge className="bg-green-100 text-green-700">Actif</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600">Inactif</Badge>
                      )}
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(adherent.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3">
                      <Link href={`/${locale}/admin/adherents/${adherent.id}`}>
                        <Button size="sm" variant="outline">
                          Voir
                        </Button>
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
