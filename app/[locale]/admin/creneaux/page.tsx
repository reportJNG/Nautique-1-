import { getTranslations } from "next-intl/server";
import {
  Calendar,
  ChevronRight,
  Clock,
  Dumbbell,
  MapPin,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { AdminPageHeader, AdminPageShell } from "@/components/admin/AdminPage";
import {
  formatTimeForLocale,
  getDayKey,
  inferOneBasedWeek,
} from "@/lib/creneaux";
import { CreateCreneauDialog } from "./CreateCreneauxSaisonDialog";

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getCreneaux() {
  return prisma.creneau.findMany({
    include: {
      discipline: { include: { espace: true } },
      saison: true,
      _count: { select: { abonnements: true } },
    },
    orderBy: [{ jourSemaine: "asc" }, { heureDebut: "asc" }],
  });
}

async function getSaisonsForCreation() {
  return prisma.saison.findMany({
    orderBy: { dateDebut: "desc" },
    select: { id: true, designation: true, statut: true },
  });
}

async function getDisciplinesForCreation() {
  return prisma.discipline.findMany({
    where: { actif: 1 },
    orderBy: [{ designation: "asc" }],
    select: {
      id: true,
      code: true,
      designation: true,
      espace: {
        select: {
          code: true,
          designation: true,
        },
      },
    },
  });
}

// ─── Fill rate helpers ────────────────────────────────────────────────────────

function getFillMeta(pct: number): {
  barColor: string;
  badgeStyle: React.CSSProperties;
  labelKey: "full" | "almostFull" | "limited" | "available";
} {
  if (pct >= 100)
    return {
      barColor: "#E24B4A",
      badgeStyle: { background: "#FCEBEB", color: "#791F1F" },
      labelKey: "full",
    };
  if (pct >= 80)
    return {
      barColor: "#7F77DD",
      badgeStyle: { background: "#EEEDFE", color: "#3C3489" },
      labelKey: "almostFull",
    };
  if (pct >= 50)
    return {
      barColor: "#1D9E75",
      badgeStyle: { background: "#E1F5EE", color: "#085041" },
      labelKey: "limited",
    };
  return {
    barColor: "#888780",
    badgeStyle: { background: "#F1EFE8", color: "#444441" },
    labelKey: "available",
  };
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/40 bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
          {label}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40">
          <Icon className="h-4 w-4 text-muted-foreground/60" />
        </div>
      </div>
      <p
        className={`text-2xl font-semibold tabular-nums tracking-tight ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CreneauxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });

  const [creneaux, saisons, disciplines, session] = await Promise.all([
    getCreneaux(),
    getSaisonsForCreation(),
    getDisciplinesForCreation(),
    getSession(),
  ]);

  const oneBasedWeek =
    creneaux.length === 0
      ? true
      : inferOneBasedWeek(creneaux.map((c) => c.jourSemaine));
  const canCreateCreneau =
    session?.type === "agent" && session.roleCode === "ADMIN";

  const totalSlots = creneaux.length;
  const totalCapacity = creneaux.reduce((s, c) => s + c.nombreMax, 0);
  const totalEnrolled = creneaux.reduce((s, c) => s + c._count.abonnements, 0);
  const avgFillRate =
    totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  return (
    <AdminPageShell locale={locale}>
      <div className="space-y-6">
        {/* ── Page header ── */}
        <AdminPageHeader
          title={t("creneauxUi.pageTitle")}
          description={t("creneauxUi.description")}
          icon={<Clock className="h-5 w-5" />}
          actions={
            canCreateCreneau ? (
              <CreateCreneauDialog
                locale={locale}
                oneBasedWeek={oneBasedWeek}
                saisons={saisons}
                disciplines={disciplines}
              />
            ) : null
          }
        />

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label={t("creneauxUi.stats.totalSlots")}
            value={totalSlots}
            icon={Clock}
          />
          <StatCard
            label={t("creneauxUi.stats.totalCapacity")}
            value={totalCapacity}
            icon={Users}
          />
          <StatCard
            label={t("creneauxUi.stats.enrolled")}
            value={totalEnrolled}
            icon={Users}
            accent
          />
          <StatCard
            label={t("creneauxUi.stats.fillRate")}
            value={`${avgFillRate}%`}
            icon={ChevronRight}
            accent
          />
        </div>

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-xl border border-border/40 bg-card">
          {/* Table header bar */}
          <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
            <div>
              <h2 className="text-[13px] font-semibold text-foreground">
                {t("creneauxUi.table.title")}
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {t("creneauxUi.table.count", { count: creneaux.length })}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-muted/20">
                  {[
                    t("creneauxUi.table.discipline"),
                    t("creneauxUi.table.space"),
                    t("creneauxUi.table.day"),
                    t("creneauxUi.table.schedule"),
                    t("creneauxUi.table.group"),
                    t("creneauxUi.table.enrolled"),
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border/20">
                {creneaux.map((creneau) => {
                  const dayKey = getDayKey(creneau.jourSemaine, oneBasedWeek);
                  const pct =
                    creneau.nombreMax > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (creneau._count.abonnements / creneau.nombreMax) *
                              100,
                          ),
                        )
                      : 0;
                  const fill = getFillMeta(pct);

                  return (
                    <tr
                      key={creneau.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      {/* Discipline */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                          <span className="text-[13px] font-medium text-foreground">
                            {creneau.discipline.designation}
                          </span>
                        </div>
                      </td>

                      {/* Space */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                          <span
                            className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                            style={{ background: "#EEEDFE", color: "#3C3489" }}
                          >
                            {creneau.discipline.espace.code}
                          </span>
                        </div>
                      </td>

                      {/* Day */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-foreground">
                          <Calendar className="h-3 w-3 text-muted-foreground/60" />
                          {dayKey ? t(`days.${dayKey}`) : "—"}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                          <span className="font-mono text-[12px] text-foreground">
                            {formatTimeForLocale(creneau.heureDebut, locale)}
                            <span className="mx-1 text-muted-foreground/40">
                              –
                            </span>
                            {formatTimeForLocale(creneau.heureFin, locale)}
                          </span>
                        </div>
                      </td>

                      {/* Group */}
                      <td className="px-5 py-4">
                        {creneau.groupe ? (
                          <span className="rounded-md border border-border/40 bg-muted/20 px-2.5 py-1 text-[12px] text-foreground">
                            {creneau.groupe}
                          </span>
                        ) : (
                          <span className="text-[12px] text-muted-foreground/40">
                            —
                          </span>
                        )}
                      </td>

                      {/* Enrolled + fill bar */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5 text-[12px]">
                              <Users className="h-3.5 w-3.5 text-muted-foreground/50" />
                              <span className="font-semibold text-foreground">
                                {creneau._count.abonnements}
                              </span>
                              <span className="text-muted-foreground/50">
                                / {creneau.nombreMax}
                              </span>
                            </div>
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={fill.badgeStyle}
                            >
                              {t(`creneauxUi.status.${fill.labelKey}`)}
                            </span>
                          </div>
                          {/* Fill bar */}
                          <div className="h-1 w-full overflow-hidden rounded-full bg-muted/40">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${pct}%`,
                                background: fill.barColor,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {creneaux.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/40 bg-muted/20">
                <Clock className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-[13px] text-muted-foreground">
                {t("creneauxUi.empty")}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}
