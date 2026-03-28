import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, CreditCard, TrendingUp, Clock } from "lucide-react";
import { STATUT_ABONNEMENT_STYLES } from "@/lib/constants";
async function getDashboardStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalAdherents, actifAbonnements, pendingFactures, monthlyRevenue, availableCreneaux, recentAbonnements,] = await Promise.all([
        prisma.adherent.count({ where: { actif: 1 } }),
        prisma.abonnement.count({
            where: {
                statut: "ACT",
                dateDebut: { lte: now },
                dateFin: { gte: now },
            }
        }),
        prisma.facture.count({ where: { statut: "ATT" } }),
        prisma.facture.aggregate({
            where: {
                statut: "PAY",
                datePaiement: { gte: firstDayOfMonth },
            },
            _sum: { montantTtc: true },
        }),
        prisma.creneau.count({
            where: {
                actif: 1,
                saison: { statut: "OUV" },
            },
        }),
        prisma.abonnement.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                adherent: true,
                discipline: true,
                saison: true,
            },
        }),
    ]);
    return {
        totalAdherents,
        actifAbonnements,
        pendingFactures,
        monthlyRevenue: monthlyRevenue._sum.montantTtc || 0,
        availableCreneaux,
        recentAbonnements,
    };
}
export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();
    return (<div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Tableau de bord
      </h1>

      
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Adhérents actifs
            </CardTitle>
            <Users className="h-4 w-4 text-cyan-600"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdherents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Abonnements actifs
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-600"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.actifAbonnements}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Factures en attente
            </CardTitle>
            <CreditCard className="h-4 w-4 text-amber-600"/>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.pendingFactures > 0 ? "text-amber-600" : ""}`}>
              {stats.pendingFactures}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Recettes du mois
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-cyan-600"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(stats.monthlyRevenue).toFixed(0)} DA
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Créneaux disponibles
            </CardTitle>
            <Clock className="h-4 w-4 text-cyan-600"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableCreneaux}</div>
          </CardContent>
        </Card>
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle>Abonnements récents</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentAbonnements.length === 0 ? (<p className="text-center text-gray-500">Aucun abonnement récent</p>) : (<div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-500">
                    <th className="pb-2">Adhérent</th>
                    <th className="pb-2">Discipline</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Statut</th>
                    <th className="pb-2">Montant</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAbonnements.map((abonnement) => (<tr key={abonnement.id} className="border-b">
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
                      <td className="py-3 text-sm text-gray-500">
                        {new Date(abonnement.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
