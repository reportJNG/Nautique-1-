import React from "react";
import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "next-intl/server";

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
  const dayKeyByIndex = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const creneau = await getCreneau(parseInt(id));

  if (!creneau) {
    return <div className="p-6 text-muted-foreground">{t("creneauxUi.detail.notFound")}</div>;
  }

  // Format time helper
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR", {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        {t("creneauxUi.detail.title")}
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informations Card */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 pt-4 pb-2">
            <h3 className="text-base font-semibold text-foreground">
              {t("creneauxUi.detail.cards.informations")}
            </h3>
          </div>
          <div className="p-6 pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("creneauxUi.detail.labels.discipline")}</span>
              <span className="font-medium text-foreground">{creneau.discipline.designation}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("creneauxUi.detail.labels.space")}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border border-border text-foreground">
                {creneau.discipline.espace.code}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("creneauxUi.detail.labels.day")}</span>
              <span className="font-medium text-foreground">{t(`days.${dayKeyByIndex[creneau.jourSemaine]}`)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("creneauxUi.detail.labels.schedule")}</span>
              <span className="font-medium text-foreground">
                {formatTime(creneau.heureDebut)} – {formatTime(creneau.heureFin)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("creneauxUi.detail.labels.capacity")}</span>
              <span className="font-medium text-foreground">{creneau.nombreMin} - {creneau.nombreMax}</span>
            </div>
            {creneau.groupe && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("creneauxUi.detail.labels.group")}</span>
                <span className="font-medium text-foreground">{creneau.groupe}</span>
              </div>
            )}
          </div>
        </div>

        {/* Moniteurs Card */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 pt-4 pb-2">
            <h3 className="text-base font-semibold text-foreground">
              {t("creneauxUi.detail.cards.moniteurs")}
            </h3>
          </div>
          <div className="p-6 pt-2">
            {creneau.moniteurs.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t("creneauxUi.detail.emptyMonitors")}</p>
            ) : (
              <div className="space-y-2">
                {creneau.moniteurs.map((cm) => (
                  <div key={cm.id} className="rounded-lg border border-border p-3 text-foreground text-sm">
                    {cm.moniteur.prenom} {cm.moniteur.nom}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inscrits Card - Full Width */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 pt-4 pb-2">
            <h3 className="text-base font-semibold text-foreground">
              {t("creneauxUi.detail.cards.inscrits", { count: creneau.abonnements.length })}
            </h3>
          </div>
          <div className="p-6 pt-2">
            {creneau.abonnements.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t("creneauxUi.detail.emptyEnrolled")}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {creneau.abonnements.map((ca) => (
                  <div key={ca.id} className="rounded-lg border border-border p-3 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5">
                    <p className="font-medium text-foreground text-sm">
                      {ca.abonnement.adherent.prenom} {ca.abonnement.adherent.nom}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
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