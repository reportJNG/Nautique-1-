import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CalendarRange,
  Clock,
  Dumbbell,
} from "lucide-react";
import Link from "next/link";

async function getSaison(id: number) {
  return prisma.saison.findUnique({
    where: { id },
    include: {
      periodes: true,
      creneaux: {
        include: { discipline: true },
        orderBy: [{ jourSemaine: "asc" }, { heureDebut: "asc" }],
      },
    },
  });
}

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export default async function SaisonDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const dateLocale =
    locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";
  const saison = await getSaison(parseInt(id));

  if (!saison) notFound();

  const statutColor: Record<string, string> = {
    PRE: "inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-blue-600 dark:text-blue-400",
    OUV: "inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-400",
    FER: "inline-flex items-center rounded-full border border-gray-400/30 bg-gray-100 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-gray-600 dark:border-gray-600/40 dark:bg-gray-800/50 dark:text-gray-400",
    CLO: "inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-rose-700 dark:text-rose-400",
  };
  const statClass = statutColor[saison.statut] ?? statutColor.FER;

  // Helper to format time without date part
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <AdminPageShell locale={locale}>
      {/* Back link - smaller on mobile */}
      <Link
        href={`/${locale}/admin/saisons`}
        className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-border/50 bg-muted/10 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/50 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm"
      >
        <ArrowLeft size={14} className="sm:h-4 sm:w-4" />
        {t("abonnementsUi.new.back")}
      </Link>

      {/* Season header - compact & responsive */}
      <div className="relative mb-5 overflow-hidden rounded-xl border border-border/50 bg-card/80 p-3 backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/12 text-primary sm:h-12 sm:w-12">
            <Calendar size={18} className="sm:h-5 sm:w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-extrabold text-foreground sm:text-xl">
              {saison.designation}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground sm:gap-x-3 sm:text-xs">
              <span className="inline-flex items-center gap-1">
                <CalendarRange size={11} />
                {t("saisonsUi.detail.dateRange", {
                  start: new Date(saison.dateDebut).toLocaleDateString(
                    dateLocale,
                  ),
                  end: new Date(saison.dateFin).toLocaleDateString(dateLocale),
                })}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
              <span className={statClass}>
                {t(`saisonStatus.${saison.statut}`)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary sm:px-2.5 sm:text-[11px]">
                <Dumbbell size={9} className="sm:h-2.5 sm:w-2.5" />
                {t("saisonsUi.detail.slotCount", {
                  count: saison.creneaux.length,
                })}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary sm:px-2.5 sm:text-[11px]">
                <CalendarRange size={9} className="sm:h-2.5 sm:w-2.5" />
                {t("saisonsUi.detail.periodCount", {
                  count: saison.periodes.length,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column responsive layout */}
      <div className="grid gap-4 md:gap-5 lg:grid-cols-[2fr_1fr]">
        {/* Slots section - mobile cards, desktop table */}
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-border/30 px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/12 text-primary sm:h-8 sm:w-8">
              <Dumbbell size={13} className="sm:h-3.5 sm:w-3.5" />
            </div>
            <span className="text-xs font-semibold text-foreground sm:text-sm">
              {t("saisonsUi.detail.cards.creneaux")} ({saison.creneaux.length})
            </span>
          </div>

          {saison.creneaux.length === 0 ? (
            <div className="px-3 py-10 text-center text-xs text-muted-foreground sm:px-4 sm:py-12 sm:text-sm">
              {t("saisonsUi.detail.emptySlots")}
            </div>
          ) : (
            <>
              {/* Mobile card layout (visible below md) */}
              <div className="block md:hidden divide-y divide-border/20">
                {saison.creneaux.map((creneau) => (
                  <div key={creneau.id} className="p-3 space-y-1.5">
                    <div className="font-semibold text-foreground text-sm">
                      {creneau.discipline.designation}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          {t(`days.${DAY_KEYS[creneau.jourSemaine]}`)}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} />
                        {formatTime(new Date(creneau.heureDebut))} -{" "}
                        {formatTime(new Date(creneau.heureFin))}
                      </span>
                      <span className="text-muted-foreground">
                        {creneau.groupe || "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table layout (md and up) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/30 bg-muted/10">
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground sm:px-4 sm:py-2.5 sm:text-[11px]">
                        {t("saisonsUi.detail.table.discipline")}
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground sm:px-4 sm:py-2.5 sm:text-[11px]">
                        {t("saisonsUi.detail.table.day")}
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground sm:px-4 sm:py-2.5 sm:text-[11px]">
                        {t("saisonsUi.detail.table.schedule")}
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground sm:px-4 sm:py-2.5 sm:text-[11px]">
                        {t("saisonsUi.detail.table.group")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {saison.creneaux.map((creneau) => (
                      <tr
                        key={creneau.id}
                        className="border-b border-border/20 transition-colors last:border-b-0 hover:bg-primary/5"
                      >
                        <td className="whitespace-nowrap px-3 py-2 font-medium text-foreground sm:px-4 sm:py-2.5">
                          {creneau.discipline.designation}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 sm:px-4 sm:py-2.5">
                          <span className="inline-block rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary sm:px-2 sm:text-[11px]">
                            {t(`days.${DAY_KEYS[creneau.jourSemaine]}`)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 sm:px-4 sm:py-2.5">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={11} />
                            {formatTime(new Date(creneau.heureDebut))} -{" "}
                            {formatTime(new Date(creneau.heureFin))}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-muted-foreground sm:px-4 sm:py-2.5">
                          {creneau.groupe || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Periods section - also responsive */}
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-border/30 px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/12 text-primary sm:h-8 sm:w-8">
              <CalendarRange size={13} className="sm:h-3.5 sm:w-3.5" />
            </div>
            <span className="text-xs font-semibold text-foreground sm:text-sm">
              {t("saisonsUi.detail.cards.periodes")} ({saison.periodes.length})
            </span>
          </div>

          {saison.periodes.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground sm:px-4 sm:py-10 sm:text-sm">
              {t("saisonsUi.detail.emptyPeriods")}
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {saison.periodes.map((periode) => (
                <div
                  key={periode.id}
                  className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-primary/5 sm:gap-3 sm:px-4 sm:py-2.5"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary sm:h-8 sm:w-8">
                    <CalendarRange size={12} className="sm:h-3.5 sm:w-3.5" />
                  </div>
                  <span className="text-xs text-foreground sm:text-sm">
                    {new Date(periode.dateDebut).toLocaleDateString(
                      dateLocale,
                      {
                        month: "short",
                        day: "numeric",
                      },
                    )}{" "}
                    –{" "}
                    {new Date(periode.dateFin).toLocaleDateString(dateLocale, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}
