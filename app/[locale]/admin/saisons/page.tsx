import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader, AdminSection, AdminPageShell } from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { Calendar, Plus, Clock, LayoutGrid } from "lucide-react";
import Link from "next/link";

type PageProps = {
  params: Promise<{ locale: string }>;
};

async function getSaisons() {
  return prisma.saison.findMany({
    orderBy: { dateDebut: "desc" },
    include: { _count: { select: { creneaux: true } } },
  });
}

export default async function SaisonsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const dateLocale = locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";
  const saisons = await getSaisons();

  const statusBadgeClasses: Record<string, string> = {
    OUV: "bg-[rgba(16,185,129,0.12)] text-emerald-500 border border-emerald-500/25",
    FER: "bg-[rgba(100,116,139,0.12)] text-slate-400 border border-slate-400/20",
    PRE: "bg-[rgba(14,165,233,0.12)] text-primary border border-primary/25",
    CLO: "bg-[rgba(248,113,113,0.12)] text-red-400 border border-red-400/25",
  };

  const statusAfterClasses: Record<string, string> = {
    OUV: "after:bg-gradient-to-r after:from-transparent after:via-emerald-500 after:to-transparent",
    FER: "after:bg-gradient-to-r after:from-transparent after:via-slate-400 after:to-transparent",
    PRE: "after:bg-gradient-to-r after:from-transparent after:via-primary after:to-transparent",
    CLO: "after:bg-gradient-to-r after:from-transparent after:via-red-400 after:to-transparent",
  };

  return (
    <AdminPageShell locale={locale}>
      <AdminPageHeader
        title={t("saisonsUi.pageTitle")}
        description={`${saisons.length} saison${saisons.length !== 1 ? "s" : ""}`}
        icon={<Calendar />}
        actions={
          <Link
            href={`/${locale}/admin/saisons/new`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold border-none cursor-pointer transition-all duration-200 hover:bg-accent hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(6,182,212,0.3)] [&_svg]:w-[15px] [&_svg]:h-[15px]"
          >
            <Plus />
            {t("saisonsUi.newButton")}
          </Link>
        }
      />

      {saisons.length === 0 ? (
        <AdminSection>
          <div className="text-center py-16 text-muted-foreground text-sm">
            {t("status.noData")}
          </div>
        </AdminSection>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {saisons.map((saison) => {
            const statusKey = saison.statut?.toLowerCase() ?? "fer";
            const status = saison.statut as keyof typeof statusBadgeClasses;
            const badgeClass = statusBadgeClasses[status] || statusBadgeClasses.FER;
            const afterClass = statusAfterClasses[status] || statusAfterClasses.FER;

            return (
              <Link
                key={saison.id}
                href={`/${locale}/admin/saisons/${saison.id}`}
                className={`group relative rounded-xl border border-border bg-card backdrop-blur-sm p-5 flex flex-col gap-3.5 overflow-hidden transition-all duration-300 hover:border-primary hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-0.5 after:opacity-0 after:transition-opacity after:duration-200 hover:after:opacity-70 ${afterClass}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-base font-bold text-card-foreground tracking-tight">
                    {saison.designation}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wide whitespace-nowrap ${badgeClass}`}>
                    {t(`saisonStatus.${saison.statut}`)}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                    <Clock size={13} className="text-muted-foreground shrink-0" />
                    {t("saisonsUi.detail.dateRange", {
                      start: new Date(saison.dateDebut).toLocaleDateString(dateLocale),
                      end: new Date(saison.dateFin).toLocaleDateString(dateLocale),
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-border">
                  <div className="inline-flex items-center gap-1.5 bg-secondary border border-border rounded-md px-2.5 py-0.5 text-xs font-bold text-primary">
                    <LayoutGrid size={12} />
                    {t("saisonsUi.cards.slots", { count: saison._count.creneaux })}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AdminPageShell>
  );
}