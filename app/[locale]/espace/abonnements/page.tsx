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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-950 px-4 py-8 sm:px-8">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 dark:text-blue-500">
            Espace membre
          </p>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-900 to-cyan-600 dark:from-white dark:to-cyan-400 bg-clip-text text-transparent">
            Mes abonnements
          </h1>
        </div>
        <Link href={`/${locale}/espace/abonnements/nouveau`}>
          <Button className="shrink-0 gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-sm text-white shadow-md transition-all hover:from-blue-700 hover:to-cyan-700 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600">
            <Plus className="h-3.5 w-3.5" />
            Nouvel abonnement
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {abonnements.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-blue-200/50 bg-white/80 backdrop-blur-sm py-24 shadow-xl dark:border-blue-800/50 dark:bg-blue-950/80">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-800 dark:to-cyan-800">
            <Calendar className="h-7 w-7 text-blue-400 dark:text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Aucun abonnement
            </p>
            <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
              Souscrivez à votre première discipline pour commencer.
            </p>
          </div>
          <Link href={`/${locale}/espace/abonnements/nouveau`}>
            <Button className="mt-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-sm text-white shadow-md transition-all hover:from-blue-700 hover:to-cyan-700 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600">
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
                className="rounded-2xl border border-blue-200/50 bg-white/80 backdrop-blur-sm shadow-xl transition-all hover:shadow-2xl dark:border-blue-800/50 dark:bg-blue-950/80"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left */}
                    <div className="flex gap-4">
                      {/* Discipline avatar */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-base font-bold text-white shadow-md">
                        {initial}
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        {/* Title row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-blue-900 dark:text-white">
                            {abonnement.discipline.designation}
                          </h3>
                          <Badge className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUT_ABONNEMENT_STYLES[abonnement.statut]}`}>
                            {STATUT_ABONNEMENT[abonnement.statut as keyof typeof STATUT_ABONNEMENT]}
                          </Badge>
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-blue-500 dark:text-blue-400">
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
                                className="flex items-center gap-1 rounded-full border border-blue-200/50 bg-blue-50/50 px-2.5 py-1 text-[11px] font-medium text-blue-600 backdrop-blur-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-400"
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
                      <p className="text-xl font-bold tabular-nums text-blue-900 dark:text-white">
                        {Number(abonnement.montantTtc).toFixed(2)}{" "}
                        <span className="text-sm font-normal text-blue-400">DA</span>
                      </p>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
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