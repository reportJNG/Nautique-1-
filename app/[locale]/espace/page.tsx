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

const statCards = (data: Awaited<ReturnType<typeof getDashboardData>>) => [
  {
    label: "Total abonnements",
    value: data.totalAbonnements,
    icon: Calendar,
    accent: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    trend: null,
  },
  {
    label: "Abonnements actifs",
    value: data.actifAbonnements,
    icon: CheckCircle2,
    accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    trend: "Actif",
  },
  {
    label: "Disciplines",
    value: data.disciplinesCount,
    icon: Layers,
    accent: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
    iconBg: "bg-sky-100 dark:bg-sky-900/50",
    trend: null,
  },
  {
    label: "Prochaine séance",
    value: null,
    icon: Clock,
    accent: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    trend: "À venir",
  },
];

export default async function EspaceDashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getSession();
  if (!session || session.type !== "adherent") return null;

  const data = await getDashboardData(session.id);
  const cards = statCards(data);

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-gray-950 px-4 py-8 sm:px-8">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Espace membre
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Tableau de bord
        </h1>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, accent, iconBg, trend }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            {/* Top row */}
            <div className="mb-4 flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
              >
                <Icon className={`h-5 w-5 ${accent.split(" ").slice(1).join(" ")}`} />
              </div>
              {trend && (
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${accent}`}
                >
                  <TrendingUp className="h-3 w-3" />
                  {trend}
                </span>
              )}
            </div>

            {/* Value */}
            <div className="space-y-0.5">
              {value !== null ? (
                <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {value}
                </p>
              ) : (
                <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                  —
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </div>

            {/* Subtle decorative corner */}
            <div
              className={`pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-10 ${iconBg}`}
            />
          </div>
        ))}
      </div>

      {/* Recent subscriptions */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Section header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Abonnements récents
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              3 derniers abonnements
            </p>
          </div>
          <Link href={`/${locale}/espace/abonnements/nouveau`}>
            <Button
              size="sm"
              className="gap-1.5 rounded-xl bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouvel abonnement
            </Button>
          </Link>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
          {data.recentAbonnements.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Activity className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Aucun abonnement pour le moment
              </p>
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
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                >
                  {/* Discipline avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
                    {abonnement.discipline.designation.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900 dark:text-white text-sm">
                      {abonnement.discipline.designation}
                    </p>
                    <p className="truncate text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {abonnement.saison.designation} &middot; {dateDebut} → {dateFin}
                    </p>
                  </div>

                  {/* Right side */}
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUT_ABONNEMENT_STYLES[abonnement.statut]
                        }`}
                    >
                      {STATUT_ABONNEMENT[abonnement.statut as keyof typeof STATUT_ABONNEMENT]}
                    </Badge>
                    <p className="text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-300">
                      {Number(abonnement.montantTtc).toFixed(2)}{" "}
                      <span className="font-normal text-gray-400 dark:text-gray-500">DA</span>
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}