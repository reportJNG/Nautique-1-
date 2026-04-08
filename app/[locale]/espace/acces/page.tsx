import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { getEspaceAccessData } from "@/lib/espace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  CalendarDays,
  ChevronRight,
  ScanLine,
  ShieldCheck,
  ShieldX,
  Waves,
} from "lucide-react";

export default async function AccesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "espace.access" });
  const session = await getSession();

  if (!session || session.type !== "adherent") {
    return null;
  }

  const data = await getEspaceAccessData(session.id);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border/50 bg-white/75 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
              {t("eyebrow")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <MetricCard icon={ScanLine} label={t("metrics.total")} value={String(data.total)} />
            <MetricCard icon={ShieldCheck} label={t("metrics.authorized")} value={String(data.authorized)} />
            <MetricCard icon={ShieldX} label={t("metrics.denied")} value={String(data.denied)} />
          </div>
        </div>
      </section>

      {data.sessions.length === 0 ? (
        <section className="rounded-[32px] border border-dashed border-border/70 bg-white/70 px-6 py-16 text-center shadow-sm backdrop-blur dark:bg-slate-950/40">
          <div className="mx-auto flex size-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg dark:from-slate-100 dark:to-slate-300 dark:text-slate-900">
            <ScanLine className="size-7" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-foreground">{t("empty.title")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t("empty.description")}
          </p>
          <Button asChild variant="ghost" className="mt-6 rounded-2xl">
            <Link href="/espace/abonnements">
              {t("empty.cta")}
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </section>
      ) : (
        <section className="rounded-[32px] border border-border/50 bg-white/75 p-5 shadow-sm backdrop-blur dark:bg-slate-950/50">
          <div className="space-y-3">
            {data.sessions.map((sessionItem) => (
              <div
                key={sessionItem.id}
                className="grid gap-4 rounded-[28px] border border-border/50 bg-background/70 p-4 lg:grid-cols-[0.9fr_1.2fr_0.8fr]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-700 text-white shadow-lg">
                    <Waves className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{sessionItem.discipline}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {sessionItem.date} • {sessionItem.time}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-white/70 px-3 py-1 text-xs text-muted-foreground dark:bg-slate-950/50">
                    <CalendarDays className="size-3.5" />
                    {sessionItem.slot}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("validation", {
                      mode: sessionItem.badge ? t("badgeMode") : t("manualMode"),
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-start lg:justify-end">
                  <Badge
                    variant={sessionItem.authorized ? "secondary" : "destructive"}
                    className={
                      sessionItem.authorized
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : ""
                    }
                  >
                    {sessionItem.authorized ? t("authorized") : t("denied")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] border border-border/50 bg-background/70 p-4">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
        <Icon className="size-4" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
