// app/[locale]/admin/factures/[id]/page.tsx
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUT_FACTURE_STYLES, MODE_PAIEMENT } from "@/lib/constants";
import { Printer } from "lucide-react";

async function getFacture(id: number) {
  return prisma.facture.findUnique({
    where: { id },
    include: {
      adherent: true,
      abonnement: {
        include: {
          discipline: true,
        },
      },
    },
  });
}

export default async function FactureDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const facture = await getFacture(parseInt(params.id));

  if (!facture) {
    return <div>Facture non trouvée</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Détail de la facture
        </h1>
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Imprimer
        </Button>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card className="border-2">
          <CardHeader className="border-b bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h2 className="text-xl font-bold">Centre Nautique SONATRACH</h2>
              <p className="text-sm text-gray-500">Reçu de paiement</p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">N° Reçu</p>
                <p className="font-mono font-medium">{facture.numeroRecu || "-"}</p>
              </div>
              <Badge className={STATUT_FACTURE_STYLES[facture.statut]}>
                {facture.statut === "ATT" ? "En attente" : "Payé"}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Adhérent</span>
                <span className="font-medium">
                  {facture.adherent.prenom} {facture.adherent.nom}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">N° Dossier</span>
                <span className="font-medium">{facture.adherent.numeroDossier}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Discipline</span>
                <span className="font-medium">{facture.abonnement.discipline.designation}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Mode de paiement</span>
                <span className="font-medium">
                  {MODE_PAIEMENT[facture.modePaiement as keyof typeof MODE_PAIEMENT]}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-lg font-bold">Montant total</span>
                <span className="text-lg font-bold">
                  {Number(facture.montantTtc).toFixed(2)} DA
                </span>
              </div>
            </div>

            {facture.datePaiement && (
              <div className="mt-6 text-center text-sm text-gray-500">
                Payé le {new Date(facture.datePaiement).toLocaleDateString("fr-FR")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
