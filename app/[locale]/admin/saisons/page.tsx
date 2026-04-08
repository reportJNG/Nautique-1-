import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminSection,
} from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { Calendar, Clock, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { CreateSaisonDialog } from "./CreateSaisonDialog";

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
  const [saisons, session] = await Promise.all([getSaisons(), getSession()]);
  const canCreateSaison = session?.type === "agent" && session.roleCode === "ADMIN";
  const openSeason = saisons.find((saison) => saison.statut === "OUV");

  const statusBadgeClasses: Record<string, string> = {
    OUV: "border border-emerald-500/25 bg-[rgba(16,185,129,0.12)] text-emerald-500",
    FER: "border border-slate-400/20 bg-[rgba(100,116,139,0.12)] text-slate-400",
    PRE: "border border-primary/25 bg-[rgba(14,165,233,0.12)] text-primary",
    CLO: "border border-red-400/25 bg-[rgba(248,113,113,0.12)] text-red-400",
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
        description={t("saisonsUi.pageDescription", { count: saisons.length })}
        icon={<Calendar />}
        actions={
          canCreateSaison ? (
            <CreateSaisonDialog
              locale={locale}
              defaultStatus={openSeason ? "PRE" : "OUV"}
              hasOpenSeason={Boolean(openSeason)}
              openSeasonDesignation={openSeason?.designation}
            />
          ) : null
        }
      />

      {saisons.length === 0 ? (
        <AdminSection>
          <div className="py-16 text-center text-sm text-muted-foreground">
            {t("status.noData")}
          </div>
        </AdminSection>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saisons.map((saison) => {
            const status = saison.statut as keyof typeof statusBadgeClasses;
            const badgeClass = statusBadgeClasses[status] || statusBadgeClasses.FER;
            const afterClass = statusAfterClasses[status] || statusAfterClasses.FER;

            return (
              <Link
                key={saison.id}
                href={`/${locale}/admin/saisons/${saison.id}`}
                className={`group relative flex flex-col gap-3.5 overflow-hidden rounded-xl border border-border bg-card p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] after:absolute after:left-0 after:right-0 after:top-0 after:h-0.5 after:opacity-0 after:transition-opacity after:duration-200 after:content-[''] hover:after:opacity-70 ${afterClass}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-base font-bold tracking-tight text-card-foreground">
                    {saison.designation}
                  </div>
                  <span
                    className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${badgeClass}`}
                  >
                    {t(`saisonStatus.${saison.statut}`)}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                    <Clock size={13} className="shrink-0 text-muted-foreground" />
                    {t("saisonsUi.detail.dateRange", {
                      start: new Date(saison.dateDebut).toLocaleDateString(dateLocale),
                      end: new Date(saison.dateFin).toLocaleDateString(dateLocale),
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end border-t border-border pt-2">
                  <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-0.5 text-xs font-bold text-primary">
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
