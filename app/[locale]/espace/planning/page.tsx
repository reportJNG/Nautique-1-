import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { getEspacePlanningData } from "@/lib/espace";
import { Badge } from "@/components/ui/badge";
import { CalendarRange, Clock3, Waves } from "lucide-react";

export default async function PlanningPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "espace.planning" });
  const session = await getSession();

  if (!session || session.type !== "adherent") {
    return null;
  }

  const data = await getEspacePlanningData(session.id);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border/50 bg-white/75 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-200">
              {t("badge")}
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              icon={<CalendarRange className="size-4" />}
              label={t("metrics.followedOffers")}
              value={String(data.activeOffers)}
            />
            <MetricCard
              icon={<Clock3 className="size-4" />}
              label={t("metrics.activeSlots")}
              value={String(data.totalSlots)}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {data.planning.map((day) => (
          <section
            key={day.day}
            className="rounded-[32px] border border-border/50 bg-white/80 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                <Waves className="size-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {day.day}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {day.slots.length > 0
                    ? t("daySubtitle", { count: day.slots.length })
                    : t("dayEmptySubtitle")}
                </p>
              </div>
            </div>

            <div className="mt-6">
              {day.slots.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border/70 px-4 py-8 text-sm text-muted-foreground">
                  {t("emptyDay")}
                </div>
              ) : (
                <div className="space-y-3">
                  {day.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="rounded-[24px] border border-border/50 bg-background/70 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {slot.discipline}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {slot.espace} - {slot.season}
                          </p>
                        </div>
                        <Badge variant="outline">{slot.status}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                          {slot.category}
                        </span>
                        {slot.group ? (
                          <span className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                            {slot.group}
                          </span>
                        ) : null}
                        {slot.coaches.map((coach) => (
                          <span
                            key={`${slot.id}-${coach}`}
                            className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground"
                          >
                            {coach}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-800 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-200">
                        {slot.start} - {slot.end}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] border border-border/50 bg-background/70 p-4">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
        {icon}
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
