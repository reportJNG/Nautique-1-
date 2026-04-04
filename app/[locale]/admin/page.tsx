import { prisma } from "@/lib/db/prisma";
import { cn } from "@/lib/utils";
import { AdminPageHeader, AdminSection, AdminPageShell } from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import {
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";

/* ─── Types ──────────────────────────────────────────────────── */
type Accent = "cyan" | "emerald" | "amber" | "sky" | "violet";
type StatusCode = "ACT" | "ATT" | "EXP" | "RES" | "ANN";

interface DashboardStats {
  totalAdherents: number;
  actifAbonnements: number;
  pendingFactures: number;
  monthlyRevenue: number;
  revTrend: number | null;
  availableCreneaux: number;
  recentAbonnements: RecentAbonnement[];
}

interface RecentAbonnement {
  id: number;
  createdAt: Date;
  montantTtc: any;
  statut: StatusCode;
  typeAbonnement: string;
  adherent: {
    prenom: string | null;
    nom: string | null;
  };
  discipline: {
    designation: string;
  };
  saison: {
    id: number;
  };
}

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: Accent;
  trend?: number | null;
  trendLabel?: string;
  isLoading?: boolean;
}

/* ─── Constants ───────────────────────────────────────────────── */
const ACCENT_STYLES: Record<Accent, {
  iconBg: string;
  iconText: string;
  glow: string;
  hover: string;
}> = {
  cyan: {
    iconBg: "bg-primary/15",
    iconText: "text-primary",
    glow: "via-primary",
    hover: "hover:border-primary/20"
  },
  emerald: {
    iconBg: "bg-primary/15",
    iconText: "text-primary",
    glow: "via-primary",
    hover: "hover:border-primary/20"
  },
  amber: {
    iconBg: "bg-accent/15",
    iconText: "text-accent",
    glow: "via-accent",
    hover: "hover:border-accent/20"
  },
  sky: {
    iconBg: "bg-primary/15",
    iconText: "text-primary",
    glow: "via-primary",
    hover: "hover:border-primary/20"
  },
  violet: {
    iconBg: "bg-primary/15",
    iconText: "text-primary",
    glow: "via-primary",
    hover: "hover:border-primary/20"
  },
};

const STATUS_STYLES: Record<StatusCode, string> = {
  ACT: "bg-primary/10 text-primary border-primary/20",
  ATT: "bg-accent/10 text-accent border-accent/20",
  EXP: "bg-destructive/10 text-destructive border-destructive/20",
  RES: "bg-primary/10 text-primary border-primary/20",
  ANN: "bg-muted/10 text-muted-foreground border-border/20",
};

const DEFAULT_STATUS_STYLE = STATUS_STYLES.ANN;

/* ─── Data Fetching with Caching ──────────────────────────────── */
const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  noStore(); // Ensure fresh data on every request

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  try {
    const [
      totalAdherents,
      actifAbonnements,
      pendingFactures,
      monthlyRevenue,
      prevMonthRevenue,
      availableCreneaux,
      recentAbonnements,
    ] = await Promise.all([
      prisma.adherent.count({ where: { actif: 1 } }),
      prisma.abonnement.count({
        where: {
          statut: "ACT",
          dateDebut: { lte: now },
          dateFin: { gte: now }
        },
      }),
      prisma.facture.count({ where: { statut: "ATT" } }),
      prisma.facture.aggregate({
        where: {
          statut: "PAY",
          datePaiement: { gte: firstDayOfMonth }
        },
        _sum: { montantTtc: true },
      }),
      prisma.facture.aggregate({
        where: {
          statut: "PAY",
          datePaiement: { gte: firstDayPrevMonth, lt: firstDayOfMonth }
        },
        _sum: { montantTtc: true },
      }),
      prisma.creneau.count({
        where: {
          actif: 1,
          saison: { statut: "OUV" }
        }
      }),
      prisma.abonnement.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          adherent: { select: { prenom: true, nom: true } },
          discipline: { select: { designation: true } },
          saison: { select: { id: true } }
        },
      }),
    ]);

    const currentRev = Number(monthlyRevenue._sum.montantTtc || 0);
    const prevRev = Number(prevMonthRevenue._sum.montantTtc || 0);
    const revTrend = prevRev === 0 ? null : Math.round(((currentRev - prevRev) / prevRev) * 100);

    return {
      totalAdherents,
      actifAbonnements,
      pendingFactures,
      monthlyRevenue: currentRev,
      revTrend,
      availableCreneaux,
      recentAbonnements: recentAbonnements as RecentAbonnement[],
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    throw new Error("Unable to load dashboard statistics");
  }
});

