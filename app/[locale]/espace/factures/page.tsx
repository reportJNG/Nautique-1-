import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { getEspaceFacturesData } from "@/lib/espace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CreditCard, Receipt, ShieldCheck, Wallet } from "lucide-react";
import { STATUT_FACTURE_STYLES } from "@/lib/constants";

export default async function FacturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "espace.invoices" });
  const tPayment = await getTranslations({
    locale,
    namespace: "espace.client.abonnementPayment",
  });
  const session = await getSession();

  if (!session || session.type !== "adherent") {
    return null;
  }

  const data = await getEspaceFacturesData(session.id);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border/50 bg-white/75 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
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
            <MetricCard icon={Receipt} label={t("metrics.total")} value={String(data.total)} />
            <MetricCard icon={CreditCard} label={t("metrics.pending")} value={String(data.pending)} />
            <MetricCard icon={ShieldCheck} label={t("metrics.paid")} value={String(data.paid)} />
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-border/50 bg-white/80 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{t("outstanding.title")}</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">{data.outstandingAmount}</p>
          </div>
          <Button asChild variant="outline" className="h-11 rounded-2xl">
            <Link href={`/${locale}/espace/support`}>{t("outstanding.cta")}</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4">
        {data.items.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-border/70 bg-white/70 px-6 py-16 text-center shadow-sm backdrop-blur dark:bg-slate-950/40">
            <div className="mx-auto flex size-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-cyan-500 to-sky-700 text-white shadow-lg">
              <Wallet className="size-7" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-foreground">{t("empty.title")}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {t("empty.description")}
            </p>
          </div>
        ) : (
          data.items.map((facture) => (
            <article
              key={facture.id}
              className="rounded-[30px] border border-border/50 bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-slate-950/50"
            >
              <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                      <Receipt className="size-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-foreground">{facture.receiptNumber}</h2>
                        <Badge className={STATUT_FACTURE_STYLES[facture.statusCode]}>
                          {facture.statusLabel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {facture.discipline} • {facture.espace} • {facture.saison}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <InfoCard label={t("cards.amount")} value={facture.amount} />
                    <InfoCard label={t("cards.created")} value={facture.createdAt} />
                    <InfoCard label={t("cards.payment")} value={facture.paidAt ?? t("cards.pending")} />
                    <InfoCard
                      label={t("cards.mode")}
                      value={
                        facture.statusCode === "PAY"
                          ? facture.mode === "CRD"
                            ? tPayment("payment.card.title")
                            : tPayment("payment.cash.title")
                          : t("cards.pending")
                      }
                    />
                  </div>
                </div>

                <div className="rounded-[28px] border border-border/50 bg-background/70 p-5">
                  <p className="text-sm font-semibold text-foreground">{t("quickAction.title")}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {facture.statusCode === "ATT"
                      ? t("quickAction.pendingDescription")
                      : t("quickAction.paidDescription")}
                  </p>
                  <Button asChild variant="ghost" className="mt-4 rounded-2xl px-0 text-cyan-700 dark:text-cyan-300">
                    <Link href={`/${locale}/espace/support`}>
                      {t("quickAction.cta")}
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
