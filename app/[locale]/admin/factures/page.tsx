// app/[locale]/admin/factures/page.tsx
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUT_FACTURE_STYLES, MODE_PAIEMENT } from "@/lib/constants";

async function getFactures() {
  return prisma.facture.findMany({
    orderBy: { dateCreation: "desc" },
    include: {
      adherent: true,
    },
    take: 50,
  });
}

export default async function FacturesPage() {
  const factures = await getFactures();

  const totalPaye = factures
    .filter((f) => f.statut === "PAY")
    .reduce((sum, f) => sum + Number(f.montantTtc), 0);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Caisse - Gestion des factures
      </h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm text-green-600 dark:text-green-400">Total payé</p>
              <p className="text-2xl font-bold text-green-700">{totalPaye.toFixed(2)} DA</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
              <p className="text-sm text-amber-600 dark:text-amber-400">En attente</p>
              <p className="text-2xl font-bold text-amber-700">
                {factures.filter((f) => f.statut === "ATT").length}
              </p>
            </div>
            <div className="rounded-lg bg-cyan-50 p-4 dark:bg-cyan-900/20">
              <p className="text-sm text-cyan-600 dark:text-cyan-400">Total factures</p>
              <p className="text-2xl font-bold text-cyan-700">{factures.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-500">
                  <th className="pb-3">N° Reçu</th>
                  <th className="pb-3">Adhérent</th>
                  <th className="pb-3">Montant</th>
                  <th className="pb-3">Mode</th>
                  <th className="pb-3">Statut</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {factures.map((facture) => (
                  <tr key={facture.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="py-3 font-mono text-sm">{facture.numeroRecu || "-"}</td>
                    <td className="py-3">
                      {facture.adherent.prenom} {facture.adherent.nom}
                    </td>
                    <td className="py-3 font-medium">{Number(facture.montantTtc).toFixed(2)} DA</td>
                    <td className="py-3">{MODE_PAIEMENT[facture.modePaiement as keyof typeof MODE_PAIEMENT]}</td>
                    <td className="py-3">
                      <Badge className={STATUT_FACTURE_STYLES[facture.statut]}>
                        {facture.statut === "ATT" ? "En attente" : "Payé"}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(facture.dateCreation).toLocaleDateString("fr-FR")}
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
