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
    colorClass: "text-violet-600 dark:text-violet-400",
    bgClass: "bg-violet-100 dark:bg-violet-900/50",
    badgeClass: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
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
    colorClass: "text-sky-600 dark:text-sky-400",
    bgClass: "bg-sky-100 dark:bg-sky-900/50",
    badgeClass: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
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
    <div className="min-h-full bg-muted/30 dark:bg-background px-4 py-8 sm:px-8">

      {/* ── Page header ── */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Espace membre
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Bonjour, {adherent.prenom} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bienvenue sur votre tableau de bord.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, colorClass, bgClass, badgeClass, trend }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
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
                <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">—</p>
              )}
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent subscriptions ── */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Abonnements récents</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">3 derniers abonnements</p>
          </div>
          <Link href={`/${locale}/espace/abonnements/nouveau`}>
            <Button size="sm" className="gap-1.5 rounded-xl">
              <Plus className="h-3.5 w-3.5" />
              Nouvel abonnement
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-border/40">
          {data.recentAbonnements.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Activity className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Aucun abonnement</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Commencez par créer votre premier abonnement.
                </p>
              </div>
              <Link href={`/${locale}/espace/abonnements/nouveau`}>
                <Button size="sm" variant="outline" className="mt-1 gap-1.5 rounded-xl">
                  <Plus className="h-3.5 w-3.5" />
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
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                    {abonnement.discipline.designation.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {abonnement.discipline.designation}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {abonnement.saison.designation} · {dateDebut} → {dateFin}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUT_ABONNEMENT_STYLES[abonnement.statut]}`}
                    >
                      {STATUT_ABONNEMENT[abonnement.statut as keyof typeof STATUT_ABONNEMENT]}
                    </Badge>
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      {Number(abonnement.montantTtc).toFixed(2)}{" "}
                      <span className="font-normal text-muted-foreground">DA</span>
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {data.recentAbonnements.length > 0 && (
          <div className="border-t border-border/40 px-6 py-3">
            <Link
              href={`/${locale}/espace/abonnements`}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
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