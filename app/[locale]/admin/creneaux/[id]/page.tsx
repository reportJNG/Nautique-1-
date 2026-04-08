import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "next-intl/server";
import { formatTimeForLocale, getDayKey, inferOneBasedWeek } from "@/lib/creneaux";

async function getCreneau(id: number) {
  return prisma.creneau.findUnique({
    where: { id },
    include: {
      discipline: { include: { espace: true } },
      saison: true,
      moniteurs: { include: { moniteur: true } },
      abonnements: {
        where: { actif: 1 },
        include: { abonnement: { include: { adherent: true } } },
      },
    },
  });
}

export default async function CreneauDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const creneauId = Number.parseInt(id, 10);
  const creneau = Number.isNaN(creneauId) ? null : await getCreneau(creneauId);

  if (!creneau) {
    return <div className="p-6 text-muted-foreground">{t("creneauxUi.detail.notFound")}</div>;
  }

  const dayKey = getDayKey(
    creneau.jourSemaine,
    inferOneBasedWeek([creneau.jourSemaine]),
  );

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        {t("creneauxUi.detail.title")}
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="px-6 pb-2 pt-4">
            <h3 className="text-base font-semibold text-foreground">
              {t("creneauxUi.detail.cards.informations")}
            </h3>
          </div>
          <div className="space-y-4 p-6 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("creneauxUi.detail.labels.discipline")}
              </span>
              <span className="font-medium text-foreground">
                {creneau.discipline.designation}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("creneauxUi.detail.labels.space")}
              </span>
              <span className="inline-flex items-center rounded-md border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
                {creneau.discipline.espace.code}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("creneauxUi.detail.labels.day")}
              </span>
              <span className="font-medium text-foreground">
                {dayKey ? t(`days.${dayKey}`) : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("creneauxUi.detail.labels.schedule")}
              </span>
              <span className="font-medium text-foreground">
                {formatTimeForLocale(creneau.heureDebut, locale)} -{" "}
                {formatTimeForLocale(creneau.heureFin, locale)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("creneauxUi.detail.labels.capacity")}
              </span>
              <span className="font-medium text-foreground">
                {creneau.nombreMin} - {creneau.nombreMax}
              </span>
            </div>
            {creneau.groupe ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("creneauxUi.detail.labels.group")}
                </span>
                <span className="font-medium text-foreground">{creneau.groupe}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="px-6 pb-2 pt-4">
            <h3 className="text-base font-semibold text-foreground">
              {t("creneauxUi.detail.cards.moniteurs")}
            </h3>
          </div>
          <div className="p-6 pt-2">
            {creneau.moniteurs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("creneauxUi.detail.emptyMonitors")}
              </p>
            ) : (
              <div className="space-y-2">
                {creneau.moniteurs.map((cm) => (
                  <div
                    key={cm.id}
                    className="rounded-lg border border-border p-3 text-sm text-foreground"
                  >
                    {cm.moniteur.prenom} {cm.moniteur.nom}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-2">
          <div className="px-6 pb-2 pt-4">
            <h3 className="text-base font-semibold text-foreground">
              {t("creneauxUi.detail.cards.inscrits", {
                count: creneau.abonnements.length,
              })}
            </h3>
          </div>
          <div className="p-6 pt-2">
            {creneau.abonnements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("creneauxUi.detail.emptyEnrolled")}
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {creneau.abonnements.map((ca) => (
                  <div
                    key={ca.id}
                    className="rounded-lg border border-border p-3 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {ca.abonnement.adherent.prenom} {ca.abonnement.adherent.nom}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ca.abonnement.adherent.numeroDossier}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
