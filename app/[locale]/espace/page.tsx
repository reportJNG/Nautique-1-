import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { getEspaceDashboardData, getEspaceShellData } from "@/lib/espace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CreditCard,
  ScanLine,
  Sparkles,
  Waves,
} from "lucide-react";
import {
  STATUT_ABONNEMENT_STYLES,
  STATUT_FACTURE_STYLES,
} from "@/lib/constants";

export default async function EspaceDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "espace.dashboard" });
  const session = await getSession();

  if (!session || session.type !== "adherent") {
    return null;
  }

  const [shellData, data] = await Promise.all([
    getEspaceShellData(session.id),
    getEspaceDashboardData(session.id),
  ]);

  if (!shellData) {
    return null;
  }

  const highlights = [
    {
      label: t("highlights.subscriptions"),
      value: data.totals.abonnements,
      icon: CalendarDays,
      tone: "from-cyan-500 to-sky-600",
    },
    {
      label: t("highlights.activeDisciplines"),
      value: data.totals.disciplines,
      icon: Waves,
      tone: "from-sky-500 to-blue-700",
    },
    {
      label: t("highlights.pendingInvoices"),
      value: data.totals.pendingFactures,
      icon: CreditCard,
      tone: "from-amber-400 to-orange-500",
    },
    {
      label: t("highlights.recentAccess"),
      value: data.recentAccess.length,
      icon: ScanLine,
      tone: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-border/50 bg-[linear-gradient(135deg,rgba(8,145,178,0.98),rgba(14,116,144,0.96),rgba(15,23,42,0.96))] p-6 text-white shadow-[0_30px_80px_rgba(8,145,178,0.24)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div>
            <Badge className="border-white/10 bg-white/10 text-white backdrop-blur">
              {t("hero.badge")}
            </Badge>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("hero.title", { firstName: shellData.adherent.prenom })}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-cyan-50/90 sm:text-base">
              {t("hero.subtitle")}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                className="h-11 rounded-2xl bg-white text-slate-900 hover:bg-cyan-50"
              >
                <Link href={`/${locale}/espace/abonnements/nouveau`}>
                  {t("hero.primaryCta")}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/15"
              >
                <Link href={`/${locale}/espace/acces`}>
                  {t("hero.secondaryCta")}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-cyan-50">
                <Sparkles className="size-4" />
                <p className="text-sm font-semibold">{t("nextSession.title")}</p>
              </div>
              {data.nextSession ? (
                <>
                  <p className="mt-3 text-lg font-semibold">
                    {data.nextSession.discipline}
                  </p>
                  <p className="mt-1 text-sm text-cyan-50/90">
                    {data.nextSession.date} • {data.nextSession.start} -{" "}
                    {data.nextSession.end}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-cyan-50/90">
                  {t("nextSession.empty")}
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-4 backdrop-blur">
              <p className="text-sm font-semibold">{t("contact.title")}</p>
              <p className="mt-3 text-sm text-cyan-50/90">
                {shellData.centre?.emailCentre ?? t("contact.emailUnavailable")}
              </p>
              <p className="mt-1 text-sm text-cyan-50/90">
                {shellData.centre?.telephoneCentre ??
                  t("contact.phoneUnavailable")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {highlights.map((item) => (
          <div
            key={item.label}
            className="rounded-[28px] border border-border/50 bg-white/75 p-5 shadow-sm backdrop-blur dark:bg-slate-950/50"
          >
            <div
              className={`inline-flex rounded-2xl bg-gradient-to-br ${item.tone} p-3 text-white shadow-lg`}
            >
              <item.icon className="size-5" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-foreground">
              {item.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-[30px] border border-border/50 bg-white/75 p-5 shadow-sm backdrop-blur dark:bg-slate-950/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {t("subscriptions.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("subscriptions.subtitle")}
              </p>
            </div>
            <Button asChild variant="ghost" className="rounded-2xl">
              <Link href={`/${locale}/espace/abonnements`}>
                {t("subscriptions.viewAll")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {data.abonnements.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/70 px-4 py-10 text-center">
                <p className="text-base font-semibold text-foreground">
                  {t("subscriptions.emptyTitle")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("subscriptions.emptyDescription")}
                </p>
              </div>
            ) : (
              data.abonnements.slice(0, 4).map((abonnement) => (
                <div
                  key={abonnement.id}
                  className="flex flex-col gap-3 rounded-3xl border border-border/50 bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-foreground">
                        {abonnement.discipline.designation}
                      </p>
                      <Badge
                        className={
                          STATUT_ABONNEMENT_STYLES[abonnement.statut]
                        }
                      >
                        {abonnement.statut}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {abonnement.discipline.espace.designation} •{" "}
                      {abonnement.saison.designation}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("subscriptions.period", {
                        start: new Intl.DateTimeFormat(locale, {
                          day: "numeric",
                          month: "short",
                        }).format(abonnement.dateDebut),
                        end: new Intl.DateTimeFormat(locale, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }).format(abonnement.dateFin),
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <p className="text-lg font-semibold text-foreground">
                      {new Intl.NumberFormat(locale, {
                        style: "currency",
                        currency: "DZD",
                      }).format(Number(abonnement.montantTtc))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("subscriptions.slotsCount", {
                        count: abonnement.creneaux.length,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-border/50 bg-white/75 p-5 shadow-sm backdrop-blur dark:bg-slate-950/50">
            <h2 className="text-lg font-semibold text-foreground">
              {t("invoices.title")}
            </h2>
            <div className="mt-4 space-y-3">
              {data.recentFactures.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("invoices.empty")}
                </p>
              ) : (
                data.recentFactures.map((facture) => (
                  <div
                    key={facture.id}
                    className="rounded-3xl border border-border/50 bg-background/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">
                        {facture.discipline}
                      </p>
                      <Badge
                        className={
                          STATUT_FACTURE_STYLES[facture.statusCode]
                        }
                      >
                        {facture.statut}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {facture.createdAt}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {facture.amount}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-border/50 bg-white/75 p-5 shadow-sm backdrop-blur dark:bg-slate-950/50">
            <h2 className="text-lg font-semibold text-foreground">
              {t("access.title")}
            </h2>
            <div className="mt-4 space-y-3">
              {data.recentAccess.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("access.empty")}
                </p>
              ) : (
                data.recentAccess.map((access) => (
                  <div
                    key={access.id}
                    className="flex items-center gap-3 rounded-3xl border border-border/50 bg-background/70 p-4"
                  >
                    <div className="rounded-2xl bg-slate-900 p-3 text-white dark:bg-slate-100 dark:text-slate-900">
                      <Activity className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {access.discipline}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {access.date} • {access.time}
                      </p>
                    </div>
                    <Badge
                      variant={
                        access.authorized ? "secondary" : "destructive"
                      }
                      className={
                        access.authorized
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                          : ""
                      }
                    >
                      {access.authorized
                        ? t("access.authorized")
                        : t("access.denied")}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
