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
  const dateLocale = locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";
  const saison = await getSaison(parseInt(id));

  if (!saison) notFound();

  const statutColor: Record<string, string> = {
    PRE: "inline-flex items-center rounded-full border border-primary/25 bg-primary/12 px-2.5 py-0.5 text-[11.5px] font-bold text-primary",
    OUV: "inline-flex items-center rounded-full border border-primary/25 bg-primary/12 px-2.5 py-0.5 text-[11.5px] font-bold text-primary",
    FER: "inline-flex items-center rounded-full border border-muted/20 bg-muted/12 px-2.5 py-0.5 text-[11.5px] font-bold text-muted-foreground",
    CLO: "inline-flex items-center rounded-full border border-destructive/25 bg-destructive/12 px-2.5 py-0.5 text-[11.5px] font-bold text-destructive",
  };
  const statClass = statutColor[saison.statut] ?? statutColor.FER;

  return (
    <AdminPageShell locale={locale}>
      <Link
        href={`/${locale}/admin/saisons`}
        className="mb-6 inline-flex w-fit items-center gap-2 rounded-lg border border-border/50 bg-muted/10 px-3 py-1.5 text-sm font-medium text-muted-foreground no-underline transition-all duration-150 hover:bg-muted/15 hover:text-foreground"
      >
        <ArrowLeft size={16} />
        {t("abonnementsUi.new.back")}
      </Link>

      <div className="relative mb-4 flex items-start gap-4 overflow-hidden rounded-xl border border-border/50 bg-card/80 p-5 px-6 backdrop-blur-sm before:absolute before:left-0 before:right-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/40 before:to-transparent before:content-['']">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/12 text-primary">
          <Calendar size={22} />
        </div>
        <div>
          <div className="text-xl font-extrabold text-foreground">
            {saison.designation}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
            <CalendarRange size={12} />
            {t("saisonsUi.detail.dateRange", {
              start: new Date(saison.dateDebut).toLocaleDateString(dateLocale),
              end: new Date(saison.dateFin).toLocaleDateString(dateLocale),
            })}
          </div>
          <div className="mt-2 flex gap-2">
            <span className={statClass}>{t(`saisonStatus.${saison.statut}`)}</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <Dumbbell size={10} />
              {t("saisonsUi.detail.slotCount", { count: saison.creneaux.length })}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <CalendarRange size={10} />
              {t("saisonsUi.detail.periodCount", { count: saison.periodes.length })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3.5 lg:grid-cols-[2fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 border-b border-border/30 px-[18px] pb-[11px] pt-[13px]">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/12 text-primary">
              <Dumbbell size={14} />
            </div>
            <span className="text-[13px] font-semibold text-foreground">
              {t("saisonsUi.detail.cards.creneaux")} ({saison.creneaux.length})
            </span>
          </div>

          {saison.creneaux.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px] text-muted-foreground">
              {t("saisonsUi.detail.emptySlots")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/10">
                    <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      {t("saisonsUi.detail.table.discipline")}
                    </th>
                    <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      {t("saisonsUi.detail.table.day")}
                    </th>
                    <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      {t("saisonsUi.detail.table.schedule")}
                    </th>
                    <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
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
                      <td className="align-middle px-3.5 py-2.5 text-[13px] text-foreground">
                        <strong className="font-semibold">
                          {creneau.discipline.designation}
                        </strong>
                      </td>
                      <td className="align-middle px-3.5 py-2.5 text-[13px] text-foreground">
                        <span className="inline-block rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11.5px] font-semibold text-primary">
                          {t(`days.${DAY_KEYS[creneau.jourSemaine]}`)}
                        </span>
                      </td>
                      <td className="align-middle px-3.5 py-2.5 text-[13px] text-foreground">
                        <span className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground">
                          <Clock size={11} />
                          {new Date(creneau.heureDebut).toTimeString().slice(0, 5)} -{" "}
                          {new Date(creneau.heureFin).toTimeString().slice(0, 5)}
                        </span>
                      </td>
                      <td className="align-middle px-3.5 py-2.5 text-[13px] text-foreground">
                        {creneau.groupe || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 border-b border-border/30 px-[18px] pb-[11px] pt-[13px]">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/12 text-primary">
              <CalendarRange size={14} />
            </div>
            <span className="text-[13px] font-semibold text-foreground">
              {t("saisonsUi.detail.cards.periodes")} ({saison.periodes.length})
            </span>
          </div>

          {saison.periodes.length === 0 ? (
            <div className="px-[18px] py-6 text-center text-[13px] text-muted-foreground">
              {t("saisonsUi.detail.emptyPeriods")}
            </div>
          ) : (
            <div>
              {saison.periodes.map((periode) => (
                <div
                  key={periode.id}
                  className="flex items-center gap-2.5 border-b border-border/20 px-[18px] py-2.5 last:border-b-0"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                    <CalendarRange size={13} />
                  </div>
                  <span className="text-[13px] text-foreground">
                    {t("saisonsUi.detail.dateRange", {
                      start: new Date(periode.dateDebut).toLocaleDateString(dateLocale),
                      end: new Date(periode.dateFin).toLocaleDateString(dateLocale),
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
