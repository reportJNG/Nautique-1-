import React from "react";
import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { notFound } from "next/navigation";
import {
  ArrowLeft, User, Dumbbell, Waves, CreditCard, Calendar,
  CheckCircle2, Clock, XCircle, ReceiptText
} from "lucide-react";
import Link from "next/link";
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
  const abo = await getAbonnement(parseInt(id));
  if (!abo) notFound();

  const initials = `${abo.adherent.prenom?.[0] ?? ""}${abo.adherent.nom?.[0] ?? ""}`.toUpperCase();

  const statusBadge: Record<string, { cls: string; icon: React.ReactNode }> = {
    ACT: { cls: "bg-primary/12 text-primary border border-primary/25", icon: <CheckCircle2 size={11} /> },
    CRE: { cls: "bg-primary/12 text-primary border border-primary/25", icon: <Clock size={11} /> },
    ATP: { cls: "bg-primary/12 text-primary border border-primary/25", icon: <Clock size={11} /> },
    APP: { cls: "bg-primary/12 text-primary border border-primary/25", icon: <CheckCircle2 size={11} /> },
    ANL: { cls: "bg-muted/12 text-muted-foreground border border-muted/20", icon: <XCircle size={11} /> },
    EXP: { cls: "bg-destructive/12 text-destructive border border-destructive/25", icon: <XCircle size={11} /> },
    ATT: { cls: "bg-primary/12 text-primary border border-primary/25", icon: <Clock size={11} /> },
  };
  const sb = statusBadge[abo.statut] ?? { cls: "bg-muted/12 text-muted-foreground border border-muted/20", icon: null };

  const factureStatusStyle: Record<string, string> = {
    PAY: "bg-primary/12 text-primary border border-primary/25",
    ATT: "bg-primary/12 text-primary border border-primary/25",
    ANN: "bg-muted/12 text-muted-foreground border border-muted/20",
  };

  return (
    <AdminPageShell locale={locale}>
      {/* Back button */}
      <Link
        href={`/${locale}/admin/abonnements`}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-muted/10 border border-border/50 text-muted-foreground text-[13px] font-medium no-underline hover:bg-muted/15 hover:text-foreground transition-all duration-150 mb-6"
      >
        <ArrowLeft size={14} />
        {t("abonnementsUi.pageTitle")}
      </Link>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Main info column */}
        <div className="flex flex-col gap-3.5">
          {/* Informations Card */}
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-[18px] pt-[13px] pb-[11px] border-b border-border/30">
              <div className="w-[30px] h-[30px] rounded-lg bg-primary/12 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Dumbbell size={14} />
              </div>
              <span className="text-[13px] font-semibold text-foreground">
                {t("abonnementsUi.detail.cards.informations")}
              </span>
            </div>

            <div className="p-[18px]">
              {/* Adherent hero */}
              <div className="flex items-center gap-4 mb-[18px] pb-[18px] border-b border-border/30">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-base font-extrabold text-primary-foreground shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="text-base font-bold text-foreground">
                    {abo.adherent.prenom} {abo.adherent.nom}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {abo.adherent.numeroDossier}
                  </div>
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-3 py-2.5 border-b border-border/20">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Dumbbell size={12} />
                  {t("abonnementsUi.detail.labels.discipline")}
                </span>
                <span className="text-[13.5px] font-semibold text-foreground text-right">
                  {abo.discipline.designation}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3 py-2.5 border-b border-border/20">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Waves size={12} />
                  {t("abonnementsUi.detail.labels.space")}
                </span>
                <span className="text-[13.5px] font-semibold text-foreground text-right">
                  {abo.discipline.espace.code} — {abo.discipline.espace.designation}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3 py-2.5 border-b border-border/20">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar size={12} />
                  Saison
                </span>
                <span className="text-[13.5px] font-semibold text-foreground text-right">
                  {abo.saison.designation}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3 py-2.5 border-b border-border/20">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CreditCard size={12} />
                  Type
                </span>
                <span className="text-[13.5px] font-semibold text-foreground text-right">
                  {abo.typeAbonnement}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3 py-2.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  {t("abonnementsUi.detail.labels.status")}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold ${sb.cls}`}>
                  {sb.icon}
                  {t(`abonnementStatus.${abo.statut}`)}
                </span>
              </div>
            </div>
          </div>

          {/* Factures Card */}
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-[18px] pt-[13px] pb-[11px] border-b border-border/30">
              <div className="w-[30px] h-[30px] rounded-lg bg-primary/12 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <ReceiptText size={14} />
              </div>
              <span className="text-[13px] font-semibold text-foreground">
                Factures ({abo.factures.length})
              </span>
            </div>

            <div className="px-[18px]">
              {abo.factures.length === 0 ? (
                <div className="py-5 text-center text-[12.5px] text-muted-foreground">
                  Aucune facture
                </div>
              ) : (
                abo.factures.map((fac) => (
                  <div key={fac.id} className="flex items-center justify-between gap-2.5 py-2.5 border-b border-border/20 last:border-b-0">
                    <div>
                      <div className="text-xs font-mono text-primary">
                        {fac.numeroRecu || "—"}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground">
                        {new Date(fac.dateCreation).toLocaleDateString(dateLocale)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[13px] font-bold text-foreground">
                        {Number(fac.montantTtc).toLocaleString(dateLocale)} DA
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${factureStatusStyle[fac.statut] ?? "bg-primary/12 text-primary border border-primary/25"}`}>
                        {t(`factureStatus.${fac.statut}`)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Side panel column */}
        <div className="flex flex-col gap-3.5">
          {/* Amount Card */}
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-[18px] pt-[13px] pb-[11px] border-b border-border/30">
              <div className="w-[30px] h-[30px] rounded-lg bg-primary/12 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <CreditCard size={14} />
              </div>
              <span className="text-[13px] font-semibold text-foreground">
                {t("abonnementsUi.detail.labels.amount")}
              </span>
            </div>

            <div className="text-center p-5">
              <div className="text-2xl font-extrabold text-foreground tracking-tight">
                {Number(abo.montantTtc).toLocaleString(dateLocale)}
                <span className="text-sm text-muted-foreground font-normal"> DA</span>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-[18px] pt-[13px] pb-[11px] border-b border-border/30">
              <div className="w-[30px] h-[30px] rounded-lg bg-primary/12 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <User size={14} />
              </div>
              <span className="text-[13px] font-semibold text-foreground">
                {t("abonnementsUi.detail.cards.actions")}
              </span>
            </div>

            <div className="p-[18px]">
              <AbonnementDetailActions
                abonnementId={abo.id}
                statut={abo.statut}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}