/* ─── UI Components ──────────────────────────────────────────── */
const KpiCard = ({
  label,
  value,
  icon,
  accent,
  trend,
  trendLabel,
  isLoading = false,
}: KpiCardProps) => {
  const a = ACCENT_STYLES[accent];

  const renderTrend = () => {
    if (!trendLabel) return null;

    if (trend == null) {
      return (
        <div className="flex items-center gap-1 text-[11px]">
          <Minus size={11} className="text-muted-foreground" />
          <span className="text-muted-foreground">{trendLabel}</span>
        </div>
      );
    }

    const isPositive = trend > 0;
    const isNegative = trend < 0;
    const Icon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : Minus;
    const colorClass = isPositive ? "text-primary" : isNegative ? "text-destructive" : "text-muted-foreground";

    return (
      <div className="flex items-center gap-1 text-[11px]">
        <Icon size={11} className={colorClass} />
        <span className={colorClass}>
          {isPositive ? `+${trend}%` : isNegative ? `${trend}%` : trendLabel}
        </span>
        {!isNegative && !isPositive && <span className="text-muted-foreground">&nbsp;{trendLabel}</span>}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-border/50",
        "bg-card/80 backdrop-blur-md",
        "p-4 flex flex-col gap-3",
        "shadow-[0_2px_8px_rgba(0,0,0,0.25)]",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.4)]",
        a.hover,
        isLoading && "opacity-70 animate-pulse pointer-events-none"
      )}
    >
      <div className={cn("absolute top-0 inset-x-0 h-px opacity-50 bg-gradient-to-r from-transparent to-transparent", a.glow)} />

      <div className="flex items-start justify-between gap-2">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", a.iconBg, a.iconText)}>
          {icon}
        </div>
      </div>

      <div className="text-[26px] font-extrabold tracking-tight text-foreground leading-none">
        {isLoading ? "—" : value}
      </div>

      {renderTrend()}
    </div>
  );
};

const StatusBadge = ({ code, label }: { code: string; label: string }) => {
  const isValidCode = (c: string): c is StatusCode => c in STATUS_STYLES;
  const style = isValidCode(code) ? STATUS_STYLES[code] : DEFAULT_STATUS_STYLE;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full",
        "text-[10.5px] font-semibold whitespace-nowrap border",
        style
      )}
    >
      {label}
    </span>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
    <p className="text-muted-foreground text-sm">{message}</p>
  </div>
);

/* ─── Main Page Component ────────────────────────────────────── */
interface AdminDashboardPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminDashboardPage({
  params,
  searchParams
}: AdminDashboardPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const stats = await getDashboardStats();
  const dateLocale = locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString(dateLocale)} DA`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(dateLocale, {
      dateStyle: "medium",
    }).format(date);
  };

  const getInitials = (prenom: string | null, nom: string | null): string => {
    return `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() || "?";
  };

  return (
    <AdminPageShell locale={locale}>
      <AdminPageHeader
        title={t("dashboardUi.title")}
        description={t("dashboardUi.description")}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          label={t("dashboardUi.kpis.adherentsActive")}
          value={stats.totalAdherents}
          icon={<Users className="w-[16px] h-[16px]" />}
          accent="cyan"
        />
        <KpiCard
          label={t("dashboardUi.kpis.abonnementsActive")}
          value={stats.actifAbonnements}
          icon={<Calendar className="w-[16px] h-[16px]" />}
          accent="emerald"
        />
        <KpiCard
          label={t("dashboardUi.kpis.pendingFactures")}
          value={stats.pendingFactures}
          icon={<CreditCard className="w-[16px] h-[16px]" />}
          accent="amber"
        />
        <KpiCard
          label={t("dashboardUi.kpis.monthlyRevenue")}
          value={formatCurrency(stats.monthlyRevenue)}
          icon={<TrendingUp className="w-[16px] h-[16px]" />}
          accent="sky"
          trend={stats.revTrend}
          trendLabel={tc("vsLastMonth")}
        />
        <KpiCard
          label={t("dashboardUi.kpis.availableCreneaux")}
          value={stats.availableCreneaux}
          icon={<Clock className="w-[16px] h-[16px]" />}
          accent="violet"
        />
      </div>

      {/* Recent Subscriptions Section */}
      <AdminSection
        title={t("dashboardUi.recentAbonnements.title")}
        description={t("dashboardUi.recentAbonnements.description")}
      >
        {stats.recentAbonnements.length === 0 ? (
          <EmptyState message={t("dashboardUi.recentAbonnements.empty")} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border/50">
                  {[
                    t("abonnementsUi.table.adherent"),
                    t("abonnementsUi.table.discipline"),
                    t("abonnementsUi.table.type"),
                    t("abonnementsUi.table.status"),
                    t("abonnementsUi.table.amount"),
                    tc("date"),
                  ].map((header, index) => (
                    <th
                      key={index}
                      className={cn(
                        "py-3 px-4 text-[10.5px] font-bold text-muted-foreground uppercase tracking-widest",
                        index === 5 && "text-right"
                      )}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentAbonnements.map((subscription) => {
                  const initials = getInitials(
                    subscription.adherent.prenom,
                    subscription.adherent.nom
                  );

                  return (
                    <tr
                      key={subscription.id}
                      className="border-b border-border/30 last:border-none hover:bg-muted/10 transition-colors duration-150"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0">
                            {initials}
                          </div>
                          <span className="text-[13px] font-semibold text-foreground">
                            {subscription.adherent.prenom} {subscription.adherent.nom}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[13px] text-foreground">
                        {subscription.discipline.designation}
                      </td>
                      <td className="py-3 px-4 text-[13px] text-foreground">
                        {subscription.typeAbonnement}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge
                          code={subscription.statut}
                          label={t(`abonnementStatus.${subscription.statut}`)}
                        />
                      </td>
                      <td className="py-3 px-4 text-[13px] font-semibold text-foreground">
                        {formatCurrency(Number(subscription.montantTtc))}
                      </td>
                      <td className="py-3 px-4 text-right text-[11.5px] text-muted-foreground">
                        {formatDate(subscription.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminSection>
    </AdminPageShell>
  );
}

/* ─── Optional: Add metadata for better SEO ──────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });

  return {
    title: `${t("dashboardUi.title")} | Admin Dashboard`,
    description: t("dashboardUi.description"),
  };
}