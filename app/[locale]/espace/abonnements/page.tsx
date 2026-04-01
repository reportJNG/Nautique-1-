import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  Calendar,
  Clock,
  Plus,
  MapPin,
  Tag,
  CalendarRange,
  Layers,
} from "lucide-react";
import {
  STATUT_ABONNEMENT,
  STATUT_ABONNEMENT_STYLES,
  JOURS_SEMAINE,
} from "@/lib/constants";

async function getAbonnements(adherentId: number) {
  return prisma.abonnement.findMany({
    where: { adherentId },
    orderBy: { createdAt: "desc" },
    include: {
      discipline: { include: { espace: true } },
      saison: true,
      categorieAge: true,
      creneaux: {
        where: { actif: 1 },
        include: { creneau: true },
      },
    },
  });
}

const TYPE_LABELS: Record<string, string> = {
  OPN: "Open Saison",
  DUR: "Par durée",
  SEA: "Par séances",
};

export default async function AdherentAbonnementsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getSession();
  if (!session || session.type !== "adherent") return null;

  const abonnements = await getAbonnements(session.id);

  return (
    <div className="min-h-screen bg-gray-50/60 px-4 py-8 dark:bg-gray-950 sm:px-8">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Espace membre
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Mes abonnements
          </h1>
        </div>
        <Link href={`/${locale}/espace/abonnements/nouveau`}>
          <Button className="shrink-0 gap-1.5 rounded-xl bg-gray-900 text-sm text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
            <Plus className="h-3.5 w-3.5" />
            Nouvel abonnement
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {abonnements.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-100 bg-white py-24 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
            <Calendar className="h-7 w-7 text-gray-300 dark:text-gray-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Aucun abonnement
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Souscrivez à votre première discipline pour commencer.
            </p>
          </div>
          <Link href={`/${locale}/espace/abonnements/nouveau`}>
            <Button className="mt-1 rounded-xl bg-gray-900 text-sm text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
              Créer un abonnement
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {abonnements.map((abonnement) => {
            const dateDebut = new Date(abonnement.dateDebut).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const dateFin = new Date(abonnement.dateFin).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const initial = abonnement.discipline.designation.charAt(0).toUpperCase();

            return (
              <div
                key={abonnement.id}
                className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left */}
                    <div className="flex gap-4">
                      {/* Discipline avatar */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-base font-bold text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
                        {initial}
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        {/* Title row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            {abonnement.discipline.designation}
                          </h3>
                          <Badge className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUT_ABONNEMENT_STYLES[abonnement.statut]}`}>
                            {STATUT_ABONNEMENT[abonnement.statut as keyof typeof STATUT_ABONNEMENT]}
                          </Badge>
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {abonnement.discipline.espace.designation}
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {abonnement.saison.designation}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {abonnement.categorieAge.designation}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarRange className="h-3 w-3" />
                            {dateDebut} → {dateFin}
                          </span>
                        </div>

                        {/* Creneaux */}
                        {abonnement.creneaux.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {abonnement.creneaux.map((ca) => (
                              <span
                                key={ca.id}
                                className="flex items-center gap-1 rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"
                              >
                                <Clock className="h-3 w-3" />
                                {JOURS_SEMAINE[ca.creneau.jourSemaine]}{" "}
                                {new Date(ca.creneau.heureDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}–{new Date(ca.creneau.heureFin).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right — price */}
                    <div className="flex shrink-0 flex-col items-end gap-1 sm:pl-4">
                      <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">
                        {Number(abonnement.montantTtc).toFixed(2)}{" "}
                        <span className="text-sm font-normal text-gray-400">DA</span>
                      </p>
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        {TYPE_LABELS[abonnement.typeAbonnement] ?? abonnement.typeAbonnement}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}