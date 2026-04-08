import { getTranslations } from "next-intl/server";
import {
  Clock,
  Users,
  Dumbbell,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { formatTimeForLocale, getDayKey, inferOneBasedWeek } from "@/lib/creneaux";

async function getCreneaux() {
  return prisma.creneau.findMany({
    include: {
      discipline: { include: { espace: true } },
      saison: true,
      _count: { select: { abonnements: true } },
    },
    orderBy: [{ jourSemaine: "asc" }, { heureDebut: "asc" }],
  });
}

export default async function CreneauxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const creneaux = await getCreneaux();
  const oneBasedWeek = inferOneBasedWeek(creneaux.map((creneau) => creneau.jourSemaine));

  const totalSlots = creneaux.length;
  const totalCapacity = creneaux.reduce((sum, creneau) => sum + creneau.nombreMax, 0);
  const totalEnrolled = creneaux.reduce(
    (sum, creneau) => sum + creneau._count.abonnements,
    0,
  );
  const averageFillRate =
    totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0;

  const getFillColor = (fill: number) => {
    if (fill >= 100) return "bg-primary";
    if (fill >= 80) return "bg-primary/80";
    if (fill >= 50) return "bg-primary/60";
    return "bg-primary/40";
  };

  const getStatusBadge = (fillPercentage: number) => {
    if (fillPercentage >= 100) {
      return {
        label: t("creneauxUi.status.full"),
        color: "text-primary ring-primary/30",
      };
    }
    if (fillPercentage >= 80) {
      return {
        label: t("creneauxUi.status.almostFull"),
        color: "text-primary ring-primary/30",
      };
    }
    if (fillPercentage >= 50) {
      return {
        label: t("creneauxUi.status.limited"),
        color: "text-accent ring-accent/30",
      };
    }
    return {
      label: t("creneauxUi.status.available"),
      color: "text-primary ring-primary/30",
    };
  };

  return (
    <AdminPageShell locale={locale}>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {t("creneauxUi.pageTitle")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("creneauxUi.description")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border/50 bg-card/40 p-4 ring-1 ring-border/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("creneauxUi.stats.totalSlots")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {totalSlots}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/30">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-card/40 p-4 ring-1 ring-border/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("creneauxUi.stats.totalCapacity")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {totalCapacity}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/30">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-card/40 p-4 ring-1 ring-border/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("creneauxUi.stats.enrolled")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-primary">
                    {totalEnrolled}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/30">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-card/40 p-4 ring-1 ring-border/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("creneauxUi.stats.fillRate")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-primary">
                    {Math.round(averageFillRate)}%
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/30">
                  <ChevronRight className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border/50 bg-transparent ring-1 ring-border/30">
          <div className="border-b border-border/50 bg-card/20 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {t("creneauxUi.table.title")}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("creneauxUi.table.count", { count: creneaux.length })}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/50 bg-card/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("creneauxUi.table.discipline")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("creneauxUi.table.space")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("creneauxUi.table.day")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("creneauxUi.table.schedule")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("creneauxUi.table.group")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("creneauxUi.table.enrolled")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {creneaux.map((creneau) => {
                  const dayKey = getDayKey(creneau.jourSemaine, oneBasedWeek);
                  const fillPercentage =
                    creneau.nombreMax > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (creneau._count.abonnements / creneau.nombreMax) * 100,
                          ),
                        )
                      : 0;
                  const fillColor = getFillColor(fillPercentage);
                  const statusBadge = getStatusBadge(fillPercentage);

                  return (
                    <tr
                      key={creneau.id}
                      className="transition-colors hover:bg-card/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {creneau.discipline.designation}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/30">
                            {creneau.discipline.espace.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-transparent px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/30">
                          <Calendar className="mr-1.5 w-3 h-3" />
                          {dayKey ? t(`days.${dayKey}`) : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono">
                            {formatTimeForLocale(creneau.heureDebut, locale)} -{" "}
                            {formatTimeForLocale(creneau.heureFin, locale)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {creneau.groupe ? (
                          <span className="rounded-md bg-card/50 px-2.5 py-1 text-sm text-muted-foreground ring-1 ring-border">
                            {creneau.groupe}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold text-foreground">
                                {creneau._count.abonnements}
                              </span>
                              <span className="text-muted-foreground">
                                / {creneau.nombreMax}
                              </span>
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full bg-transparent px-2 py-0.5 text-xs font-medium ring-1 ${statusBadge.color}`}
                            >
                              {statusBadge.label}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-card">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${fillColor}`}
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {creneaux.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-card/50 ring-1 ring-border">
                <Clock className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{t("creneauxUi.empty")}</p>
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}
