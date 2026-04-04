import { prisma } from "@/lib/db/prisma";
import { Link } from "@/i18n/navigation";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import {
  Plus,
  ExternalLink,
  Dumbbell,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Waves,
  Search,
} from "lucide-react";

async function getAbonnements() {
  return prisma.abonnement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      adherent: true,
      discipline: true,
      saison: true,
      categorieAge: true,
    },
    take: 50,
  });
}

export default async function AdminAbonnementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const abonnements = await getAbonnements();
  const t = await getTranslations({ locale, namespace: "admin" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const dateLocale =
    locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";

  const stats = {
    total: abonnements.length,
    actif: abonnements.filter((a) => a.statut === "ACT").length,
    attente: abonnements.filter((a) => a.statut === "ATT").length,
    expire: abonnements.filter((a) => a.statut === "EXP").length,
  };

  const getStatusConfig = (statut: string) => {
    const configs: Record<
      string,
      {
        icon: React.ElementType;
        badgeClass: string;
        label: string;
      }
    > = {
      ACT: {
        icon: CheckCircle,
        badgeClass:
          "text-cyan-400 ring-cyan-400/30",
        label: t("abonnementStatus.ACT"),
      },
      ATT: {
        icon: Clock,
        badgeClass:
          "text-accent ring-accent/30",
        label: t("abonnementStatus.ATT"),
      },
      EXP: {
        icon: AlertCircle,
        badgeClass: "text-destructive ring-destructive/30",
        label: t("abonnementStatus.EXP"),
      },
      RES: {
        icon: TrendingUp,
        badgeClass: "text-blue-400 ring-blue-500/30",
        label: t("abonnementStatus.RES"),
      },
      ANN: {
        icon: XCircle,
        badgeClass:
          "text-muted-foreground ring-border/30",
        label: t("abonnementStatus.ANN"),
      },
    };
    return configs[statut] ?? configs.ANN;
  };

  const statCards = [
    {
      label: "Total abonnements",
      value: stats.total,
      valueClass: "text-blue-400",
      iconColor: "text-blue-400",
      Icon: Waves,
    },
    {
      label: "Actifs",
      value: stats.actif,
      valueClass: "text-cyan-400",
      iconColor: "text-cyan-400",
      Icon: CheckCircle,
    },
    {
      label: "En attente",
      value: stats.attente,
      valueClass: "text-accent",
      iconColor: "text-accent",
      Icon: Clock,
    },
    {
      label: "Expirés",
      value: stats.expire,
      valueClass: "text-destructive",
      iconColor: "text-destructive",
      Icon: AlertCircle,
    },
  ];

  return (
    <AdminPageShell locale={locale}>
      <div className="space-y-0">

        {/* ── Hero banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#042C53] via-[#0C447C] to-[#185FA5] px-8 pt-8 pb-16">
          {/* Wave pattern overlay */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="waves"
                x="0"
                y="0"
                width="120"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 30 Q30 10 60 30 Q90 50 120 30"
                  stroke="white"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M0 46 Q30 26 60 46 Q90 66 120 46"
                  stroke="white"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.6"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#waves)" />
          </svg>

          {/* Hero content */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/20">
                <Waves className="h-3 w-3" />
                Club nautique
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {t("abonnementsUi.pageTitle")}
              </h1>
              <p className="mt-1 text-sm text-blue-200">
                {t("abonnementsUi.description")}
              </p>
            </div>
            <Link
              href="/admin/abonnements/nouveau"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500/20 px-4 py-2.5 text-sm font-semibold text-blue-400 ring-1 ring-blue-500/40 transition hover:bg-blue-500/30"
            >
              <Plus className="h-4 w-4" />
              {t("abonnementsUi.newButton")}
            </Link>
          </div>
        </div>

        {/* ── Stat cards (overlapping hero) ── */}
        <div className="relative z-10 -mt-8 grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ label, value, valueClass, iconColor, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card/50 p-4 shadow-lg backdrop-blur-sm"
            >
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-transparent ring-1 ${iconColor.replace('text', 'ring')}/20`}
              >
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold tabular-nums ${valueClass}`}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table section ── */}
        <div className="pt-6">
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-transparent shadow-sm">

            {/* Table header */}
            <div className="flex flex-col gap-3 border-b border-border/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Liste des abonnements
                </h2>
                <p className="text-xs text-foreground0">
                  {stats.total} résultats
                </p>
              </div>
              {/* Search input — client-side filtering can be added via a Client Component wrapper */}
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/30 px-3 py-2 text-sm text-muted-foreground w-full sm:w-56">
                <Search className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-xs">Rechercher…</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-card/20">
                    {[
                      t("abonnementsUi.table.adherent"),
                      t("abonnementsUi.table.discipline"),
                      t("abonnementsUi.table.type"),
                      t("abonnementsUi.table.status"),
                      t("abonnementsUi.table.amount"),
                      "Actions",
                    ].map((col, i) => (
                      <th
                        key={col}
                        className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${i >= 4 ? "text-right" : "text-left"
                          }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-700/50">
                  {abonnements.map((abonnement) => {
                    const initials =
                      `${abonnement.adherent.prenom?.[0] ?? ""}${abonnement.adherent.nom?.[0] ?? ""}`.toUpperCase();
                    const { icon: StatusIcon, badgeClass, label } =
                      getStatusConfig(abonnement.statut);

                    return (
                      <tr
                        key={abonnement.id}
                        className="group transition-colors hover:bg-card/30"
                      >
                        {/* Adherent */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white ring-2 ring-blue-500/30 shadow-sm">
                              {initials || "?"}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {abonnement.adherent.prenom}{" "}
                                {abonnement.adherent.nom}
                              </p>
                              <p className="text-[11px] text-foreground0">
                                {abonnement.adherent.numeroDossier}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Discipline */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Dumbbell className="h-3.5 w-3.5 flex-shrink-0 text-foreground0" />
                            {abonnement.discipline.designation}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {abonnement.typeAbonnement}
                        </td>

                        {/* Status badge */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 bg-transparent ${badgeClass}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {label}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-3.5 text-right">
                          <span className="font-bold tabular-nums text-foreground">
                            {Number(abonnement.montantTtc).toLocaleString(
                              dateLocale
                            )}{" "}
                            <span className="text-xs font-medium text-foreground0">
                              DA
                            </span>
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/admin/abonnements/${abonnement.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border transition hover:bg-blue-600/20 hover:text-blue-400 hover:ring-blue-500/50"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {tc("view")}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {abonnements.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 ring-1 ring-blue-500/20">
                  <Waves className="h-6 w-6 text-blue-400" />
                </div>
                <p className="text-sm text-foreground0">
                  Aucun abonnement trouvé
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </AdminPageShell>
  );
}