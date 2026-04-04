import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { notFound } from "next/navigation";
import { Calendar, CalendarRange, Clock, ArrowLeft, Dumbbell } from "lucide-react";
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
    OUV: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-primary/12 text-primary border border-primary/25",
    FER: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-muted/12 text-muted-foreground border border-muted/20",
    CLO: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-destructive/12 text-destructive border border-destructive/25",
  };
  const statClass = statutColor[saison.statut] ?? statutColor.FER;

  return (
    <AdminPageShell locale={locale}>
      {/* Back button */}
      <Link
        href={`/${locale}/admin/saisons`}
        className="inline-flex w-fit items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/10 border border-border/50 text-muted-foreground text-sm font-medium no-underline hover:bg-muted/15 hover:text-foreground transition-all duration-150 mb-6"
      >
        <ArrowLeft size={16} />
        {t("abonnementsUi.new.back")}
      </Link>

      {/* Hero Section */}
      <div className="relative p-5 px-6 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm mb-4 flex items-start gap-4 overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/40 before:to-transparent">
        <div className="w-12 h-12 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Calendar size={22} />
        </div>
        <div>
          <div className="text-xl font-extrabold text-foreground">
            {saison.designation}
          </div>
          <div className="text-[12.5px] text-muted-foreground mt-1 flex items-center gap-1.5">
            <CalendarRange size={12} />
            {t("saisonsUi.detail.dateRange", {
              start: new Date(saison.dateDebut).toLocaleDateString(dateLocale),
              end: new Date(saison.dateFin).toLocaleDateString(dateLocale),
            })}
          </div>
          <div className="flex gap-2 mt-2">
            <span className={statClass}>{t(`saisonStatus.${saison.statut}`)}</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
              <Dumbbell size={10} />
              {saison.creneaux.length} créneaux
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
              <CalendarRange size={10} />
              {saison.periodes.length} périodes
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3.5 lg:grid-cols-[2fr_1fr]">
        {/* Creneaux Table */}
        <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-[18px] pt-[13px] pb-[11px] border-b border-border/30">
            <div className="w-[30px] h-[30px] rounded-lg bg-primary/12 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Dumbbell size={14} />
            </div>
            <span className="text-[13px] font-semibold text-foreground">
              {t("saisonsUi.detail.cards.creneaux")} ({saison.creneaux.length})
            </span>
          </div>

          {saison.creneaux.length === 0 ? (
            <div className="py-10 px-5 text-center text-muted-foreground text-[13px]">
              Aucun créneau dans cette saison
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/10">
                    <th className="px-3.5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide text-left">
                      {t("saisonsUi.detail.table.discipline")}
                    </th>
                    <th className="px-3.5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide text-left">
                      {t("saisonsUi.detail.table.day")}
                    </th>
                    <th className="px-3.5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide text-left">
                      {t("saisonsUi.detail.table.schedule")}
                    </th>
                    <th className="px-3.5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide text-left">
                      {t("saisonsUi.detail.table.group")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {saison.creneaux.map((c) => (
                    <tr key={c.id} className="border-b border-border/20 last:border-b-0 hover:bg-primary/5 transition-colors">
                      <td className="px-3.5 py-2.5 text-[13px] text-foreground align-middle">
                        <strong className="font-semibold">{c.discipline.designation}</strong>
                      </td>
                      <td className="px-3.5 py-2.5 text-[13px] text-foreground align-middle">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11.5px] font-semibold bg-primary/10 text-primary border border-primary/20">
                          {t(`days.${DAY_KEYS[c.jourSemaine]}`)}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-[13px] text-foreground align-middle">
                        <span className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground">
                          <Clock size={11} />
                          {new Date(c.heureDebut).toTimeString().slice(0, 5)} – {new Date(c.heureFin).toTimeString().slice(0, 5)}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-[13px] text-foreground align-middle">
                        {c.groupe || <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Periodes List */}
        <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-[18px] pt-[13px] pb-[11px] border-b border-border/30">
            <div className="w-[30px] h-[30px] rounded-lg bg-primary/12 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <CalendarRange size={14} />
            </div>
            <span className="text-[13px] font-semibold text-foreground">
              {t("saisonsUi.detail.cards.periodes")} ({saison.periodes.length})
            </span>
          </div>

          {saison.periodes.length === 0 ? (
            <div className="py-6 px-[18px] text-center text-muted-foreground text-[13px]">
              {t("saisonsUi.detail.emptyPeriods")}
            </div>
          ) : (
            <div>
              {saison.periodes.map((p) => (
                <div key={p.id} className="flex items-center gap-2.5 px-[18px] py-2.5 border-b border-border/20 last:border-b-0">
                  <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <CalendarRange size={13} />
                  </div>
                  <span className="text-[13px] text-foreground">
                    {t("saisonsUi.detail.dateRange", {
                      start: new Date(p.dateDebut).toLocaleDateString(dateLocale),
                      end: new Date(p.dateFin).toLocaleDateString(dateLocale),
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