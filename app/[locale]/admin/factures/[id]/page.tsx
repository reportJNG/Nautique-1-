import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer, FileText, User, Hash, Dumbbell, CreditCard, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { FactureDetailActions } from "./FactureDetailActions";

async function getFacture(id: number) {
  return prisma.facture.findUnique({
    where: { id },
    include: { adherent: true, abonnement: { include: { discipline: true } } },
  });
}

export default async function FactureDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const dateLocale = locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";
  const facture = await getFacture(parseInt(id));
  if (!facture) notFound();

  const isPaid = facture.statut === "PAY";
  const methodEmoji: Record<string, string> = { ESP: "💵", VIR: "🏦", CHQ: "📄", TPE: "💳", CSH: "💵", CRT: "💳" };

  return (
    <AdminPageShell locale={locale}>
      {/* Back button */}
      <Link
        href={`/${locale}/admin/factures`}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-muted/10 border border-border/50 text-muted-foreground text-[13px] font-medium no-underline hover:bg-muted/15 hover:text-foreground transition-all duration-150 mb-6"
      >
        <ArrowLeft size={14} />
        {t("facturesUi.listTitle")}
      </Link>

      <div className="grid gap-5 md:grid-cols-[1fr_auto] items-start">
        {/* Receipt Card */}
        <div className="rounded-2xl overflow-hidden border border-border/50 bg-card/90 backdrop-blur-md w-full max-w-[540px]">
          {/* Receipt Header */}
          <div className="relative text-center px-7 pt-6 pb-5 bg-gradient-to-br from-primary/8 to-primary/4 border-b border-border/30">
            <div className="text-[11px] font-extrabold tracking-[0.15em] text-primary uppercase mb-1">
              Centre Nautique SONATRACH
            </div>
            <div className="text-xl font-extrabold text-foreground">
              {t("facturesUi.detail.receipt.headerTitle")}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t("facturesUi.detail.receipt.subtitle")}
            </div>
          </div>

          {/* Status Row */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-border/30 bg-muted/10">
            <span className="font-mono text-[13px] font-bold text-primary">
              {facture.numeroRecu || "—"}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold ${isPaid
                ? "bg-primary/12 text-primary border border-primary/25"
                : "bg-accent/12 text-accent border border-accent/25"
              }`}>
              {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
              {t(`factureStatus.${facture.statut}`)}
            </span>
          </div>

          {/* Receipt Body */}
          <div className="px-6 py-5 flex flex-col gap-0">
            <div className="flex items-center justify-between py-2.5 border-b border-border/20 gap-3">
              <div className="flex items-center gap-2">
                <User size={13} className="text-muted-foreground shrink-0" />
                <span className="text-[12.5px] text-muted-foreground">{t("facturesUi.detail.labels.member")}</span>
              </div>
              <span className="text-[13.5px] font-semibold text-foreground text-right">
                {facture.adherent.prenom} {facture.adherent.nom}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 border-b border-border/20 gap-3">
              <div className="flex items-center gap-2">
                <Hash size={13} className="text-muted-foreground shrink-0" />
                <span className="text-[12.5px] text-muted-foreground">{t("facturesUi.detail.labels.fileNumber")}</span>
              </div>
              <span className="text-[13.5px] font-semibold text-foreground text-right font-mono">
                {facture.adherent.numeroDossier}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 border-b border-border/20 gap-3">
              <div className="flex items-center gap-2">
                <Dumbbell size={13} className="text-muted-foreground shrink-0" />
                <span className="text-[12.5px] text-muted-foreground">{t("facturesUi.detail.labels.discipline")}</span>
              </div>
              <span className="text-[13.5px] font-semibold text-foreground text-right">
                {facture.abonnement.discipline.designation}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 border-b border-border/20 gap-3">
              <div className="flex items-center gap-2">
                <CreditCard size={13} className="text-muted-foreground shrink-0" />
                <span className="text-[12.5px] text-muted-foreground">{t("facturesUi.detail.labels.paymentMethod")}</span>
              </div>
              <span className="text-[13.5px] font-semibold text-foreground text-right">
                {methodEmoji[facture.modePaiement] ?? "💳"} {t(`paymentMethods.${facture.modePaiement}`)}
              </span>
            </div>
          </div>

          {/* Total Row */}
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-primary/15 bg-primary/4">
            <span className="text-sm font-bold text-foreground">{t("facturesUi.detail.labels.totalAmount")}</span>
            <span className="text-lg font-extrabold text-foreground text-right">
              {Number(facture.montantTtc).toLocaleString(dateLocale)} DA
            </span>
          </div>

          {/* Paid On Date */}
          {facture.datePaiement && (
            <div className="text-center py-3 pb-5 text-xs text-muted-foreground">
              {t("facturesUi.detail.paidOn", {
                date: new Date(facture.datePaiement).toLocaleDateString(dateLocale),
              })}
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="flex flex-col gap-2.5 min-w-[200px]">
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="px-4 pt-3 pb-2.5 border-b border-border/30 text-xs font-bold text-muted-foreground tracking-wide uppercase">
              Actions
            </div>
            <div className="p-3.5 flex flex-col gap-2">
              {!isPaid && (
                <FactureDetailActions factureId={facture.id} locale={locale} />
              )}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 justify-center py-2.5 px-4 rounded-lg w-full bg-muted/10 border border-border/50 text-muted-foreground text-[13px] font-medium cursor-pointer transition-all duration-150 hover:bg-muted/15 hover:text-foreground [&_svg]:w-[14px]"
                onClick={() => window.print()}
              >
                <Printer size={14} />
                {t("facturesUi.detail.print")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}