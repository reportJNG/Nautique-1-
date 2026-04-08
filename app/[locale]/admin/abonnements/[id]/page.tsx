import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  User,
  Dumbbell,
  Waves,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ReceiptText,
} from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { AbonnementDetailActions } from "./AbonnementDetailActions";

async function getAbonnement(id: number) {
  return prisma.abonnement.findUnique({
    where: { id },
    include: {
      adherent: true,
      discipline: { include: { espace: true } },
      saison: true,
      categorieAge: true,
      factures: { orderBy: { dateCreation: "desc" } },
    },
  });
}

export default async function AbonnementDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const dateLocale = locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";
  const abonnement = await getAbonnement(Number.parseInt(id, 10));

  if (!abonnement) {
    notFound();
  }

  const initials =
    `${abonnement.adherent.prenom?.[0] ?? ""}${abonnement.adherent.nom?.[0] ?? ""}`.toUpperCase();

  const statusBadge: Record<string, { cls: string; icon: React.ReactNode }> = {
    ACT: {
      cls: "bg-primary/12 text-primary border border-primary/25",
      icon: <CheckCircle2 size={11} />,
    },
    CRE: {
      cls: "bg-primary/12 text-primary border border-primary/25",
      icon: <Clock size={11} />,
    },
    ATP: {
      cls: "bg-primary/12 text-primary border border-primary/25",
      icon: <Clock size={11} />,
    },
    APP: {
      cls: "bg-primary/12 text-primary border border-primary/25",
      icon: <CheckCircle2 size={11} />,
    },
    ANL: {
      cls: "bg-muted/12 text-muted-foreground border border-muted/20",
      icon: <XCircle size={11} />,
    },
    EXP: {
      cls: "bg-destructive/12 text-destructive border border-destructive/25",
      icon: <XCircle size={11} />,
    },
    ATT: {
      cls: "bg-primary/12 text-primary border border-primary/25",
      icon: <Clock size={11} />,
    },
  };

  const invoiceStatusStyle: Record<string, string> = {
    PAY: "bg-primary/12 text-primary border border-primary/25",
    ATT: "bg-primary/12 text-primary border border-primary/25",
    ANN: "bg-muted/12 text-muted-foreground border border-muted/20",
  };

  const currentStatus =
    statusBadge[abonnement.statut] ?? {
      cls: "bg-muted/12 text-muted-foreground border border-muted/20",
      icon: null,
    };

  return (
    <AdminPageShell locale={locale}>
      <Link
        href={`/${locale}/admin/abonnements`}
        className="mb-6 inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/10 px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground no-underline transition-all duration-150 hover:bg-muted/15 hover:text-foreground"
      >
        <ArrowLeft size={14} />
        {t("abonnementsUi.pageTitle")}
      </Link>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-3.5">
          <div className="overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 border-b border-border/30 px-[18px] pb-[11px] pt-[13px]">
              <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/12 text-primary">
                <Dumbbell size={14} />
              </div>
              <span className="text-[13px] font-semibold text-foreground">
                {t("abonnementsUi.detail.cards.informations")}
              </span>
            </div>

            <div className="p-[18px]">
              <div className="mb-[18px] flex items-center gap-4 border-b border-border/30 pb-[18px]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-base font-extrabold text-primary-foreground">
                  {initials}
                </div>
                <div>
                  <div className="text-base font-bold text-foreground">
                    {abonnement.adherent.prenom} {abonnement.adherent.nom}
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {abonnement.adherent.numeroDossier}
                  </div>
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-3 border-b border-border/20 py-2.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Dumbbell size={12} />
                  {t("abonnementsUi.detail.labels.discipline")}
                </span>
                <span className="text-right text-[13.5px] font-semibold text-foreground">
                  {abonnement.discipline.designation}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3 border-b border-border/20 py-2.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Waves size={12} />
                  {t("abonnementsUi.detail.labels.space")}
                </span>
                <span className="text-right text-[13.5px] font-semibold text-foreground">
                  {abonnement.discipline.espace.code} - {abonnement.discipline.espace.designation}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3 border-b border-border/20 py-2.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  {t("abonnementsUi.detail.labels.season")}
                </span>
                <span className="text-right text-[13.5px] font-semibold text-foreground">
                  {abonnement.saison.designation}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3 border-b border-border/20 py-2.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CreditCard size={12} />
                  {t("abonnementsUi.detail.labels.type")}
                </span>
                <span className="text-right text-[13.5px] font-semibold text-foreground">
                  {abonnement.typeAbonnement}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3 py-2.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {t("abonnementsUi.detail.labels.status")}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${currentStatus.cls}`}
                >
                  {currentStatus.icon}
                  {t(`abonnementStatus.${abonnement.statut}`)}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 border-b border-border/30 px-[18px] pb-[11px] pt-[13px]">
              <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/12 text-primary">
                <ReceiptText size={14} />
              </div>
              <span className="text-[13px] font-semibold text-foreground">
                {t("abonnementsUi.detail.invoicesTitle", {
                  count: abonnement.factures.length,
                })}
              </span>
            </div>

            <div className="px-[18px]">
              {abonnement.factures.length === 0 ? (
                <div className="py-5 text-center text-[12.5px] text-muted-foreground">
                  {t("abonnementsUi.detail.noInvoices")}
                </div>
              ) : (
                abonnement.factures.map((facture) => (
                  <div
                    key={facture.id}
                    className="flex items-center justify-between gap-2.5 border-b border-border/20 py-2.5 last:border-b-0"
                  >
                    <div>
                      <div className="text-xs font-mono text-primary">
                        {facture.numeroRecu || "-"}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground">
                        {new Date(facture.dateCreation).toLocaleDateString(dateLocale)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[13px] font-bold text-foreground">
                        {Number(facture.montantTtc).toLocaleString(dateLocale)} DA
                      </span>
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          invoiceStatusStyle[facture.statut] ||
                          "bg-primary/12 text-primary border border-primary/25"
                        }`}
                      >
                        {t(`factureStatus.${facture.statut}`)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 border-b border-border/30 px-[18px] pb-[11px] pt-[13px]">
              <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/12 text-primary">
                <CreditCard size={14} />
              </div>
              <span className="text-[13px] font-semibold text-foreground">
                {t("abonnementsUi.detail.labels.amount")}
              </span>
            </div>

            <div className="p-5 text-center">
              <div className="text-2xl font-extrabold tracking-tight text-foreground">
                {Number(abonnement.montantTtc).toLocaleString(dateLocale)}
                <span className="text-sm font-normal text-muted-foreground"> DA</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 border-b border-border/30 px-[18px] pb-[11px] pt-[13px]">
              <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/12 text-primary">
                <User size={14} />
              </div>
              <span className="text-[13px] font-semibold text-foreground">
                {t("abonnementsUi.detail.cards.actions")}
              </span>
            </div>

            <div className="p-[18px]">
              <AbonnementDetailActions
                abonnementId={abonnement.id}
                statut={abonnement.statut}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
