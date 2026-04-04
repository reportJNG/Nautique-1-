import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader, AdminSection, AdminDataTable, AdminPageShell } from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { Clock, Users, Dumbbell, MapPin, Calendar, ChevronRight } from "lucide-react";

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
  const dayKeyByIndex = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const creneaux = await getCreneaux();

  // Calculate summary statistics
  const totalSlots = creneaux.length;
  const totalCapacity = creneaux.reduce((sum, c) => sum + c.nombreMax, 0);
  const totalEnrolled = creneaux.reduce((sum, c) => sum + c._count.abonnements, 0);
  const averageFillRate = totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0;

  const getDayColor = (day: number) => {
    const colors = [
      "text-primary ring-primary/30", // Sunday
      "text-primary ring-primary/30", // Monday
      "text-primary ring-primary/30", // Tuesday
      "text-primary ring-primary/30", // Wednesday
      "text-primary ring-primary/30", // Thursday
      "text-primary ring-primary/30", // Friday
      "text-primary ring-primary/30", // Saturday
    ];
    return colors[day % colors.length];
  };

  // Enhanced fill color with primary scheme for status badges
  const getFillColor = (fill: number) => {
    if (fill >= 100) return "bg-primary";
    if (fill >= 80) return "bg-primary/80";
    if (fill >= 50) return "bg-primary/60";
    return "bg-primary/40";
  };

  // Status badge variant based on fill rate
  const getStatusBadge = (fillPercentage: number) => {
    if (fillPercentage >= 100) {
      return {
        label: "Complet",
        color: "text-primary ring-primary/30",
        icon: null
      };
    }
    if (fillPercentage >= 80) {
      return {
        label: "Presque complet",
        color: "text-primary ring-primary/30",
        icon: null
      };
    }
    if (fillPercentage >= 50) {
      return {
        label: "Places limitées",
        color: "text-accent ring-accent/30",
        icon: null
      };
    }
    return {
      label: "Disponible",
      color: "text-primary ring-primary/30",
      icon: null
    };
  };

  return (
    <AdminPageShell locale={locale}>
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {t("creneauxUi.pageTitle")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gestion des créneaux horaires
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border/50 bg-card/40 p-4 ring-1 ring-border/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total créneaux</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{totalSlots}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 ring-1 ring-primary/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-card/40 p-4 ring-1 ring-border/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Capacité totale</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{totalCapacity}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 ring-1 ring-primary/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-card/40 p-4 ring-1 ring-border/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inscrits</p>
                  <p className="text-2xl font-semibold text-primary mt-1">{totalEnrolled}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 ring-1 ring-primary/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-card/40 p-4 ring-1 ring-border/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux d'occupation</p>
                  <p className="text-2xl font-semibold text-primary mt-1">
                    {Math.round(averageFillRate)}%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 ring-1 ring-primary/30 flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="rounded-lg border border-border/50 bg-transparent overflow-hidden ring-1 ring-border/30">
          <div className="px-6 py-4 border-b border-border/50 bg-card/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {t("creneauxUi.table.title")}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {creneaux.length} créneaux configurés
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-card/20 border-b border-border/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("creneauxUi.table.discipline")}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("creneauxUi.table.space")}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("creneauxUi.table.day")}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("creneauxUi.table.schedule")}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("creneauxUi.table.group")}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("creneauxUi.table.enrolled")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {creneaux.map((creneau) => {
                  const fillPercentage = creneau.nombreMax > 0
                    ? Math.min(100, Math.round((creneau._count.abonnements / creneau.nombreMax) * 100))
                    : 0;
                  const fillColor = getFillColor(fillPercentage);
                  const dayColor = getDayColor(creneau.jourSemaine);
                  const statusBadge = getStatusBadge(fillPercentage);

                  return (
                    <tr key={creneau.id} className="hover:bg-card/30 transition-colors">
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
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-transparent text-primary ring-1 ring-primary/30">
                            {creneau.discipline.espace.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ring-1 bg-transparent ${dayColor}`}>
                          <Calendar className="w-3 h-3 mr-1.5" />
                          {t(`days.${dayKeyByIndex[creneau.jourSemaine]}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono">
                            {String(creneau.heureDebut).slice(0, 5)} – {String(creneau.heureFin).slice(0, 5)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {creneau.groupe ? (
                          <span className="text-sm text-muted-foreground bg-card/50 px-2.5 py-1 rounded-md ring-1 ring-border">
                            {creneau.groupe}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
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
                              <span className="text-muted-foreground">/ {creneau.nombreMax}</span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 bg-transparent ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-card rounded-full overflow-hidden">
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

          {/* Empty State */}
          {creneaux.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-card/50 ring-1 ring-border flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Aucun créneau configuré</p>
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}