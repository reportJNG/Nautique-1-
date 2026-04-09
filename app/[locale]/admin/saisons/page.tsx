import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminSection,
} from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { Calendar, LayoutGrid } from "lucide-react";
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

// ─── Status visual config ────────────────────────────────────────────────────

const STATUS_CONFIG = {
  OUV: {
    dot: "#1D9E75",
    badge: "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]",
    bar: "bg-[#1D9E75]",
    label: "Open",
  },
  PRE: {
    dot: "#7F77DD",
    badge: "bg-[#EEEDFE] text-[#3C3489] border-[#AFA9EC]",
    bar: "bg-[#7F77DD]",
    label: "Pre-season",
  },
  FER: {
    dot: "#888780",
    badge: "bg-[#F1EFE8] text-[#444441] border-[#D3D1C7]",
    bar: "bg-[#888780]",
    label: "Closed",
  },
  CLO: {
    dot: "#E24B4A",
    badge: "bg-[#FCEBEB] text-[#791F1F] border-[#F7C1C1]",
    bar: "bg-[#E24B4A]",
    label: "Locked",
  },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

// ─── Season card ─────────────────────────────────────────────────────────────

function SaisonCard({
  saison,
  locale,
  dateLocale,
  t,
}: {
  saison: Awaited<ReturnType<typeof getSaisons>>[number];
  locale: string;
  dateLocale: string;
  t: Awaited<ReturnType<typeof getTranslations<"admin">>>;
}) {
  const status =
    (saison.statut as StatusKey) in STATUS_CONFIG
      ? (saison.statut as StatusKey)
      : "FER";
  const cfg = STATUS_CONFIG[status];

  const startDate = new Date(saison.dateDebut).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const endDate = new Date(saison.dateFin).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const startYear = new Date(saison.dateDebut).getFullYear();
  const endYear = new Date(saison.dateFin).getFullYear();
  const yearLabel =
    startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`;

  return (
    <Link
      href={`/${locale}/admin/saisons/${saison.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border/80 hover:shadow-md"
    >
      {/* Top status bar */}
      <div className={`h-0.5 w-full ${cfg.bar} opacity-70`} />

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {yearLabel}
            </p>
            <h3 className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-card-foreground">
              {saison.designation}
            </h3>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${cfg.badge}`}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: cfg.dot }}
            />
            {t(`saisonStatus.${saison.statut}`)}
          </span>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0 opacity-60" />
          <span>{startDate}</span>
          <span className="opacity-40">→</span>
          <span>{endDate}</span>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-border/30 pt-3">
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <LayoutGrid className="h-3.5 w-3.5 opacity-60" />
            <span>
              {t("saisonsUi.cards.slots", { count: saison._count.creneaux })}
            </span>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground/50 transition-colors group-hover:text-muted-foreground">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  t,
}: {
  t: Awaited<ReturnType<typeof getTranslations<"admin">>>;
}) {
  return (
    <div className="flex min-h-[48vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/40 bg-muted/10 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/40 bg-background">
        <Calendar className="h-5 w-5 text-muted-foreground/60" />
      </div>
      <div>
        <p className="text-[14px] font-medium text-foreground">
          No seasons yet
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {t("status.noData")}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SaisonsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const dateLocale =
    locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";

  const [saisons, session] = await Promise.all([getSaisons(), getSession()]);
  const canCreateSaison =
    session?.type === "agent" && session.roleCode === "ADMIN";
  const openSeason = saisons.find((s) => s.statut === "OUV");

  return (
    <AdminPageShell locale={locale}>
      <AdminPageHeader
        title={t("saisonsUi.pageTitle")}
        description={t("saisonsUi.pageDescription", { count: saisons.length })}
        icon={<Calendar className="h-5 w-5" />}
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
          <EmptyState t={t} />
        </AdminSection>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {saisons.map((saison) => (
            <SaisonCard
              key={saison.id}
              saison={saison}
              locale={locale}
              dateLocale={dateLocale}
              t={t}
            />
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
