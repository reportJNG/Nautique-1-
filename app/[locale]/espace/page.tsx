import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Calendar, CheckCircle, Clock, Activity, ArrowRight } from "lucide-react";
import { STATUT_ABONNEMENT, STATUT_ABONNEMENT_STYLES } from "@/lib/constants";
async function getDashboardData(adherentId: number) {
    const [totalAbonnements, actifAbonnements, recentAbonnements, disciplines] = await Promise.all([
        prisma.abonnement.count({ where: { adherentId } }),
        prisma.abonnement.count({ where: { adherentId, statut: "ACT" } }),
        prisma.abonnement.findMany({
            where: { adherentId },
            orderBy: { createdAt: "desc" },
            take: 3,
            include: {
                discipline: true,
                saison: true,
                creneaux: {
                    include: {
                        creneau: true,
                    },
                },
            },
        }),
        prisma.abonnement.findMany({
            where: { adherentId, statut: "ACT" },
            select: { disciplineId: true },
            distinct: ["disciplineId"],
        }),
    ]);
    return {
        totalAbonnements,
        actifAbonnements,
        recentAbonnements,
        disciplinesCount: disciplines.length,
    };
}
export default async function EspaceDashboardPage({ params: { locale }, }: {
    params: {
        locale: string;
    };
}) {
    const session = await getSession();
    if (!session || session.type !== "adherent") {
        return null;
    }
    const data = await getDashboardData(session.id);
    return (<div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Tableau de bord
      </h1>

      
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total abonnements
            </CardTitle>
            <Calendar className="h-4 w-4 text-cyan-600"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAbonnements}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Abonnements actifs
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.actifAbonnements}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Disciplines
            </CardTitle>
            <Activity className="h-4 w-4 text-cyan-600"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.disciplinesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Prochaine séance
            </CardTitle>
            <Clock className="h-4 w-4 text-cyan-600"/>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">À venir</div>
          </CardContent>
        </Card>
      </div>

      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Abonnements récents</CardTitle>
          <Link href={`/${locale}/espace/abonnements/nouveau`}>
            <Button size="sm">
              <ArrowRight className="mr-2 h-4 w-4"/>
              Nouvel abonnement
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data.recentAbonnements.length === 0 ? (<p className="text-center text-gray-500">Aucun abonnement</p>) : (<div className="space-y-4">
              {data.recentAbonnements.map((abonnement) => (<div key={abonnement.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4 dark:border-gray-800">
                  <div>
                    <p className="font-medium">{abonnement.discipline.designation}</p>
                    <p className="text-sm text-gray-500">
                      {abonnement.saison.designation} • {STATUT_ABONNEMENT[abonnement.statut as keyof typeof STATUT_ABONNEMENT]}
                    </p>
                    <p className="text-sm text-gray-500">
                      Du {new Date(abonnement.dateDebut).toLocaleDateString("fr-FR")} au{" "}
                      {new Date(abonnement.dateFin).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={STATUT_ABONNEMENT_STYLES[abonnement.statut]}>
                      {abonnement.statut}
                    </Badge>
                    <p className="mt-1 text-sm font-medium">
                      {Number(abonnement.montantTtc).toFixed(2)} DA
                    </p>
                  </div>
                </div>))}
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
