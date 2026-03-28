import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { STATUT_SAISON_STYLES } from "@/lib/constants";
async function getSaisons() {
    return prisma.saison.findMany({
        orderBy: { dateDebut: "desc" },
        include: {
            _count: {
                select: { creneaux: true },
            },
        },
    });
}
export default async function SaisonsPage() {
    const saisons = await getSaisons();
    return (<div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des saisons
        </h1>
        <Button>
          <Plus className="mr-2 h-4 w-4"/>
          Nouvelle saison
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {saisons.map((saison) => (<Card key={saison.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{saison.designation}</CardTitle>
                <Badge className={STATUT_SAISON_STYLES[saison.statut]}>
                  {saison.statut}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Du {new Date(saison.dateDebut).toLocaleDateString("fr-FR")} au{" "}
                {new Date(saison.dateFin).toLocaleDateString("fr-FR")}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {saison._count.creneaux} créneaux
              </p>
            </CardContent>
          </Card>))}
      </div>
    </div>);
}
