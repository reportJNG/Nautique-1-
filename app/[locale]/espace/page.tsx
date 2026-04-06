import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Activity,
  Plus,
  TrendingUp,
  Layers,
  ArrowRight,
} from "lucide-react";
import { STATUT_ABONNEMENT, STATUT_ABONNEMENT_STYLES } from "@/lib/constants";

async function getDashboardData(adherentId: number) {
  const [totalAbonnements, actifAbonnements, recentAbonnements, disciplines] =
    await Promise.all([
      prisma.abonnement.count({ where: { adherentId } }),
      prisma.abonnement.count({ where: { adherentId, statut: "ACT" } }),
      prisma.abonnement.findMany({
        where: { adherentId },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          discipline: true,
          saison: true,
          creneaux: { include: { creneau: true } },
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

const buildStatCards = (data: Awaited<ReturnType<typeof getDashboardData>>) => [
  {
    label: "Total abonnements",
    value: data.totalAbonnements,
    icon: Calendar,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-100 dark:bg-blue-900/50",
    badgeClass: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    trend: null,
  },
  {
    label: "Abonnements actifs",
    value: data.actifAbonnements,
    icon: CheckCircle2,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-100 dark:bg-emerald-900/50",
    badgeClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    trend: "Actif",
  },
  {
    label: "Disciplines",
    value: data.disciplinesCount,
    icon: Layers,
    colorClass: "text-cyan-600 dark:text-cyan-400",
    bgClass: "bg-cyan-100 dark:bg-cyan-900/50",
    badgeClass: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400",
    trend: null,
  },
  {
    label: "Prochaine séance",
    value: null,
    icon: Clock,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-100 dark:bg-amber-900/50",
    badgeClass: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    trend: "À venir",
  },
];

export default async function EspaceDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const session = await getSession();
  if (!session || session.type !== "adherent") return null;

  const adherent = await prisma.adherent.findUnique({
    where: { id: session.id },
    select: { nom: true, prenom: true },
  });
  if (!adherent) return null;

  const data = await getDashboardData(session.id);
  const cards = buildStatCards(data);

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-950 px-4 py-8 sm:px-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 dark:text-blue-500">
          Espace membre
        </p>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-900 to-cyan-600 dark:from-white dark:to-cyan-400 bg-clip-text text-transparent">
          Bonjour, {adherent.prenom} {adherent.nom}
        </h1>
        <p className="mt-1 text-sm text-blue-500 dark:text-blue-400">
          Bienvenue dans votre espace personnel
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, colorClass, bgClass, badgeClass, trend }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-2xl border border-blue-200/50 bg-white/80 backdrop-blur-sm p-5 shadow-xl transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5 dark:border-blue-800/50 dark:bg-blue-950/80"
          >
            <div className={`pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-[0.07] ${bgClass}`} />

            <div className="mb-4 flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgClass}`}>
                <Icon className={`h-5 w-5 ${colorClass}`} />
              </div>
              {trend && (
                <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeClass}`}>
                  <TrendingUp className="h-3 w-3" />
                  {trend}
                </span>
              )}
            </div>

            <div className="space-y-0.5">
              {value !== null ? (
                <p className="text-3xl font-bold tracking-tight text-blue-900 dark:text-white">{value}</p>
              ) : (
                <p className="text-sm font-medium text-blue-500 dark:text-blue-400">—</p>
              )}
              <p className="text-sm text-blue-500 dark:text-blue-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Subscriptions */}
      <div className="overflow-hidden rounded-2xl border border-blue-200/50 bg-white/80 backdrop-blur-sm shadow-xl dark:border-blue-800/50 dark:bg-blue-950/80">
        <div className="flex items-center justify-between border-b border-blue-200/50 px-6 py-4 dark:border-blue-800/50">
          <div>
            <h2 className="text-base font-semibold text-blue-900 dark:text-white">Abonnements récents</h2>
            <p className="mt-0.5 text-xs text-blue-500 dark:text-blue-400">3 derniers abonnements</p>
          </div>
          <Link href={`/${locale}/espace/abonnements/nouveau`}>
            <Button size="sm" className="gap-1.5 rounded-xl cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md transition-all hover:from-blue-700 hover:to-cyan-700 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600">
              <Plus className="h-3.5 w-3.5" />
              Nouvel abonnement
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-blue-200/50 dark:divide-blue-800/50">
          {data.recentAbonnements.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-800 dark:to-cyan-800">
                <Activity className="h-6 w-6 text-blue-400 dark:text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Aucun abonnement</p>
                <p className="mt-0.5 text-xs text-blue-500 dark:text-blue-400">
                  Commencez par créer votre premier abonnement.
                </p>
              </div>
              <Link href={`/${locale}/espace/abonnements/nouveau`}>
                <Button className="mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700">
                  Créer un abonnement
                </Button>
              </Link>
            </div>
          ) : (
            data.recentAbonnements.map((abonnement) => {
              const dateDebut = new Date(abonnement.dateDebut).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              });
              const dateFin = new Date(abonnement.dateFin).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={abonnement.id}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-800/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-sm font-bold text-white shadow-md">
                    {abonnement.discipline.designation.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-blue-900 dark:text-white">
                      {abonnement.discipline.designation}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-blue-500 dark:text-blue-400">
                      {abonnement.saison.designation} · {dateDebut} → {dateFin}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUT_ABONNEMENT_STYLES[abonnement.statut]}`}
                    >
                      {STATUT_ABONNEMENT[abonnement.statut as keyof typeof STATUT_ABONNEMENT]}
                    </Badge>
                    <p className="text-sm font-semibold tabular-nums text-blue-900 dark:text-white">
                      {Number(abonnement.montantTtc).toFixed(2)}{" "}
                      <span className="font-normal text-blue-500 dark:text-blue-400">DA</span>
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {data.recentAbonnements.length > 0 && (
          <div className="border-t border-blue-200/50 px-6 py-3 dark:border-blue-800/50">
            <Link
              href={`/${locale}/espace/abonnements`}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-cyan-600 dark:text-blue-400 dark:hover:text-cyan-300"
            >
              Voir tous les abonnements
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}