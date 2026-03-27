// app/[locale]/admin/moniteurs/page.tsx
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";

async function getMoniteurs() {
  return prisma.moniteur.findMany({
    orderBy: { nom: "asc" },
  });
}

export default async function MoniteursPage() {
  const moniteurs = await getMoniteurs();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des moniteurs
        </h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau moniteur
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {moniteurs.map((moniteur) => (
          <Card key={moniteur.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100">
                  <User className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {moniteur.prenom} {moniteur.nom}
                  </CardTitle>
                  {moniteur.specialite && (
                    <p className="text-sm text-gray-500">{moniteur.specialite}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {moniteur.email && (
                  <p className="text-gray-600 dark:text-gray-400">{moniteur.email}</p>
                )}
                {moniteur.telephone && (
                  <p className="text-gray-600 dark:text-gray-400">{moniteur.telephone}</p>
                )}
                <div className="pt-2">
                  {moniteur.actif === 1 ? (
                    <Badge className="bg-green-100 text-green-700">Actif</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600">Inactif</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
