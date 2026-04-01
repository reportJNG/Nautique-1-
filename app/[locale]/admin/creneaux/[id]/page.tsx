import React from "react";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    return <div>{t("creneauxUi.detail.notFound")}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        {t("creneauxUi.detail.title")}
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t("creneauxUi.detail.cards.informations")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">{t("creneauxUi.detail.labels.discipline")}</span>
              <span className="font-medium">{creneau.discipline.designation}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">{t("creneauxUi.detail.labels.space")}</span>
              <Badge variant="outline">{creneau.discipline.espace.code}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">{t("creneauxUi.detail.labels.day")}</span>
              <span className="font-medium">{t(`days.${dayKeyByIndex[creneau.jourSemaine]}`)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">{t("creneauxUi.detail.labels.schedule")}</span>
              <span className="font-medium">
                {creneau.heureDebut.toLocaleTimeString()} – {creneau.heureFin.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">{t("creneauxUi.detail.labels.capacity")}</span>
              <span className="font-medium">{creneau.nombreMin} - {creneau.nombreMax}</span>
            </div>
            {creneau.groupe && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">{t("creneauxUi.detail.labels.group")}</span>
                <span className="font-medium">{creneau.groupe}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("creneauxUi.detail.cards.moniteurs")}</CardTitle></CardHeader>
          <CardContent>
            {creneau.moniteurs.length === 0 ? (
              <p className="text-gray-500">{t("creneauxUi.detail.emptyMonitors")}</p>
            ) : (
              <div className="space-y-2">
                {creneau.moniteurs.map((cm) => (
                  <div key={cm.id} className="rounded-lg border p-3">
                    {cm.moniteur.prenom} {cm.moniteur.nom}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("creneauxUi.detail.cards.inscrits", { count: creneau.abonnements.length })}</CardTitle>
          </CardHeader>
          <CardContent>
            {creneau.abonnements.length === 0 ? (
              <p className="text-gray-500">{t("creneauxUi.detail.emptyEnrolled")}</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {creneau.abonnements.map((ca) => (
                  <div key={ca.id} className="rounded-lg border p-3">
                    <p className="font-medium">{ca.abonnement.adherent.prenom} {ca.abonnement.adherent.nom}</p>
                    <p className="text-sm text-gray-500">{ca.abonnement.adherent.numeroDossier}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}